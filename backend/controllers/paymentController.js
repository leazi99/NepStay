import applicationModel from "../models/applicationModel.js";
import paymentModel from "../models/paymentModel.js";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
const EMPLOYER_PAYMENT_CURRENCY = "npr";

const ensureEmployer = (req, res) => {
  if (req.user?.role !== "employer") {
    res.status(403).json({
      success: false,
      message: "Only employers can access payments",
    });
    return false;
  }
  return true;
};

const loadAndValidateApplication = async ({ applicationId, employerId }) => {
  const application = await applicationModel
    .findById(applicationId)
    .populate("job", "title company")
    .populate("applicant", "name email avatar");

  if (!application || !application.job) {
    return { error: { status: 404, message: "Application not found" } };
  }

  if (application.job.company.toString() !== employerId.toString()) {
    return {
      error: {
        status: 403,
        message: "You can only pay for your own hired candidates",
      },
    };
  }

  if (!["Accepted", "Hired"].includes(application.status)) {
    return {
      error: {
        status: 400,
        message: "Payment is allowed only for hired applications",
      },
    };
  }

  return { application };
};

const parseAmount = (amount) => {
  const amountNumber = Number(amount);
  if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
    return null;
  }
  return amountNumber;
};

const hasActivePaymentForApplication = async (applicationId) => {
  const existingPayment = await paymentModel.findOne({
    application: applicationId,
    status: { $in: ["pending", "completed"] },
  });

  return Boolean(existingPayment);
};

export const getEmployerPayments = async (req, res) => {
  try {
    if (!ensureEmployer(req, res)) return;

    const payments = await paymentModel
      .find({ employer: req.user.id })
      .populate("job", "title")
      .populate("freelancer", "name email avatar")
      .populate("application", "status")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEligibleHiredApplications = async (req, res) => {
  try {
    if (!ensureEmployer(req, res)) return;

    const applications = await applicationModel
      .find({ status: { $in: ["Accepted", "Hired"] } })
      .populate({ path: "job", select: "title company" })
      .populate("applicant", "name email avatar")
      .sort({ updatedAt: -1 });

    const eligibleApplications = applications.filter(
      (application) =>
        application.job &&
        application.job.company &&
        application.job.company.toString() === req.user.id.toString(),
    );

    const applicationIds = eligibleApplications.map(
      (application) => application._id,
    );
    const blockedPayments = await paymentModel
      .find({
        application: { $in: applicationIds },
        status: { $in: ["pending", "completed"] },
      })
      .select("application");

    const blockedApplicationIds = new Set(
      blockedPayments.map((payment) => payment.application.toString()),
    );

    const filteredApplications = eligibleApplications.filter(
      (application) => !blockedApplicationIds.has(application._id.toString()),
    );

    return res.json({
      success: true,
      applications: filteredApplications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createPayment = async (req, res) => {
  try {
    if (!ensureEmployer(req, res)) return;

    const { applicationId, amount, paymentMethod, notes } = req.body;

    if (!applicationId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Application and amount are required",
      });
    }

    if (await hasActivePaymentForApplication(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Payment already exists for this hired application",
      });
    }

    const application = await applicationModel
      .findById(applicationId)
      .populate("job", "title company")
      .populate("applicant", "name email avatar");

    if (!application || !application.job) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.job.company.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only pay for your own hired candidates",
      });
    }

    if (!["Accepted", "Hired"].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: "Payment is allowed only for hired applications",
      });
    }

    const payment = await paymentModel.create({
      employer: req.user.id,
      freelancer: application.applicant._id,
      job: application.job._id,
      application: application._id,
      amount: Number(amount),
      paymentMethod: paymentMethod || "bank_transfer",
      notes: notes || "",
      status: "completed",
      currency: EMPLOYER_PAYMENT_CURRENCY,
    });

    const populatedPayment = await paymentModel
      .findById(payment._id)
      .populate("job", "title")
      .populate("freelancer", "name email avatar")
      .populate("application", "status");

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      payment: populatedPayment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createStripeCheckoutSession = async (req, res) => {
  try {
    if (!ensureEmployer(req, res)) return;

    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe is not configured on server",
      });
    }

    const { applicationId, amount, notes } = req.body;

    if (!applicationId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Application and amount are required",
      });
    }

    if (await hasActivePaymentForApplication(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Payment already exists for this hired application",
      });
    }

    const application = await applicationModel
      .findById(applicationId)
      .populate("job", "title company")
      .populate("applicant", "name email avatar");

    if (!application || !application.job) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.job.company.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only pay for your own hired candidates",
      });
    }

    if (!["Accepted", "Hired"].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: "Stripe payment is allowed only for hired applications",
      });
    }

    const amountNumber = Number(amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const frontendBaseUrl =
      process.env.FRONTEND_URL || req.headers.origin || "http://localhost:5173";

    const pendingPayment = await paymentModel.create({
      employer: req.user.id,
      freelancer: application.applicant._id,
      job: application.job._id,
      application: application._id,
      amount: amountNumber,
      paymentMethod: "stripe",
      notes: notes || "",
      status: "pending",
      currency: EMPLOYER_PAYMENT_CURRENCY,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: EMPLOYER_PAYMENT_CURRENCY,
            product_data: {
              name: `Freelancer Payment • ${application.job.title}`,
              description: `Payment to ${application.applicant?.name || "freelancer"}`,
            },
            unit_amount: Math.round(amountNumber * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${frontendBaseUrl}/payments?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendBaseUrl}/payments?payment=cancel`,
      metadata: {
        paymentId: pendingPayment._id.toString(),
        employerId: req.user.id.toString(),
        applicationId: application._id.toString(),
      },
    });

    pendingPayment.stripeSessionId = session.id;
    await pendingPayment.save();

    return res.status(201).json({
      success: true,
      message: "Stripe checkout session created",
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createStripePaymentIntent = async (req, res) => {
  try {
    if (!ensureEmployer(req, res)) return;

    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe is not configured on server",
      });
    }

    const { applicationId, amount, notes } = req.body;

    if (!applicationId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Application and amount are required",
      });
    }

    if (await hasActivePaymentForApplication(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Payment already exists for this hired application",
      });
    }

    const amountNumber = parseAmount(amount);
    if (!amountNumber) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const { application, error } = await loadAndValidateApplication({
      applicationId,
      employerId: req.user.id,
    });

    if (error) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    const pendingPayment = await paymentModel.create({
      employer: req.user.id,
      freelancer: application.applicant._id,
      job: application.job._id,
      application: application._id,
      amount: amountNumber,
      paymentMethod: "stripe",
      notes: notes || "",
      status: "pending",
      currency: EMPLOYER_PAYMENT_CURRENCY,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amountNumber * 100),
      currency: EMPLOYER_PAYMENT_CURRENCY,
      automatic_payment_methods: { enabled: true },
      metadata: {
        paymentId: pendingPayment._id.toString(),
        employerId: req.user.id.toString(),
        applicationId: application._id.toString(),
      },
    });

    pendingPayment.stripePaymentIntentId = paymentIntent.id;
    await pendingPayment.save();

    return res.status(201).json({
      success: true,
      message: "Stripe payment initialized",
      paymentId: pendingPayment._id,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const confirmStripePaymentIntent = async (req, res) => {
  try {
    if (!ensureEmployer(req, res)) return;

    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe is not configured on server",
      });
    }

    const { paymentId, paymentIntentId } = req.body;
    if (!paymentId && !paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required",
      });
    }

    const query = paymentId
      ? { _id: paymentId, employer: req.user.id }
      : { stripePaymentIntentId: paymentIntentId, employer: req.user.id };

    const payment = await paymentModel.findOne(query);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.paymentMethod !== "stripe") {
      return res.status(400).json({
        success: false,
        message: "Only Stripe payments are supported by this endpoint",
      });
    }

    const intentId = payment.stripePaymentIntentId || paymentIntentId;
    const intent = await stripe.paymentIntents.retrieve(intentId);

    if (intent.status === "succeeded") {
      payment.status = "completed";
      payment.stripePaymentIntentId = intent.id;
      payment.transactionId = intent.id;
    } else if (
      ["requires_payment_method", "canceled"].includes(intent.status)
    ) {
      payment.status = "failed";
    } else {
      payment.status = "pending";
    }

    await payment.save();

    const populatedPayment = await paymentModel
      .findById(payment._id)
      .populate("job", "title")
      .populate("freelancer", "name email avatar")
      .populate("application", "status");

    return res.json({
      success: true,
      message: "Stripe payment status updated",
      payment: populatedPayment,
      stripeStatus: intent.status,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const stripeWebhookHandler = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).send("Stripe not configured");
    }

    const signature = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return res.status(400).send("Missing stripe signature or webhook secret");
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret,
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const paymentId = session?.metadata?.paymentId;

      if (paymentId) {
        const payment = await paymentModel.findById(paymentId);
        if (payment) {
          payment.status = "completed";
          payment.stripeSessionId = session.id || payment.stripeSessionId;
          payment.stripePaymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : payment.stripePaymentIntentId;
          payment.transactionId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : payment.transactionId;
          await payment.save();
        }
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const paymentId = session?.metadata?.paymentId;
      if (paymentId) {
        await paymentModel.findByIdAndUpdate(paymentId, { status: "failed" });
      }
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const paymentId = paymentIntent?.metadata?.paymentId;

      if (paymentId) {
        await paymentModel.findByIdAndUpdate(paymentId, {
          status: "completed",
          stripePaymentIntentId: paymentIntent.id,
          transactionId: paymentIntent.id,
        });
      } else {
        await paymentModel.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          {
            status: "completed",
            transactionId: paymentIntent.id,
          },
        );
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      const paymentId = paymentIntent?.metadata?.paymentId;

      if (paymentId) {
        await paymentModel.findByIdAndUpdate(paymentId, { status: "failed" });
      } else {
        await paymentModel.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          { status: "failed" },
        );
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
