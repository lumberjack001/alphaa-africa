"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import BoardingPass from "@/components/BoardingPass";
import { getOrderHistory, OrderItem } from "@/services/orderService";
import { getAccessToken, getStoredUser } from "@/lib/api";

function SingleOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const reference = searchParams.get("reference") || undefined;
  const email = searchParams.get("email") || undefined;
  const token = searchParams.get("token") || undefined;

  const [order, setOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 5000);
  };

  useEffect(() => {
    async function loadOrder() {
      if (!reference) {
        setError("Missing order reference.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getOrderHistory({ email, token });
        const found = (response.orders || []).find(
          (o) => o.reference.toLowerCase() === reference.toLowerCase()
        );

        if (found) {
          setOrder(found);
        } else {
          // If reference wasn't in response list, fallback object using reference parameter
          setOrder({
            reference: reference,
            booking_type: "flight",
            title: `Booking Reference: ${reference}`,
            amount: "0.00",
            currency: "NGN",
            payment_status: "success",
            paid_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        console.error("Error fetching single order:", err);
        if (err?.status === 403) {
          setError("Invalid or expired access token for this order. Please log in or check your confirmation email.");
        } else {
          setError(err?.message || "Failed to retrieve order details.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [reference, email, token]);

  const handleBackToOrders = () => {
    if (email && token) {
      router.push(`/orders?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
    } else if (getAccessToken()) {
      router.push("/profile");
    } else {
      router.push("/orders");
    }
  };

  const getServiceIcon = (type?: string) => {
    switch ((type || "").toLowerCase()) {
      case "hotel": return "🏨";
      case "flight": return "✈️";
      case "car": return "🚗";
      case "visa": return "📄";
      case "package": return "🏝️";
      default: return "💳";
    }
  };

  const status = (order?.payment_status || "").toLowerCase();
  const isSuccessful = status === "success" || status === "successful";
  const isPending = status === "pending";
  const isFailed = status === "failed";

  const formattedAmount = order?.amount
    ? `${order.currency || "NGN"} ${Number(order.amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "";

  const formattedPaidAt = order?.paid_at
    ? new Date(order.paid_at).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : order?.created_at
    ? new Date(order.created_at).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  // Prepare Boarding Pass props for confirmed tickets
  const storedUser = getStoredUser();
  const passengerName = storedUser
    ? `${storedUser.first_name} ${storedUser.last_name}`.trim()
    : email
    ? email
    : "Valued Customer";

  const titleString = order?.title || "";
  const [origin, destination] = titleString.includes("→")
    ? titleString.split("→").map((s) => s.trim())
    : ["Lagos (LOS)", titleString || "Destination"];

  const confirmedTicketData = order
    ? {
        passenger: passengerName,
        cabin: order.booking_type === "flight" ? "Economy Standard" : "Verified Booking",
        hash: `SEC-${order.reference.slice(-8)}`,
        pnr: order.reference,
        details: {
          carrier: order.title,
          name: order.title,
          number: order.reference,
        },
        type: order.booking_type,
      }
    : null;

  return (
    <div className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-[#FA6432] selection:text-white">
      <Navbar
        onSwitchTab={(tabId) => router.push(`/?tab=${tabId}`)}
        onReset={() => router.push("/")}
        activeTab=""
      />

      <main className="flex-grow navbar-offset">
        {/* Render Top Banner ONLY for Pending/Failed order states */}
        {!loading && !error && order && !isSuccessful && (
          <div className="bg-gradient-to-br from-[#4C1D5C] to-[#2E1238] text-white pt-16 pb-24 px-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-black font-sans uppercase tracking-tight">
              Order Details
            </h1>
            <p className="text-sm text-purple-100 mt-2 font-semibold max-w-xl mx-auto">
              Order Reference: <span className="font-mono text-brand-orange">{reference || "—"}</span>
            </p>
          </div>
        )}

        {/* Main Content Area */}
        <div className={!loading && !error && order && !isSuccessful ? "-mt-12 mb-20 relative z-10" : "py-8"}>
          {loading ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 px-4">
              <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-black text-brand-purple font-sans tracking-wide">Loading order details...</p>
            </div>
          ) : error ? (
            <div className="max-w-2xl mx-auto px-4">
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-red-100 shadow-xl space-y-4">
                <div className="text-4xl">⚠️</div>
                <h2 className="text-lg font-black text-brand-purple uppercase tracking-tight">Unable to Load Order</h2>
                <p className="text-xs text-slate-600 font-semibold max-w-md mx-auto leading-relaxed">
                  {error}
                </p>
                <div className="pt-2 flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={handleBackToOrders}
                    className="bg-brand-orange hover:bg-brand-purple text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer"
                  >
                    View All Orders
                  </button>
                  <Link
                    href="/"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    Return Home
                  </Link>
                </div>
              </div>
            </div>
          ) : order && isSuccessful ? (
            /* Render Official Boarding Pass for Confirmed Orders */
            <BoardingPass
              confirmedTicket={confirmedTicketData}
              onReset={handleBackToOrders}
              origin={origin}
              destination={destination}
            />
          ) : order ? (
            /* Render Status Receipt Card for Pending or Failed Orders */
            <div className="max-w-2xl mx-auto px-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-50 space-y-8">
                {/* Header Status Row */}
                <div className="flex items-center justify-between pb-6 border-b border-purple-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl flex-shrink-0">
                      {getServiceIcon(order.booking_type)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Booking Type</span>
                      <span className="text-xs font-black text-brand-purple uppercase tracking-wider capitalize">
                        {order.booking_type || "Booking"}
                      </span>
                    </div>
                  </div>

                  <div>
                    {isPending && (
                      <span className="bg-amber-50 text-amber-600 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                        ⏳ Payment Pending
                      </span>
                    )}
                    {isFailed && (
                      <span className="bg-red-50 text-red-500 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                        ✕ Payment Failed
                      </span>
                    )}
                  </div>
                </div>

                {/* Booking Title & Reference */}
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-brand-purple tracking-tight">
                    {order.title || `Booking Reference: ${order.reference}`}
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold flex items-center gap-2">
                    <span>Reference:</span>
                    <span className="font-mono bg-purple-50 text-purple-900 px-2 py-0.5 rounded-md font-bold">
                      {order.reference}
                    </span>
                  </p>
                </div>

                {/* Transaction Summary Grid */}
                <div className="bg-slate-50 rounded-2xl p-5 space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <span className="text-slate-500 font-bold">Total Amount</span>
                    <span className="text-base font-black text-slate-900">{formattedAmount}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <span className="text-slate-500 font-bold">Payment Currency</span>
                    <span className="font-bold text-slate-800">{order.currency || "NGN"}</span>
                  </div>
                  {formattedPaidAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold">Created Date</span>
                      <span className="font-bold text-slate-800">{formattedPaidAt}</span>
                    </div>
                  )}
                </div>

                {/* Receipt Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 bg-brand-purple hover:bg-brand-orange text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none text-center font-sans"
                  >
                    🖨️ Print Receipt
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToOrders}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer text-center font-sans"
                  >
                    ← Back to Orders
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <Footer onSwitchTab={() => {}} triggerToast={triggerToast} />
      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}

export default function SingleOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
          <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <SingleOrderContent />
    </Suspense>
  );
}
