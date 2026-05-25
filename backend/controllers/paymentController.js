import bookingModel from "../models/bookingModel.js";
import paymentModel from "../models/paymentModel.js";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
const DEFAULT_CURRENCY = process.env.DEFAULT_CURRENCY || "usd";
const KHALTI_INITIATE_URL =
  process.env.KHALTI_INITIATE_URL ||
  "https://dev.khalti.com/api/v2/epayment/initiate/";
const KHALTI_LOOKUP_URL =
  process.env.KHALTI_LOOKUP_URL ||
  "https://dev.khalti.com/api/v2/epayment/lookup/";

const getFrontendBaseUrl = (req) =>
  process.env.FRONTEND_URL || req.headers.origin || "http://localhost:5173";
const getKhaltiSecretKey = () =>
  String(process.env.KHALTI_SECRET_KEY || "").trim();

const ensureStaffOrAdmin = (req, res) => {
  if (!(req.user?.role === "hotelstaff" || req.user?.role === "admin")) {
    res
      .status(403)
      .json({
        success: false,
        message: "Only hotel staff can access payments",
      });
    return false;
  }
  return true;
};

const parseAmount = (amount) => {
  const amountNumber = Number(amount);
  if (!Number.isFinite(amountNumber) || amountNumber <= 0) return null;
  return amountNumber;
};

const callKhaltiApi = async ({ url, payload }) => {
  const secretKey = getKhaltiSecretKey();
  if (!secretKey) throw new Error("Khalti is not configured on server");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Key ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data?.detail || data?.message || "Khalti request failed");
  return data;
};

export const getHotelPayments = async (req, res) => {
  try {
    if (!ensureStaffOrAdmin(req, res)) return;
    const payments = await paymentModel
      .find({})
      .sort({ createdAt: -1 })
      .populate("booking")
      .populate("customer", "name email");
    return res.json({ success: true, payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getEligibleBookings = async (req, res) => {
  try {
    if (!ensureStaffOrAdmin(req, res)) return;
    const bookings = await bookingModel
      .find({ bookingStatus: "confirmed", paymentStatus: { $ne: "paid" } })
      .populate("customer", "name email")
      .populate("room", "title roomNumber")
      .sort({ createdAt: -1 });
    return res.json({ success: true, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createPayment = async (req, res) => {
  try {
    if (!ensureStaffOrAdmin(req, res)) return;
    const { bookingId, amount, paymentMethod, notes } = req.body;
    if (!bookingId || !amount)
      return res
        .status(400)
        .json({ success: false, message: "Booking and amount are required" });
    const booking = await bookingModel
      .findById(bookingId)
      .populate("hotel")
      .populate("customer");
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    const amountNumber = parseAmount(amount);
    if (!amountNumber)
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    const payment = await paymentModel.create({
      booking: booking._id,
      customer: booking.customer._id,
      hotel: booking.hotel._id,
      amount: amountNumber,
      paymentMethod: paymentMethod || "stripe",
      status: "completed",
      currency: DEFAULT_CURRENCY,
      notes: notes || "",
    });
    booking.paymentStatus = "paid";
    await booking.save();
    return res
      .status(201)
      .json({ success: true, message: "Payment recorded", payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createStripeCheckoutSession = async (req, res) => {
  try {
    if (!ensureStaffOrAdmin(req, res)) return;
    if (!stripe)
      return res
        .status(500)
        .json({ success: false, message: "Stripe not configured" });
    const { bookingId, amount } = req.body;
    if (!bookingId || !amount)
      return res
        .status(400)
        .json({ success: false, message: "Booking and amount are required" });
    const booking = await bookingModel
      .findById(bookingId)
      .populate("hotel")
      .populate("customer");
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    const amountNumber = parseAmount(amount);
    if (!amountNumber)
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    const pendingPayment = await paymentModel.create({
      booking: booking._id,
      customer: booking.customer._id,
      hotel: booking.hotel._id,
      amount: amountNumber,
      paymentMethod: "stripe",
      status: "pending",
      currency: DEFAULT_CURRENCY,
    });
    const frontendBaseUrl = getFrontendBaseUrl(req);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: DEFAULT_CURRENCY,
            product_data: {
              name: `Booking • ${booking.room?.title || booking.hotel?.name || "Booking"}`,
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
        bookingId: booking._id.toString(),
      },
    });
    pendingPayment.stripeSessionId = session.id;
    await pendingPayment.save();
    return res
      .status(201)
      .json({ success: true, checkoutUrl: session.url, sessionId: session.id });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmStripePaymentIntent = async (req, res) => {
  try {
    if (!ensureStaffOrAdmin(req, res)) return;
    if (!stripe)
      return res
        .status(500)
        .json({ success: false, message: "Stripe not configured" });
    const { paymentId, paymentIntentId } = req.body;
    if (!paymentId && !paymentIntentId)
      return res
        .status(400)
        .json({ success: false, message: "Payment reference required" });
    const query = paymentId
      ? { _id: paymentId }
      : { stripePaymentIntentId: paymentIntentId };
    const payment = await paymentModel.findOne(query);
    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    const intentId = payment.stripePaymentIntentId || paymentIntentId;
    const intent = await stripe.paymentIntents.retrieve(intentId);
    if (intent.status === "succeeded") {
      payment.status = "completed";
      payment.stripePaymentIntentId = intent.id;
      payment.transactionId = intent.id;
      await payment.save();
      if (payment.booking)
        await bookingModel.findByIdAndUpdate(payment.booking, {
          paymentStatus: "paid",
        });
    } else if (
      ["requires_payment_method", "canceled"].includes(intent.status)
    ) {
      payment.status = "failed";
      await payment.save();
    }
    return res.json({
      success: true,
      message: "Stripe payment status updated",
      stripeStatus: intent.status,
      payment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createKhaltiPaymentSession = async (req, res) => {
  try {
    if (!ensureStaffOrAdmin(req, res)) return;
    const { bookingId, amount } = req.body;
    if (!bookingId || !amount)
      return res
        .status(400)
        .json({ success: false, message: "Booking and amount are required" });
    const booking = await bookingModel
      .findById(bookingId)
      .populate("hotel")
      .populate("customer");
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    const amountNumber = parseAmount(amount);
    if (!amountNumber)
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    const pendingPayment = await paymentModel.create({
      booking: booking._id,
      customer: booking.customer._id,
      hotel: booking.hotel._id,
      amount: amountNumber,
      paymentMethod: "khalti",
      status: "pending",
      currency: DEFAULT_CURRENCY,
    });
    try {
      const frontendBaseUrl = getFrontendBaseUrl(req);
      const returnUrl = `${frontendBaseUrl}/payments?khalti_success=1&paymentId=${pendingPayment._id.toString()}`;
      const khaltiResponse = await callKhaltiApi({
        url: KHALTI_INITIATE_URL,
        payload: {
          return_url: returnUrl,
          website_url: frontendBaseUrl,
          amount: Math.round(amountNumber * 100),
          purchase_order_id: pendingPayment._id.toString(),
          purchase_order_name: `Booking • ${booking.hotel?.name || "Booking"}`,
        },
      });
      pendingPayment.khaltiPidx = String(khaltiResponse?.pidx || "");
      if (pendingPayment.khaltiPidx)
        pendingPayment.transactionId = pendingPayment.khaltiPidx;
      await pendingPayment.save();
      return res
        .status(201)
        .json({
          success: true,
          paymentId: pendingPayment._id,
          pidx: khaltiResponse?.pidx || "",
          paymentUrl: khaltiResponse?.payment_url || "",
        });
    } catch (gatewayError) {
      await paymentModel.findByIdAndDelete(pendingPayment._id);
      return res
        .status(502)
        .json({
          success: false,
          message:
            gatewayError.message || "Unable to initialize Khalti payment",
        });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmKhaltiPayment = async (req, res) => {
  try {
    if (!ensureStaffOrAdmin(req, res)) return;
    const { paymentId, pidx } = req.body;
    if (!paymentId && !pidx)
      return res
        .status(400)
        .json({ success: false, message: "Payment reference is required" });
    const query = paymentId ? { _id: paymentId } : { khaltiPidx: pidx };
    const payment = await paymentModel.findOne(query);
    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    if (payment.paymentMethod !== "khalti")
      return res
        .status(400)
        .json({
          success: false,
          message: "Only Khalti payments are supported by this endpoint",
        });
    const lookupPidx = String(payment.khaltiPidx || pidx || "").trim();
    if (!lookupPidx)
      return res
        .status(400)
        .json({
          success: false,
          message: "Khalti payment reference is missing",
        });
    const khaltiResponse = await callKhaltiApi({
      url: KHALTI_LOOKUP_URL,
      payload: { pidx: lookupPidx },
    });
    const khaltiStatus = String(khaltiResponse?.status || "").toLowerCase();
    payment.khaltiPidx = lookupPidx;
    if (khaltiStatus === "completed") {
      payment.status = "completed";
      payment.khaltiTransactionId = String(
        khaltiResponse?.transaction_id || "",
      );
      payment.transactionId =
        payment.khaltiTransactionId || lookupPidx || payment.transactionId;
      await payment.save();
      if (payment.booking)
        await bookingModel.findByIdAndUpdate(payment.booking, {
          paymentStatus: "paid",
        });
    } else if (["pending", "initiated"].includes(khaltiStatus)) {
      payment.status = "pending";
      await payment.save();
    } else {
      payment.status = "failed";
      await payment.save();
    }
    return res.json({
      success: true,
      message: "Khalti payment status updated",
      payment,
      khaltiStatus: khaltiResponse?.status || "",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const stripeWebhookHandler = async (req, res) => {
  try {
    if (!stripe) return res.status(500).send("Stripe not configured");
    const signature = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!signature || !webhookSecret)
      return res.status(400).send("Missing stripe signature or webhook secret");
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
          if (payment.booking)
            await bookingModel.findByIdAndUpdate(payment.booking, {
              paymentStatus: "paid",
            });
        }
      }
    }
    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const paymentId = session?.metadata?.paymentId;
      if (paymentId)
        await paymentModel.findByIdAndUpdate(paymentId, { status: "failed" });
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
          { status: "completed", transactionId: paymentIntent.id },
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
