import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Receipt,
  Wallet,
  AlertCircle,
  Star,
  CreditCard,
  ShieldCheck,
  Lock,
  X,
  ChevronDown,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePublishableKey =
  String(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
      import.meta.env.VITE_STRIPE_PUBLIC_KEY ||
      import.meta.env.VITE_STRIPE_KEY ||
      "",
  ).trim();
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;
const PAYMENT_CURRENCY_CODE = "NPR";

const elementBaseStyle = (isDark) => ({
  style: {
    base: {
      fontSize: "14px",
      color: isDark ? "#e2e8f0" : "#111827",
      fontFamily: "Inter, system-ui, sans-serif",
      "::placeholder": {
        color: isDark ? "#64748b" : "#9ca3af",
      },
    },
    invalid: {
      color: "#ef4444",
    },
  },
});

const StripeCardForm = ({
  clientSecret,
  paymentId,
  paymentIntentId,
  amount,
  billingEmail,
  billingName,
  billingCountry,
  onBillingEmailChange,
  onBillingCountryChange,
  onBusyChange,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardState, setCardState] = useState({
    numberComplete: false,
    expiryComplete: false,
    cvcComplete: false,
  });

  const normalizedEmail = String(billingEmail || "").trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const canSubmitPayment =
    Boolean(stripe) &&
    Boolean(elements) &&
    Boolean(clientSecret) &&
    isEmailValid &&
    Boolean(billingCountry) &&
    cardState.numberComplete &&
    cardState.expiryComplete &&
    cardState.cvcComplete &&
    !isSubmitting;

  const handleCardElementChange = (field, event) => {
    setCardState((prev) => ({
      ...prev,
      [field]: Boolean(event.complete),
    }));

    if (event.error?.message) {
      setCardError(event.error.message);
      return;
    }

    setCardError("");
  };

  const handlePay = async () => {
    if (!stripe || !elements) {
      toast.error("Stripe is still loading. Please wait.");
      return;
    }

    if (!isEmailValid) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!billingCountry) {
      toast.error("Please select your billing country");
      return;
    }

    if (!cardState.numberComplete || !cardState.expiryComplete || !cardState.cvcComplete) {
      toast.error("Please complete card number, expiry date, and security code");
      return;
    }

    if (!clientSecret) {
      toast.error("Please initialize card payment first");
      return;
    }

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      toast.error("Card field is not ready");
      return;
    }

    setCardError("");
    setIsSubmitting(true);
    onBusyChange(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: {
            email: normalizedEmail || undefined,
            name: billingName || undefined,
            address: {
              country: billingCountry || undefined,
            },
          },
        },
      });

      if (error) {
        setCardError(error.message || "Payment failed");
        toast.error(error.message || "Payment failed");
        return;
      }

      const confirmRes = await axiosInstance.post(API_PATHS.PAYMENTS.CONFIRM_STRIPE_INTENT, {
        paymentId,
        paymentIntentId: paymentIntent?.id || paymentIntentId,
      });

      if (!confirmRes.data?.success) {
        toast.error(confirmRes.data?.message || "Unable to verify payment status");
        return;
      }

      onSuccess(confirmRes.data.payment, confirmRes.data.stripeStatus);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Payment confirmation failed");
    } finally {
      setIsSubmitting(false);
      onBusyChange(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-300 bg-[#f7f7f9] p-4 space-y-3.5">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#1568d6]">
        <CreditCard className="h-4 w-4" />
        <span>Card</span>
      </div>

      <div className="rounded-lg border border-gray-300 bg-white overflow-hidden">
        <div className="px-3.5 py-3 border-b border-gray-300">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-green-500" />
                <p className="text-[15px] font-semibold text-gray-800 leading-none">Secure, fast checkout with Link</p>
              </div>
              <p className="mt-1 text-sm leading-5 text-gray-600">
                Securely pay with your saved info, or create a Link account for faster checkout next time.
              </p>
            </div>
            <button type="button" className="text-gray-400" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-3.5 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input
              type="email"
              value={billingEmail}
              onChange={(event) => onBillingEmailChange(event.target.value)}
              placeholder="you@example.com"
              className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm bg-white text-gray-900"
            />
          </div>

          <button
            type="button"
            disabled
            className="w-full h-11 rounded-md border border-gray-300 text-left px-3 text-sm leading-none text-gray-400 bg-gray-50"
          >
            <span className="inline-block">◉ link</span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Card number</label>
        <div className="h-11 px-3 rounded-md border border-gray-300 bg-white flex items-center justify-between">
          <CardNumberElement
            options={elementBaseStyle(false)}
            onChange={(event) => handleCardElementChange("numberComplete", event)}
          />
          <div className="flex items-center gap-1 text-[9px] font-semibold text-white ml-3 shrink-0">
            <span className="px-1.5 py-0.5 rounded bg-[#1a66d1]">VISA</span>
            <span className="px-1.5 py-0.5 rounded bg-[#ef7a31]">MC</span>
            <span className="px-1.5 py-0.5 rounded bg-[#1db7d8]">AMEX</span>
            <span className="px-1.5 py-0.5 rounded bg-[#f08b34]">DISC</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Expiration date</label>
          <div className="h-11 px-3 rounded-md border border-gray-300 bg-white flex items-center">
            <CardExpiryElement
              options={elementBaseStyle(false)}
              onChange={(event) => handleCardElementChange("expiryComplete", event)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Security code</label>
          <div className="h-11 px-3 rounded-md border border-gray-300 bg-white flex items-center">
            <CardCvcElement
              options={elementBaseStyle(false)}
              onChange={(event) => handleCardElementChange("cvcComplete", event)}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Country</label>
        <div className="relative">
          <select
            value={billingCountry}
            onChange={(event) => onBillingCountryChange(event.target.value)}
            className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm appearance-none bg-white text-gray-900"
          >
            <option value="NP">Nepal</option>
            <option value="IN">India</option>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
          </select>
          <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
        </div>
      </div>

      {cardError ? (
        <div className="text-xs text-red-500">{cardError}</div>
      ) : null}

      {!isEmailValid ? (
        <div className="text-xs text-amber-500">Please provide a valid email to continue.</div>
      ) : null}

      {!clientSecret ? (
        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
          Fill card details now, then click Initialize Card Payment to continue securely.
        </div>
      ) : null}

      <button
        type="button"
        onClick={handlePay}
        disabled={!canSubmitPayment}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#1568d6] text-white text-sm font-medium hover:bg-[#0f5bc0] disabled:opacity-60"
      >
        <ShieldCheck className="h-4 w-4" />
        {isSubmitting ? "Processing payment..." : `Pay ${PAYMENT_CURRENCY_CODE} ${Number(amount || 0).toLocaleString("en-NP")} securely`}
      </button>
    </div>
  );
};

const StripeCardFormFallback = ({
  billingEmail,
  billingCountry,
  onBillingEmailChange,
  onBillingCountryChange,
  showKeyWarning = false,
}) => {
  return (
    <div className="rounded-xl border border-gray-300 bg-[#f7f7f9] p-4 space-y-3.5">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#1568d6]">
        <CreditCard className="h-4 w-4" />
        <span>Card</span>
      </div>

      <div className="rounded-lg border border-gray-300 bg-white overflow-hidden">
        <div className="px-3.5 py-3 border-b border-gray-300">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-green-500" />
                <p className="text-[15px] font-semibold text-gray-800 leading-none">Secure, fast checkout with Link</p>
              </div>
              <p className="mt-1 text-sm leading-5 text-gray-600">
                Securely pay with your saved info, or create a Link account for faster checkout next time.
              </p>
            </div>
            <button type="button" className="text-gray-400" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-3.5 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input
              type="email"
              value={billingEmail}
              onChange={(event) => onBillingEmailChange(event.target.value)}
              placeholder="you@example.com"
              className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm bg-white text-gray-900"
            />
          </div>

          <button
            type="button"
            disabled
            className="w-full h-11 rounded-md border border-gray-300 text-left px-3 text-sm leading-none text-gray-400 bg-gray-50"
          >
            <span className="inline-block">◉ link</span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Card number</label>
        <div className="h-11 px-3 rounded-md border border-gray-300 bg-white flex items-center justify-between text-gray-400 text-sm">
          <span>1234 1234 1234 1234</span>
          <div className="flex items-center gap-1 text-[9px] font-semibold text-white ml-3 shrink-0">
            <span className="px-1.5 py-0.5 rounded bg-[#1a66d1]">VISA</span>
            <span className="px-1.5 py-0.5 rounded bg-[#ef7a31]">MC</span>
            <span className="px-1.5 py-0.5 rounded bg-[#1db7d8]">AMEX</span>
            <span className="px-1.5 py-0.5 rounded bg-[#f08b34]">DISC</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Expiration date</label>
          <input
            type="text"
            value="MM / YY"
            readOnly
            className="w-full h-11 px-3 rounded-md border border-gray-300 bg-white text-sm text-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Security code</label>
          <input
            type="text"
            value="CVC"
            readOnly
            className="w-full h-11 px-3 rounded-md border border-gray-300 bg-white text-sm text-gray-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Country</label>
        <div className="relative">
          <select
            value={billingCountry}
            onChange={(event) => onBillingCountryChange(event.target.value)}
            className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm appearance-none bg-white text-gray-900"
          >
            <option value="NP">Nepal</option>
            <option value="IN">India</option>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
          </select>
          <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
        </div>
      </div>

      <div className={`rounded-md border px-3 py-2 text-xs ${showKeyWarning ? "border-amber-200 bg-amber-50 text-amber-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
        {showKeyWarning
          ? "Add VITE_STRIPE_PUBLISHABLE_KEY in frontend env to activate secure card processing."
          : "Click Initialize Card Payment to activate secure card fields."}
      </div>
    </div>
  );
};

const Payments = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payments, setPayments] = useState([]);
  const [eligibleApplications, setEligibleApplications] = useState([]);
  const [eligibleReviews, setEligibleReviews] = useState([]);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [reviewSubmittingId, setReviewSubmittingId] = useState("");
  const [error, setError] = useState("");
  const [stripeClientSecret, setStripeClientSecret] = useState("");
  const [stripePaymentId, setStripePaymentId] = useState("");
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState("");
  const [stripeBusy, setStripeBusy] = useState(false);
  const [billingEmail, setBillingEmail] = useState(user?.email || "");
  const [billingName, setBillingName] = useState(user?.name || "");
  const [billingCountry, setBillingCountry] = useState("NP");

  const [form, setForm] = useState({
    applicationId: "",
    amount: "",
    paymentMethod: "bank_transfer",
    notes: "",
  });
  const isDark = (user?.themePreference || "light") === "dark";

  useEffect(() => {
    setBillingName(user?.name || "");
  }, [user?.name]);

  useEffect(() => {
    setBillingEmail(user?.email || "");
  }, [user?.email]);

  useEffect(() => {
    setStripeClientSecret("");
    setStripePaymentId("");
    setStripePaymentIntentId("");
  }, [form.applicationId, form.amount, form.notes, form.paymentMethod]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const [paymentsRes, eligibleRes, reviewsRes] = await Promise.all([
        axiosInstance.get(API_PATHS.PAYMENTS.GET_EMPLOYER_PAYMENTS),
        axiosInstance.get(API_PATHS.PAYMENTS.GET_ELIGIBLE_APPLICATIONS),
        axiosInstance.get(API_PATHS.REVIEWS.GET_ELIGIBLE),
      ]);

      if (paymentsRes.data?.success) {
        setPayments(paymentsRes.data.payments || []);
      } else {
        setError(paymentsRes.data?.message || "Failed to load payments");
      }

      if (eligibleRes.data?.success) {
        setEligibleApplications(eligibleRes.data.applications || []);
      }

      if (reviewsRes.data?.success) {
        setEligibleReviews(reviewsRes.data.eligible || []);
      }
    } catch {
      setError("Failed to load payment data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (!paymentStatus) return;

    if (paymentStatus === "success") {
      toast.success("Stripe payment completed");
      loadData();
    }

    if (paymentStatus === "cancel") {
      toast.error("Stripe payment cancelled");
    }

    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const totalPaid = useMemo(
    () => payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    [payments],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.applicationId || !form.amount) {
      toast.error("Select a hired application and enter amount");
      return;
    }

    try {
      setIsSubmitting(true);
      let response;

      if (form.paymentMethod === "stripe") {
        if (!stripePromise) {
          toast.error("Stripe is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY in frontend env.");
          return;
        }

        response = await axiosInstance.post(API_PATHS.PAYMENTS.CREATE_STRIPE_INTENT, {
          applicationId: form.applicationId,
          amount: Number(form.amount),
          notes: form.notes,
        });

        if (response.data?.success && response.data?.clientSecret) {
          setStripeClientSecret(response.data.clientSecret);
          setStripePaymentId(response.data.paymentId || "");
          setStripePaymentIntentId(response.data.paymentIntentId || "");
          toast.success("Secure card form is ready. Complete your payment below.");
          return;
        }

        toast.error(response.data?.message || "Unable to initialize Stripe payment");
        return;
      } else {
        response = await axiosInstance.post(API_PATHS.PAYMENTS.CREATE_PAYMENT, {
          applicationId: form.applicationId,
          amount: Number(form.amount),
          paymentMethod: form.paymentMethod,
          notes: form.notes,
        });
      }

      if (response.data?.success) {
        toast.success("Payment recorded");
        setPayments((prev) => [response.data.payment, ...prev]);
        setForm({
          applicationId: "",
          amount: "",
          paymentMethod: "bank_transfer",
          notes: "",
        });
      } else {
        toast.error(response.data?.message || "Failed to create payment");
      }
    } catch (submitError) {
      toast.error(submitError?.response?.data?.message || "Failed to create payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStripePaymentSuccess = (payment, stripeStatus) => {
    if (!payment) {
      toast.error("Payment processed but response data is incomplete");
      loadData();
      return;
    }

    if (stripeStatus && stripeStatus !== "succeeded") {
      toast("Payment is processing. It will appear once confirmed.");
    } else {
      toast.success("Payment completed successfully");
    }

    setPayments((prev) => [payment, ...prev.filter((item) => item._id !== payment._id)]);
    setForm({
      applicationId: "",
      amount: "",
      paymentMethod: "bank_transfer",
      notes: "",
    });
    setStripeClientSecret("");
    setStripePaymentId("");
    setStripePaymentIntentId("");
  };

  const formatDate = (dateValue) =>
    new Date(dateValue).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatCurrencyAmount = (value) =>
    `${PAYMENT_CURRENCY_CODE} ${Number(value || 0).toLocaleString("en-NP")}`;

  const getPaymentStatusBadgeClasses = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "completed") {
      return isDark
        ? "bg-emerald-900/30 text-emerald-300 border border-emerald-800"
        : "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }

    if (normalized === "failed") {
      return isDark
        ? "bg-rose-900/30 text-rose-300 border border-rose-800"
        : "bg-rose-50 text-rose-700 border border-rose-200";
    }

    return isDark
      ? "bg-amber-900/30 text-amber-300 border border-amber-800"
      : "bg-amber-50 text-amber-700 border border-amber-200";
  };

  const handleReviewDraftChange = (paymentId, field, value) => {
    setReviewDrafts((prev) => ({
      ...prev,
      [paymentId]: {
        rating: prev[paymentId]?.rating || "",
        comment: prev[paymentId]?.comment || "",
        [field]: value,
      },
    }));
  };

  const handleSubmitReview = async (paymentId) => {
    const draft = reviewDrafts[paymentId] || {};
    const rating = Number(draft.rating);

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      toast.error("Please select rating between 1 and 5");
      return;
    }

    setReviewSubmittingId(paymentId);
    try {
      const response = await axiosInstance.post(API_PATHS.REVIEWS.CREATE, {
        paymentId,
        rating,
        comment: draft.comment || "",
      });

      if (!response.data?.success) {
        toast.error(response.data?.message || "Failed to submit review");
        return;
      }

      toast.success("Review submitted");
      setEligibleReviews((prev) => prev.filter((item) => item.paymentId !== paymentId));
      setReviewDrafts((prev) => {
        const next = { ...prev };
        delete next[paymentId];
        return next;
      });
    } catch (submitError) {
      toast.error(submitError?.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewSubmittingId("");
    }
  };

  return (
    <DashboardLayout activeMenu="payments">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-gray-900"}`}>Payments</h1>
            <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Record payments for hired freelancers</p>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${isDark ? "bg-emerald-900/30 text-emerald-300" : "bg-emerald-50 text-emerald-700"}`}>
            <Wallet className="h-4 w-4" />
            Total Paid: {formatCurrencyAmount(totalPaid)}
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-red-500">
            <AlertCircle className="h-10 w-10" />
            <p className="text-sm">{error}</p>
            <button onClick={loadData} className="text-sm text-blue-600 hover:underline">
              Retry
            </button>
          </div>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className={`rounded-2xl border shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-4 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-100"}`}
            >
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-200" : "text-gray-700"}`}>Hired Candidate *</label>
                <select
                  name="applicationId"
                  value={form.applicationId}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${isDark ? "border-slate-700 bg-slate-800 text-slate-100" : "border-gray-200 bg-white"}`}
                >
                  <option value="">Select hired application</option>
                  {eligibleApplications.map((application) => (
                    <option key={application._id} value={application._id}>
                      {application.applicant?.name || "Freelancer"} • {application.job?.title || "Job"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-200" : "text-gray-700"}`}>Amount (NPR) *</label>
                <div className="relative">
                  <Wallet className={`h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-gray-400"}`} />
                  <input
                    type="number"
                    min="1"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="e.g. 5000"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${isDark ? "border-slate-700 bg-slate-800 text-slate-100" : "border-gray-200"}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-200" : "text-gray-700"}`}>Method</label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${isDark ? "border-slate-700 bg-slate-800 text-slate-100" : "border-gray-200 bg-white"}`}
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="esewa">eSewa</option>
                  <option value="khalti">Khalti</option>
                  <option value="stripe">Stripe</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-200" : "text-gray-700"}`}>Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Optional note for this payment"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none ${isDark ? "border-slate-700 bg-slate-800 text-slate-100" : "border-gray-200"}`}
                />
              </div>

              {form.paymentMethod === "stripe" ? (
                <div className="md:col-span-2 space-y-3">
                  {stripePromise ? (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        appearance: {
                          theme: isDark ? "night" : "stripe",
                        },
                      }}
                    >
                      <StripeCardForm
                        clientSecret={stripeClientSecret}
                        paymentId={stripePaymentId}
                        paymentIntentId={stripePaymentIntentId}
                        amount={form.amount}
                        billingEmail={billingEmail}
                        billingName={billingName}
                        billingCountry={billingCountry}
                        onBillingEmailChange={setBillingEmail}
                        onBillingCountryChange={setBillingCountry}
                        onBusyChange={setStripeBusy}
                        onSuccess={handleStripePaymentSuccess}
                      />
                    </Elements>
                  ) : (
                    <StripeCardFormFallback
                      billingEmail={billingEmail}
                      billingCountry={billingCountry}
                      onBillingEmailChange={setBillingEmail}
                      onBillingCountryChange={setBillingCountry}
                      showKeyWarning={!stripePromise}
                    />
                  )}
                </div>
              ) : null}

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || stripeBusy || (form.paymentMethod === "stripe" && !stripePromise)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  <Receipt className="h-4 w-4" />
                  {isSubmitting
                    ? "Saving..."
                    : form.paymentMethod === "stripe"
                      ? !stripePromise
                        ? "Stripe Key Missing"
                        : stripeClientSecret
                          ? "Re-initialize Card Payment"
                          : "Initialize Card Payment"
                      : "Record Payment"}
                </button>
              </div>
            </form>

            <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-100"}`}>
              <div className={`px-6 py-4 border-b ${isDark ? "border-slate-700" : "border-gray-100"}`}>
                <h2 className={`text-base font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>Payment History</h2>
              </div>
              {payments.length === 0 ? (
                <div className={`py-14 text-center text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>No payments recorded yet.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`${isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-100"} border-b`}>
                      <th className={`text-left px-6 py-3 text-xs font-semibold uppercase ${isDark ? "text-slate-400" : "text-gray-500"}`}>Freelancer</th>
                      <th className={`text-left px-6 py-3 text-xs font-semibold uppercase hidden md:table-cell ${isDark ? "text-slate-400" : "text-gray-500"}`}>Job</th>
                      <th className={`text-left px-6 py-3 text-xs font-semibold uppercase ${isDark ? "text-slate-400" : "text-gray-500"}`}>Method</th>
                      <th className={`text-left px-6 py-3 text-xs font-semibold uppercase ${isDark ? "text-slate-400" : "text-gray-500"}`}>Status</th>
                      <th className={`text-right px-6 py-3 text-xs font-semibold uppercase ${isDark ? "text-slate-400" : "text-gray-500"}`}>Amount</th>
                      <th className={`text-right px-6 py-3 text-xs font-semibold uppercase hidden sm:table-cell ${isDark ? "text-slate-400" : "text-gray-500"}`}>Date</th>
                    </tr>
                  </thead>
                  <tbody className={`${isDark ? "divide-slate-800" : "divide-gray-50"} divide-y`}>
                    {payments.map((payment) => (
                      <tr key={payment._id} className={isDark ? "hover:bg-slate-800/60" : "hover:bg-gray-50"}>
                        <td className={`px-6 py-4 font-medium ${isDark ? "text-slate-100" : "text-gray-900"}`}>{payment.freelancer?.name || "Freelancer"}</td>
                        <td className={`px-6 py-4 hidden md:table-cell ${isDark ? "text-slate-300" : "text-gray-600"}`}>{payment.job?.title || "Job"}</td>
                        <td className={`px-6 py-4 capitalize ${isDark ? "text-slate-300" : "text-gray-600"}`}>{String(payment.paymentMethod || "-").replace("_", " ")}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${getPaymentStatusBadgeClasses(payment.status)}`}>
                            {String(payment.status || "pending")}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>{formatCurrencyAmount(payment.amount)}</td>
                        <td className={`px-6 py-4 text-right hidden sm:table-cell ${isDark ? "text-slate-400" : "text-gray-500"}`}>{formatDate(payment.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-100"}`}>
              <div className={`px-6 py-4 border-b ${isDark ? "border-slate-700" : "border-gray-100"}`}>
                <h2 className={`text-base font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>Rate Freelancers</h2>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                  Submit rating and feedback after project payment is completed.
                </p>
              </div>

              {eligibleReviews.length === 0 ? (
                <div className={`py-12 text-center text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                  No pending freelancer reviews.
                </div>
              ) : (
                <div className={`${isDark ? "divide-slate-800" : "divide-gray-100"} divide-y`}>
                  {eligibleReviews.map((item) => {
                    const draft = reviewDrafts[item.paymentId] || {
                      rating: "",
                      comment: "",
                    };

                    return (
                      <div key={item.paymentId} className="px-6 py-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {item.reviewee?.name || "Freelancer"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.job?.title || "Project"} • {formatCurrencyAmount(item.amount)}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">{formatDate(item.completedAt)}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-2">
                          <div className="flex items-center gap-1 px-2 py-2 border border-gray-200 rounded-lg bg-white">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const selected = Number(draft.rating || 0) >= star;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() =>
                                    handleReviewDraftChange(item.paymentId, "rating", String(star))
                                  }
                                  className="p-0.5"
                                  title={`${star} star${star > 1 ? "s" : ""}`}
                                >
                                  <Star
                                    className={`h-5 w-5 ${selected ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                          <input
                            type="text"
                            value={draft.comment}
                            onChange={(event) =>
                              handleReviewDraftChange(item.paymentId, "comment", event.target.value)
                            }
                            placeholder="Write feedback"
                            className={`px-3 py-2 border rounded-lg text-sm ${isDark ? "border-slate-700 bg-slate-800 text-slate-100" : "border-gray-200"}`}
                          />
                          <button
                            onClick={() => handleSubmitReview(item.paymentId)}
                            disabled={reviewSubmittingId === item.paymentId}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
                          >
                            {reviewSubmittingId === item.paymentId ? "Submitting..." : "Submit"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Payments;
