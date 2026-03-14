import applicationModel from "../models/applicationModel.js";
import paymentModel from "../models/paymentModel.js";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

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

    return res.json({
      success: true,
      applications: eligibleApplications,
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
      currency: "usd",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
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

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
