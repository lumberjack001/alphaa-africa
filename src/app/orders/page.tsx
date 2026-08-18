"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import { getOrderHistory, OrderItem } from "@/services/orderService";
import { getAccessToken } from "@/lib/api";

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || undefined;
  const token = searchParams.get("token") || undefined;

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "successful" | "pending" | "failed">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 5000);
  };

  const handleFilterChange = (filter: "all" | "successful" | "pending" | "failed") => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      setError(null);

      const isLoggedIn = !!getAccessToken();

      // For unauthenticated users without email/token params
      if (!isLoggedIn && (!email || !token)) {
        setError("Please log in or use the link provided in your order confirmation email to view your orders.");
        setLoading(false);
        return;
      }

      try {
        const data = await getOrderHistory({ email, token });
        setOrders(data.orders || []);
      } catch (err: any) {
        console.error("Error loading order history:", err);
        if (err?.status === 403) {
          setError("Access denied: Invalid or expired email access token. Please check your email link or log in to your account.");
        } else {
          setError(err?.message || "Failed to load order history.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [email, token]);

  const handleOrderClick = (order: OrderItem) => {
    const params = new URLSearchParams();
    params.set("reference", order.reference);
    if (email) params.set("email", email);
    if (token) params.set("token", token);
    router.push(`/order?${params.toString()}`);
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

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "all") return true;
    const status = (o.payment_status || "").toLowerCase();
    if (statusFilter === "successful") return status === "success" || status === "successful";
    return status === statusFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-[#FA6432] selection:text-white">
      <Navbar
        onSwitchTab={(tabId) => router.push(`/?tab=${tabId}`)}
        onReset={() => router.push("/")}
        activeTab=""
      />

      <main className="flex-grow navbar-offset">
        {/* Banner Header */}
        <div className="bg-gradient-to-br from-[#4C1D5C] to-[#2E1238] text-white pt-16 pb-24 px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-black font-sans uppercase tracking-tight">
            Order History
          </h1>
          <p className="text-sm text-purple-100 mt-2 font-semibold max-w-xl mx-auto">
            View all your booked travels, flight reservations, hotel stays, and payment statuses
          </p>
        </div>

        {/* Main Content Area */}
        <div className="max-w-4xl w-full mx-auto px-4 -mt-12 mb-20 relative z-10 space-y-6">
          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-purple-50 shadow-xl space-y-4">
              <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-brand-purple font-bold">Fetching your order history...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-red-100 shadow-xl space-y-4">
              <div className="text-4xl">⚠️</div>
              <h2 className="text-lg font-black text-brand-purple uppercase tracking-tight">Access Restricted</h2>
              <p className="text-xs text-slate-600 font-semibold max-w-md mx-auto leading-relaxed">
                {error}
              </p>
              <div className="pt-2 flex justify-center gap-4">
                <Link
                  href="/login"
                  className="bg-brand-orange hover:bg-brand-purple text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  Log In to Account
                </Link>
                <Link
                  href="/"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  Return Home
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Header & Filter Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-50">
                  <div>
                    <h2 className="text-lg font-black text-brand-purple uppercase tracking-tight">
                      All Orders ({orders.length})
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      Click any order to view full ticket details and receipt
                    </p>
                  </div>

                  {/* Filter buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {(["all", "successful", "pending", "failed"] as const).map((filter) => {
                      const count =
                        filter === "all"
                          ? orders.length
                          : orders.filter((o) => {
                              const st = (o.payment_status || "").toLowerCase();
                              if (filter === "successful") return st === "success" || st === "successful";
                              return st === filter;
                            }).length;

                      const isActive = statusFilter === filter;

                      return (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => handleFilterChange(filter)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer flex items-center space-x-1.5 ${
                            isActive
                              ? "bg-brand-purple text-white shadow-md"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                          }`}
                        >
                          <span>{filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                              isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* List of Orders */}
                <div className="space-y-4 pt-6">
                  {filteredOrders.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <div className="text-4xl">🛍️</div>
                      <h3 className="text-sm font-black text-brand-purple uppercase">No Orders Found</h3>
                      <p className="text-xs text-slate-400 font-semibold">
                        {orders.length === 0 ? "You haven't made any bookings yet." : "No orders match the selected filter."}
                      </p>
                    </div>
                  ) : (
                    paginatedOrders.map((order) => {
                      const status = (order.payment_status || "").toLowerCase();
                      const isSuccessful = status === "success" || status === "successful";
                      const isPending = status === "pending";
                      const isFailed = status === "failed";

                      const formattedAmount = order.amount
                        ? `${order.currency || "NGN"} ${Number(order.amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : "";

                      const formattedDate = order.paid_at
                        ? new Date(order.paid_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : order.created_at
                        ? new Date(order.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "";

                      return (
                        <div
                          key={order.reference}
                          onClick={() => handleOrderClick(order)}
                          className="bg-white rounded-2xl p-5 border border-purple-50 hover:border-brand-orange/40 hover:shadow-lg cursor-pointer transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-xl flex-shrink-0">
                              {getServiceIcon(order.booking_type)}
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-sm font-black text-brand-purple">
                                {order.title || `Booking Reference: ${order.reference}`}
                              </h3>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-semibold">
                                <span className="font-mono text-purple-900/80">{order.reference}</span>
                                {formattedDate && (
                                  <>
                                    <span>•</span>
                                    <span>{formattedDate}</span>
                                  </>
                                )}
                                {order.booking_type && (
                                  <>
                                    <span>•</span>
                                    <span className="capitalize text-slate-500">{order.booking_type}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                            <span className="text-base font-black text-slate-900">{formattedAmount}</span>

                            <div className="mt-1">
                              {isSuccessful && (
                                <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                  <span>✓ Successful</span>
                                  <span className="text-xs">→</span>
                                </span>
                              )}
                              {isPending && (
                                <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                  <span>⏳ Pending</span>
                                  <span className="text-xs">→</span>
                                </span>
                              )}
                              {isFailed && (
                                <span className="inline-flex items-center space-x-1 bg-red-50 text-red-500 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                  <span>✕ Failed</span>
                                  <span className="text-xs">→</span>
                                </span>
                              )}
                              {!isSuccessful && !isPending && !isFailed && (
                                <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                  <span>{order.payment_status}</span>
                                  <span className="text-xs">→</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-purple-50">
                      <span className="text-xs text-slate-400 font-semibold">
                        Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredOrders.length)} of {filteredOrders.length} orders
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer transition-all"
                        >
                          ← Prev
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`w-9 h-9 rounded-xl text-xs font-black border-none cursor-pointer transition-all ${
                              currentPage === page
                                ? "bg-brand-purple text-white shadow-md"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          type="button"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer transition-all"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer onSwitchTab={() => {}} triggerToast={triggerToast} />
      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
          <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
