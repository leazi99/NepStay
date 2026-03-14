import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { DollarSign, Receipt, Wallet, AlertCircle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import { useSearchParams } from "react-router-dom";

const Payments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payments, setPayments] = useState([]);
  const [eligibleApplications, setEligibleApplications] = useState([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    applicationId: "",
    amount: "",
    paymentMethod: "bank_transfer",
    notes: "",
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const [paymentsRes, eligibleRes] = await Promise.all([
        axiosInstance.get(API_PATHS.PAYMENTS.GET_EMPLOYER_PAYMENTS),
        axiosInstance.get(API_PATHS.PAYMENTS.GET_ELIGIBLE_APPLICATIONS),
      ]);

      if (paymentsRes.data?.success) {
        setPayments(paymentsRes.data.payments || []);
      } else {
        setError(paymentsRes.data?.message || "Failed to load payments");
      }

      if (eligibleRes.data?.success) {
        setEligibleApplications(eligibleRes.data.applications || []);
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
        response = await axiosInstance.post(
          API_PATHS.PAYMENTS.CREATE_STRIPE_CHECKOUT_SESSION,
          {
            applicationId: form.applicationId,
            amount: Number(form.amount),
            notes: form.notes,
          },
        );

        if (response.data?.success && response.data?.checkoutUrl) {
          window.location.href = response.data.checkoutUrl;
          return;
        }
      } else {
        response = await axiosInstance.post(API_PATHS.PAYMENTS.CREATE_PAYMENT, {
          applicationId: form.applicationId,
          amount: Number(form.amount),
          paymentMethod: form.paymentMethod,
          notes: form.notes,
        });
      }

      if (response.data?.success) {
        toast.success(
          form.paymentMethod === "stripe"
            ? "Redirecting to Stripe"
            : "Payment recorded",
        );
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

  const formatDate = (dateValue) =>
    new Date(dateValue).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <DashboardLayout activeMenu="payments">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-sm text-gray-500 mt-1">Record payments for hired freelancers</p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium">
            <Wallet className="h-4 w-4" />
            Total Paid: ${totalPaid.toLocaleString()}
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
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Hired Candidate *</label>
                <select
                  name="applicationId"
                  value={form.applicationId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (USD) *</label>
                <div className="relative">
                  <DollarSign className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="e.g. 500"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Method</label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="esewa">eSewa</option>
                  <option value="khalti">Khalti</option>
                  <option value="stripe">Stripe</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Optional note for this payment"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  <Receipt className="h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Record Payment"}
                </button>
              </div>
            </form>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Payment History</h2>
              </div>
              {payments.length === 0 ? (
                <div className="py-14 text-center text-sm text-gray-500">No payments recorded yet.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Freelancer</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Job</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Method</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900 font-medium">{payment.freelancer?.name || "Freelancer"}</td>
                        <td className="px-6 py-4 text-gray-600 hidden md:table-cell">{payment.job?.title || "Job"}</td>
                        <td className="px-6 py-4 text-gray-600 capitalize">{String(payment.paymentMethod || "-").replace("_", " ")}</td>
                        <td className="px-6 py-4 text-right text-gray-900 font-semibold">${Number(payment.amount || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-gray-500 hidden sm:table-cell">{formatDate(payment.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Payments;
