"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeIndianRupee,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clipboard,
  Eye,
  EyeOff,
  FileText,
  Gift,
  IndianRupee,
  Info,
  KeyRound,
  Loader2,
  LogOut,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  TicketPercent,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { useAffiliateStore } from "@/store/affiliateStore";

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getBadgeClass = (status) => {
  const value = String(status || "").toLowerCase();

  if (["active", "paid", "approved", "delivered"].includes(value)) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/10";
  }

  if (
    [
      "pending",
      "processing",
      "packed",
      "shipped",
      "out_for_delivery",
    ].includes(value)
  ) {
    return "bg-amber-50 text-amber-700 ring-amber-600/10";
  }

  if (
    [
      "cancelled",
      "rejected",
      "refunded",
      "blocked",
      "returned",
      "rto",
    ].includes(value)
  ) {
    return "bg-red-50 text-red-700 ring-red-600/10";
  }

  return "bg-neutral-100 text-neutral-600 ring-neutral-600/10";
};

/* =========================================================
   PAGE
========================================================= */

export default function AffiliateDashboardPage() {
  const router = useRouter();

  const {
    token,
    affiliate,
    dashboard,
    orders,

    loading,
    dashboardLoading,
    ordersLoading,
    mutationLoading,

    error,
    message,

    orderFilters,
    orderPagination,

    logout,
    clearFeedback,
    setOrderFilters,
    fetchDashboard,
    fetchOrders,
    refreshAffiliateData,
    changePassword,
  } = useAffiliateStore();

  const [activeSection, setActiveSection] = useState("overview");
  const [copied, setCopied] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!token) {
      router.replace("/affiliate");
      return;
    }

    refreshAffiliateData().catch(() => {});
    fetchOrders({ page: 1 }).catch(() => {});
  }, [token, router, refreshAffiliateData, fetchOrders]);

  useEffect(() => {
    if (!token) return;

    const timer = setTimeout(() => {
      fetchOrders().catch(() => {});
    }, 300);

    return () => clearTimeout(timer);
  }, [
    token,
    orderFilters.q,
    orderFilters.paymentStatus,
    orderFilters.fulfillmentStatus,
    orderFilters.commissionStatus,
    orderFilters.from,
    orderFilters.to,
    orderFilters.page,
    orderFilters.limit,
    orderFilters.sortBy,
    orderFilters.sortOrder,
    fetchOrders,
  ]);

  const stats = dashboard?.stats || affiliate?.stats || {};
  const payoutSummary =
    dashboard?.payoutSummary || affiliate?.payoutSummary || {};

  const coupon =
    affiliate?.coupon?.couponId || affiliate?.coupon || {};

  const performance = useMemo(() => {
    const totalOrders = Number(stats.totalOrders || 0);
    const deliveredOrders = Number(stats.deliveredOrders || 0);
    const totalRevenue = Number(stats.totalRevenue || 0);

    return {
      deliveryRate:
        totalOrders > 0
          ? Math.round((deliveredOrders / totalOrders) * 100)
          : 0,

      averageOrder:
        totalOrders > 0 ? totalRevenue / totalOrders : 0,
    };
  }, [stats]);

  const navigation = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "Orders" },
    { id: "payout", label: "Payout" },
    { id: "terms", label: "Terms" },
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
  ];

  const handleLogout = () => {
    logout();
    router.replace("/affiliate");
  };

  const handleRefresh = async () => {
    await Promise.all([
      fetchDashboard(),
      fetchOrders(),
    ]).catch(() => {});
  };

  const copyCoupon = async () => {
    const code = affiliate?.coupon?.code;

    if (!code) return;

    await navigator.clipboard.writeText(code);

    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    clearFeedback();

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      window.alert("New passwords do not match.");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      // Store handles errors.
    }
  };

  if (!token) return null;

  if (loading && !affiliate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <Loader2 size={18} className="animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 text-black">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
              <TrendingUp size={18} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                OATCLUB Affiliate
              </p>

              <p className="truncate text-xs text-neutral-500">
                {affiliate?.affiliateNumber || "Dashboard"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 px-3 text-xs font-semibold transition hover:border-black"
            >
              <RefreshCw
                size={14}
                className={
                  dashboardLoading || ordersLoading
                    ? "animate-spin"
                    : ""
                }
              />

              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-black px-3 text-xs font-semibold text-white transition hover:bg-neutral-800"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[28px] bg-black px-6 py-8 text-white sm:px-8 lg:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
                Affiliate dashboard
              </p>

              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Welcome, {affiliate?.name || "Affiliate"}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                Track coupon orders, revenue, commission eligibility and
                monthly payouts.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <StatusBadge status={affiliate?.status} />

                <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">
                  {affiliate?.platform || "affiliate"}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 lg:min-w-[320px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                Your coupon
              </p>

              <div className="mt-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold tracking-[0.08em]">
                    {affiliate?.coupon?.code || "—"}
                  </p>

                  <p className="mt-1 text-xs text-white/45">
                    {affiliate?.coupon?.discountValue || 0}
                    {affiliate?.coupon?.discountType === "percentage"
                      ? "%"
                      : " flat"}{" "}
                    customer discount
                  </p>
                </div>

                <button
                  type="button"
                  onClick={copyCoupon}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black transition hover:bg-neutral-200"
                  aria-label="Copy coupon"
                >
                  {copied ? <Check size={17} /> : <Clipboard size={17} />}
                </button>
              </div>
            </div>
          </div>
        </section>

        <nav className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
          <div className="flex min-w-max gap-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                  activeSection === item.id
                    ? "bg-black text-white"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-black"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {error ? (
          <Alert type="error">{error}</Alert>
        ) : null}

        {message ? (
          <Alert type="success">{message}</Alert>
        ) : null}

        {/* =====================================================
            OVERVIEW
        ===================================================== */}

        {activeSection === "overview" ? (
          <section className="mt-6 space-y-6">
            <PolicyNotice onOpenTerms={() => setActiveSection("terms")} />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Total Revenue"
                value={formatCurrency(stats.totalRevenue)}
                icon={BadgeIndianRupee}
                loading={dashboardLoading}
              />

              <MetricCard
                label="Attributed Orders"
                value={stats.totalOrders || 0}
                icon={Package}
                loading={dashboardLoading}
              />

              <MetricCard
                label="Pending Commission"
                value={formatCurrency(stats.pendingCommission)}
                icon={CircleDollarSign}
                loading={dashboardLoading}
              />

              <MetricCard
                label="Available Payout"
                value={formatCurrency(payoutSummary.pendingPayout)}
                icon={WalletCards}
                loading={dashboardLoading}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SmallMetric
                label="Delivered Orders"
                value={stats.deliveredOrders || 0}
              />

              <SmallMetric
                label="Approved Commission"
                value={formatCurrency(stats.approvedCommission)}
              />

              <SmallMetric
                label="Paid Commission"
                value={formatCurrency(stats.paidCommission)}
              />

              <SmallMetric
                label="Average Order"
                value={formatCurrency(performance.averageOrder)}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              <Panel
                title="Recent Orders"
                description="Latest orders attributed to your coupon."
              >
                <OrdersTable
                  orders={orders.slice(0, 6)}
                  loading={ordersLoading}
                />
              </Panel>

              <Panel
                title="Performance Summary"
                description="Your current affiliate activity."
              >
                <div className="space-y-1 p-5">
                  <SummaryRow
                    label="Confirmed orders"
                    value={stats.confirmedOrders || 0}
                  />

                  <SummaryRow
                    label="Cancelled orders"
                    value={stats.cancelledOrders || 0}
                  />

                  <SummaryRow
                    label="Returned orders"
                    value={stats.returnedOrders || 0}
                  />

                  <SummaryRow
                    label="Delivery rate"
                    value={`${performance.deliveryRate}%`}
                  />

                  <SummaryRow
                    label="Last order"
                    value={formatDate(stats.lastOrderAt)}
                  />
                </div>
              </Panel>
            </div>
          </section>
        ) : null}

        {/* =====================================================
            ORDERS
        ===================================================== */}

        {activeSection === "orders" ? (
          <section className="mt-6">
            <Panel
              title="Affiliate Orders"
              description="Only orders placed using your assigned coupon are shown."
            >
              <div className="grid gap-3 border-b border-neutral-200 p-4 md:grid-cols-2 xl:grid-cols-5">
                <div className="relative xl:col-span-2">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    value={orderFilters.q}
                    onChange={(event) =>
                      setOrderFilters({
                        q: event.target.value,
                      })
                    }
                    placeholder="Search order..."
                    className="h-11 w-full rounded-xl border border-neutral-200 pl-9 pr-3 text-sm outline-none focus:border-black"
                  />
                </div>

                <select
                  value={orderFilters.paymentStatus}
                  onChange={(event) =>
                    setOrderFilters({
                      paymentStatus: event.target.value,
                    })
                  }
                  className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-black"
                >
                  <option value="">All payments</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>

                <select
                  value={orderFilters.fulfillmentStatus}
                  onChange={(event) =>
                    setOrderFilters({
                      fulfillmentStatus: event.target.value,
                    })
                  }
                  className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-black"
                >
                  <option value="">All fulfilment</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">
                    Out for delivery
                  </option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                  <option value="rto">RTO</option>
                </select>

                <select
                  value={orderFilters.commissionStatus}
                  onChange={(event) =>
                    setOrderFilters({
                      commissionStatus: event.target.value,
                    })
                  }
                  className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-black"
                >
                  <option value="">All commission</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <input
                  type="date"
                  value={orderFilters.from}
                  onChange={(event) =>
                    setOrderFilters({
                      from: event.target.value,
                    })
                  }
                  className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-black"
                />

                <input
                  type="date"
                  value={orderFilters.to}
                  onChange={(event) =>
                    setOrderFilters({
                      to: event.target.value,
                    })
                  }
                  className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-black"
                />
              </div>

              <OrdersTable
                orders={orders}
                loading={ordersLoading}
              />

              <Pagination
                pagination={orderPagination}
                onPageChange={(page) =>
                  setOrderFilters({ page })
                }
              />
            </Panel>
          </section>
        ) : null}

        {/* =====================================================
            PAYOUT
        ===================================================== */}

        {activeSection === "payout" ? (
          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <Panel
              title="Payout Summary"
              description="Eligible payouts are processed on the 10th of every month."
            >
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <PayoutCard
                  label="Available Payout"
                  value={formatCurrency(payoutSummary.pendingPayout)}
                  icon={IndianRupee}
                />

                <PayoutCard
                  label="Total Paid"
                  value={formatCurrency(payoutSummary.totalPaid)}
                  icon={ShieldCheck}
                />

                <PayoutCard
                  label="Lifetime Payable"
                  value={formatCurrency(
                    payoutSummary.lifetimePayable
                  )}
                  icon={CircleDollarSign}
                />

                <PayoutCard
                  label="Last Paid"
                  value={formatDate(payoutSummary.lastPaidAt)}
                  icon={CalendarDays}
                />
              </div>
            </Panel>

            <Panel
              title="Payout Account"
              description="Your registered payment details."
            >
              <div className="space-y-1 p-5">
                <SummaryRow
                  label="Method"
                  value={
                    affiliate?.payoutAccount?.method ||
                    "Not added"
                  }
                  capitalize
                />

                <SummaryRow
                  label="UPI ID"
                  value={
                    affiliate?.payoutAccount?.upiId ||
                    "—"
                  }
                />

                <SummaryRow
                  label="Account holder"
                  value={
                    affiliate?.payoutAccount
                      ?.accountHolderName || "—"
                  }
                />

                <SummaryRow
                  label="Bank"
                  value={
                    affiliate?.payoutAccount?.bankName ||
                    "—"
                  }
                />

                <SummaryRow
                  label="IFSC"
                  value={
                    affiliate?.payoutAccount?.ifscCode ||
                    "—"
                  }
                />

                <SummaryRow
                  label="Last reference"
                  value={
                    payoutSummary.lastPaymentReference ||
                    "—"
                  }
                />
              </div>
            </Panel>
          </section>
        ) : null}

        {/* =====================================================
            TERMS
        ===================================================== */}

        {activeSection === "terms" ? (
          <section className="mt-6">
            <Panel
              title="Affiliate Terms & Conditions"
              description="Terms applicable to the OATCLUB Affiliate Program."
            >
              <div className="space-y-7 p-5 sm:p-7">
                <div className="rounded-2xl bg-black p-6 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                    Current introductory offer
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    ₹100 per eligible order
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                    OATCLUB currently offers a flat ₹100 commission
                    for every eligible order placed using your unique
                    affiliate coupon.
                  </p>
                </div>

                <TermsItem
                  number="01"
                  title="Assigned coupon code"
                >
                  OATCLUB will provide you with a unique affiliate
                  coupon code. Only orders placed using this assigned
                  code will be attributed to your account.
                </TermsItem>

                <TermsItem
                  number="02"
                  title="Eligible orders"
                >
                  An order becomes eligible for commission only after
                  successful delivery and completion of the applicable
                  return period without a return.
                </TermsItem>

                <TermsItem
                  number="03"
                  title="₹100 commission"
                >
                  Under the current introductory plan, the affiliate
                  earns a flat ₹100 for each eligible order.
                </TermsItem>

                <TermsItem
                  number="04"
                  title="Returns and cancellations"
                >
                  Cancelled, returned, refunded, failed delivery and
                  RTO orders are not eligible for affiliate
                  commission.
                </TermsItem>

              <TermsItem
  number="05"
  title="Commission approval & monthly payout"
>
  Every order goes through a 7-day return window after it is delivered.
  Your commission will remain <strong>Pending</strong> during this period.
  If the customer does not return the order and the return window closes
  successfully, your commission will be marked as
  <strong> Approved</strong>. All approved commissions are included in the
  next payout cycle, which is processed on the <strong>10th of every month</strong>.
</TermsItem>

                <TermsItem
                  number="06"
                  title="Payout information"
                >
                  Affiliates must provide correct UPI or bank details.
                  Delays caused by incorrect payment information may
                  be carried into the next payout cycle.
                </TermsItem>

                <TermsItem
                  number="07"
                  title="Order verification"
                >
                  OATCLUB may verify orders for duplicate activity,
                  self-ordering, fake orders, coupon misuse or
                  suspicious transactions before approving
                  commission.
                </TermsItem>

                <TermsItem
                  number="08"
                  title="Fair promotion"
                >
                  Affiliates must not make false product claims,
                  mislead customers, spam users or promote the coupon
                  through fraudulent methods.
                </TermsItem>

                <TermsItem
                  number="09"
                  title="Account suspension"
                >
                  OATCLUB may pause or terminate an affiliate account
                  and reject unpaid commission in cases of fraud,
                  misuse or policy violations.
                </TermsItem>

                <TermsItem
                  number="10"
                  title="Program updates"
                >
                  OATCLUB may revise commission amounts, coupon
                  benefits, eligibility rules or payout schedules as
                  the program grows.
                </TermsItem>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <div>
                      <p className="text-sm font-semibold">
                        Payout summary
                      </p>

                    <ul className="mt-3 space-y-2 text-xs leading-5 text-neutral-600">
  <li>• Earn ₹100 for every eligible order.</li>
  <li>• Only orders placed using your assigned coupon qualify.</li>
  <li>• Commission remains pending during the 7-day return window.</li>
  <li>• If the order is not returned, the commission becomes approved.</li>
  <li>• Approved commissions are paid on the 10th of every month.</li>
  <li>• Cancelled, returned, refunded and RTO orders are not eligible.</li>
</ul>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          </section>
        ) : null}

        {/* =====================================================
            PROFILE
        ===================================================== */}

        {activeSection === "profile" ? (
          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <Panel
              title="Affiliate Profile"
              description="Your contact and account details."
            >
              <div className="space-y-1 p-5">
                <SummaryRow
                  label="Affiliate number"
                  value={affiliate?.affiliateNumber || "—"}
                />

                <SummaryRow
                  label="Name"
                  value={affiliate?.name || "—"}
                />

                <SummaryRow
                  label="Username"
                  value={`@${affiliate?.username || "—"}`}
                />

                <SummaryRow
                  label="Email"
                  value={affiliate?.email || "—"}
                />

                <SummaryRow
                  label="Phone"
                  value={affiliate?.phone || "—"}
                />

                <SummaryRow
                  label="State"
                  value={affiliate?.state || "—"}
                />

                <SummaryRow
                  label="Platform"
                  value={affiliate?.platform || "—"}
                  capitalize
                />
              </div>
            </Panel>

            <Panel
              title="Commercial Terms"
              description="Your coupon and commission configuration."
            >
              <div className="space-y-1 p-5">
                <SummaryRow
                  label="Coupon code"
                  value={affiliate?.coupon?.code || "—"}
                />

                <SummaryRow
                  label="Customer discount"
                  value={`${
                    affiliate?.coupon?.discountValue || 0
                  }${
                    affiliate?.coupon?.discountType ===
                    "percentage"
                      ? "%"
                      : " flat"
                  }`}
                />

                <SummaryRow
                  label="Commission"
                  value="₹100 per eligible order"
                />

                <SummaryRow
                  label="Approval"
                  value="Delivered and not returned"
                />

                <SummaryRow
                  label="Payout cycle"
                  value="10th of every month"
                />

                <SummaryRow
                  label="Coupon expiry"
                  value={formatDate(coupon?.validTill)}
                />
              </div>
            </Panel>
          </section>
        ) : null}

        {/* =====================================================
            SECURITY
        ===================================================== */}

        {activeSection === "security" ? (
          <section className="mt-6">
            <Panel
              title="Change Password"
              description="Use a secure password with at least six characters."
            >
              <form
                onSubmit={submitPassword}
                className="max-w-2xl space-y-5 p-5"
              >
                {[
                  ["currentPassword", "Current Password"],
                  ["newPassword", "New Password"],
                  ["confirmPassword", "Confirm New Password"],
                ].map(([field, label]) => (
                  <label key={field} className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      {label}
                    </span>

                    <div className="relative">
                      <KeyRound
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                      />

                      <input
                        type={
                          showPasswords ? "text" : "password"
                        }
                        value={passwordForm[field]}
                        onChange={(event) =>
                          setPasswordForm((current) => ({
                            ...current,
                            [field]: event.target.value,
                          }))
                        }
                        minLength={6}
                        required
                        className="h-12 w-full rounded-xl border border-neutral-200 pl-10 pr-12 text-sm outline-none focus:border-black"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords(
                            (current) => !current
                          )
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                        aria-label="Toggle password visibility"
                      >
                        {showPasswords ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </label>
                ))}

                <button
                  type="submit"
                  disabled={mutationLoading}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-black px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-50"
                >
                  {mutationLoading ? (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <KeyRound size={15} />
                  )}

                  Update Password
                </button>
              </form>
            </Panel>
          </section>
        ) : null}
      </div>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function Alert({ type, children }) {
  const success = type === "success";

  return (
    <div
      className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {children}
    </div>
  );
}

function PolicyNotice({ onOpenTerms }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
          <Info size={17} />
        </div>

        <div>
          <p className="text-sm font-semibold">
            Affiliate payout policy
          </p>

          <p className="mt-2 max-w-4xl text-xs leading-6 text-neutral-500">
            Earn ₹100 for every eligible order placed using your
            assigned coupon. The order must be delivered and not
            returned. Eligible payouts are processed on the 10th of
            every month.
          </p>

          <button
            type="button"
            onClick={onOpenTerms}
            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold underline underline-offset-4"
          >
            Read full terms
            <FileText size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  loading,
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            {label}
          </p>

          <div className="mt-3 min-h-8">
            {loading ? (
              <Loader2
                size={19}
                className="animate-spin text-neutral-400"
              />
            ) : (
              <p className="text-2xl font-semibold tracking-[-0.03em]">
                {value}
              </p>
            )}
          </div>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function SmallMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function Panel({ title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-5 py-4">
        <h2 className="text-sm font-semibold">{title}</h2>

        {description ? (
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </section>
  );
}

function SummaryRow({
  label,
  value,
  capitalize = false,
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-neutral-100 py-3.5 last:border-b-0">
      <span className="text-xs text-neutral-500">
        {label}
      </span>

      <span
        className={`text-right text-sm font-medium ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function PayoutCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
          {label}
        </p>

        <Icon size={16} className="text-neutral-400" />
      </div>

      <p className="mt-3 text-xl font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.11em] ring-1 ring-inset ${getBadgeClass(
        status
      )}`}
    >
      {String(status || "unknown").replaceAll("_", " ")}
    </span>
  );
}

function TermsItem({ number, title, children }) {
  return (
    <div className="grid gap-4 border-b border-neutral-100 pb-7 last:border-b-0 last:pb-0 sm:grid-cols-[52px_1fr]">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-xs font-semibold">
        {number}
      </div>

      <div>
        <h3 className="text-sm font-semibold">{title}</h3>

        <p className="mt-2 max-w-4xl text-sm leading-7 text-neutral-500">
          {children}
        </p>
      </div>
    </div>
  );
}

function Pagination({ pagination, onPageChange }) {
  const page = Number(pagination?.page || 1);
  const totalPages = Number(
    pagination?.totalPages || 1
  );

  return (
    <div className="flex flex-col gap-3 border-t border-neutral-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-neutral-500">
        Page {page} of {totalPages} ·{" "}
        {pagination?.total || 0} orders
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!pagination?.hasPreviousPage}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-medium disabled:opacity-40"
        >
          <ChevronLeft size={14} />
          Previous
        </button>

        <button
          type="button"
          disabled={!pagination?.hasNextPage}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-medium disabled:opacity-40"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function OrdersTable({ orders, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-16 text-sm text-neutral-500">
        <Loader2 size={17} className="animate-spin" />
        Loading orders...
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="px-5 py-16 text-center">
        <Gift
          size={24}
          className="mx-auto text-neutral-300"
        />

        <p className="mt-4 text-sm font-semibold">
          No affiliate orders found
        </p>

        <p className="mt-2 text-xs text-neutral-500">
          Orders placed using your coupon will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1000px] w-full">
        <thead className="bg-neutral-50">
          <tr className="text-left text-[10px] uppercase tracking-[0.13em] text-neutral-500">
            <th className="px-5 py-3 font-semibold">
              Order
            </th>

            <th className="px-5 py-3 font-semibold">
              Date
            </th>

            <th className="px-5 py-3 font-semibold">
              Order Value
            </th>

            <th className="px-5 py-3 font-semibold">
              Commission
            </th>

            <th className="px-5 py-3 font-semibold">
              Commission Status
            </th>

            <th className="px-5 py-3 font-semibold">
              Payment
            </th>

            <th className="px-5 py-3 font-semibold">
              Fulfilment
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-neutral-100">
          {orders.map((order) => (
            <tr
              key={order._id}
              className="hover:bg-neutral-50"
            >
              <td className="px-5 py-4">
                <p className="text-sm font-semibold">
                  {order.orderNumber}
                </p>
              </td>

              <td className="px-5 py-4 text-xs text-neutral-500">
                {formatDate(order.createdAt)}
              </td>

              <td className="px-5 py-4 text-sm font-medium">
                {formatCurrency(order.finalPayable)}
              </td>

              <td className="px-5 py-4 text-sm font-medium">
                {formatCurrency(
                  order.affiliateEvaluation?.amount
                )}
              </td>

              <td className="px-5 py-4">
                <StatusBadge
                  status={
                    order.affiliateEvaluation?.status
                  }
                />
              </td>

              <td className="px-5 py-4">
                <StatusBadge
                  status={order.paymentStatus}
                />
              </td>

              <td className="px-5 py-4">
                <StatusBadge
                  status={order.fulfillmentStatus}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}