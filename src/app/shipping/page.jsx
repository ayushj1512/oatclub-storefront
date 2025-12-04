"use client";

import Link from "next/link";

export default function ShippingPolicyPage() {
  return (
    <main className="w-full bg-white text-gray-900">
      <section className="w-full px-4 md:px-10 py-10 md:py-14">
        <div className="w-full">
          <div className="flex flex-col gap-2 mb-8">
            <p className="text-xs font-semibold text-[#800020] tracking-widest uppercase">Miray Fashions</p>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Shipping Policy</h1>
            <p className="text-sm md:text-base text-gray-600">Dispatch timelines, delivery expectations, tracking, cancellations, and transit issues.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-8">
            {/* CONTENT */}
            <div className="space-y-8">
              <div className="rounded-2xl border border-gray-200 p-5 md:p-6 bg-gray-50">
                <p className="text-sm md:text-base text-gray-700">
                  Miray Fashions (“we” &amp; “us”) is the operator of https://mirayfashions.com/ and the Miray Fashions App.
                  By placing an order through this website/app you agree to the Terms &amp; Conditions below. These are provided to ensure both parties are aware of and agree upon this arrangement to mutually protect and set expectations on our service.
                </p>
              </div>

              {/* QUICK HIGHLIGHTS */}
              <div className="rounded-2xl border border-gray-200 p-5 md:p-6">
                <h2 className="text-lg md:text-xl font-bold mb-3">Quick Highlights</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li><span className="font-semibold">Dispatch:</span> 2–7 days (Mon–Sat, excluding national holidays)</li>
                  <li><span className="font-semibold">Delivery after dispatch:</span> 4–5 business days (may vary by location)</li>
                  <li><span className="font-semibold">Flat shipping fee:</span> ₹50 on all orders</li>
                  <li><span className="font-semibold">COD handling fee:</span> +₹25 (only for Cash on Delivery)</li>
                  <li><span className="font-semibold">Tracking:</span> shared via email + available in account (allow 24 hrs for updates)</li>
                  <li><span className="font-semibold">Cancellations:</span> allowed only before dispatch (via ticket)</li>
                </ul>
              </div>

              {/* 1. GENERAL TERMS */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">1. General Terms</h2>
                <p className="text-sm md:text-base text-gray-700">
                  Dispatch of the order(s) is subject to stock availability. We try to maintain accurate stock counts on our website but from time-to-time there may be a stock discrepancy and we may not be able to fulfill all your product(s) at time of purchase.
                  In this instance, we will dispatch the available product(s) to you. The remaining product(s), if any, will be dispatched once the product(s) are available in our warehouse for dispatch.
                </p>
              </div>

              {/* 2. SHIPPING COSTS */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">2. Shipping Costs</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>Flat shipping fee: <span className="font-semibold">₹50</span> on all orders.</li>
                  <li>Cash on Delivery (COD) handling fee: <span className="font-semibold">₹25</span> (additional).</li>
                </ul>
              </div>

              {/* 3. DISPATCH / DELIVERY TERMS */}
              <div className="space-y-4">
                <h2 className="text-xl md:text-2xl font-extrabold">3. Dispatch / Delivery Terms</h2>

                <div className="rounded-2xl border border-gray-200 p-5 md:p-6 bg-gray-50">
                  <h3 className="text-base md:text-lg font-bold">Dispatch Time</h3>
                  <p className="text-sm md:text-base text-gray-700 mt-2">
                    We process and dispatch every order within <span className="font-semibold">2–7 days</span> of receiving it.
                    Our warehouse operates from <span className="font-semibold">Monday–Saturday</span> during standard business hours, except on national holidays.
                    In these instances, we take steps to ensure shipment delays will be kept to a minimum.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-5 md:p-6">
                  <h3 className="text-base md:text-lg font-bold">Delivery Time</h3>
                  <p className="text-sm md:text-base text-gray-700 mt-2">
                    Your order will get delivered within <span className="font-semibold">4–5 business days</span> once the order is dispatched, depending on your location in India.
                    In some cases, it may take longer depending on the accessibility of your location.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-5 md:p-6 bg-gray-50">
                  <h3 className="text-base md:text-lg font-bold">Change of Delivery Address</h3>
                  <p className="text-sm md:text-base text-gray-700 mt-2">
                    For any change in delivery address, kindly raise a <span className="font-semibold">TICKET</span> from your Miray Fashions Account.
                    We can change the address any time <span className="font-semibold">before the order is dispatched</span>.
                    No change in address can be made once the order is picked by our courier partner for shipping.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-5 md:p-6">
                  <h3 className="text-base md:text-lg font-bold">Product(s) Out of Stock</h3>
                  <p className="text-sm md:text-base text-gray-700 mt-2">
                    If a product(s) is out of stock, we will dispatch the in-stock items first. The remaining product(s) will be dispatched once they are back in stock.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-5 md:p-6 bg-gray-50">
                  <h3 className="text-base md:text-lg font-bold">Dispatch/Delivery Time Exceeded</h3>
                  <p className="text-sm md:text-base text-gray-700 mt-2">
                    If the dispatch/delivery timeframe has exceeded the forecasted time, please contact us by raising a <span className="font-semibold">TICKET</span> so that we can conduct an investigation and provide you with a solution.
                  </p>
                </div>
              </div>

              {/* 4. TRACKING */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">4. Tracking Notifications</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>Upon dispatch, customers will receive a tracking link to the registered email ID to follow the shipment progress based on courier updates.</li>
                  <li>The tracking ID will also be available under the order details in the Miray Fashions Account.</li>
                  <li>Please allow <span className="font-semibold">24 hours</span> for tracking details to be updated once the order is picked up for shipping.</li>
                </ul>
              </div>

              {/* 5. LOST / DAMAGED */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">5. Order(s) Lost / Damaged in Transit</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>If an order is damaged in-transit at the time of delivery, please <span className="font-semibold">reject the parcel</span> and contact support by raising a <span className="font-semibold">TICKET</span>.</li>
                  <li>If an order is delivered without you being present, please contact support by raising a <span className="font-semibold">TICKET</span> with adequate details.</li>
                  <li>If an order has been lost in-transit, please raise a <span className="font-semibold">TICKET</span> so we can conduct an internal probe with our courier partner.</li>
                </ul>
                <p className="text-sm md:text-base text-gray-700">
                  We will process a refund or replacement as soon as the courier partner completes their investigation into the claim.
                </p>
              </div>

              {/* 6. CANCELLATIONS */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">6. Cancellations</h2>
                <p className="text-sm md:text-base text-gray-700">
                  Cancellation of orders can be requested <span className="font-semibold">before the order is dispatched</span>. For cancellation requests kindly raise a <span className="font-semibold">TICKET</span> from your Miray Fashions Account.
                  Cancellation requests can’t be processed once the order is dispatched.
                </p>
              </div>

              {/* 7. MARKED DELIVERED */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">7. Marked Delivered but Not Delivered</h2>
                <p className="text-sm md:text-base text-gray-700">
                  If your order has been marked delivered by our courier partner but has not been delivered, the issue must be raised within <span className="font-semibold">24 hours</span> by raising a <span className="font-semibold">TICKET</span> from your Miray Fashions Account.
                  We will coordinate with our courier partner to resolve it as soon as possible.
                </p>
              </div>

              {/* 8. SUPPORT */}
              <div className="rounded-2xl border border-gray-200 p-5 md:p-6 bg-gray-50">
                <h2 className="text-lg md:text-xl font-bold mb-2">8. Customer Support</h2>
                <p className="text-sm md:text-base text-gray-700">
                  For all support related queries/issues, please raise a <span className="font-semibold">TICKET</span> from your Miray Fashions Account. We will respond within <span className="font-semibold">48 hours</span> of receiving the ticket.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/support" className="inline-flex items-center justify-center rounded-full bg-[#800020] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
                    Go to Support
                  </Link>
                  <Link href="/faq" className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-white transition">
                    Read FAQs
                  </Link>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Miray Fashions reserves the right to amend this Shipping Policy at any time. Updated terms will apply from the date of posting.
              </p>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-4">
              <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
                <h3 className="text-base font-bold mb-2">Shipping Charges</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li><span className="font-semibold">Flat shipping:</span> ₹50</li>
                  <li><span className="font-semibold">COD fee:</span> +₹25</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5">
                <h3 className="text-base font-bold mb-2">Timelines</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li><span className="font-semibold">Dispatch:</span> 2–7 days</li>
                  <li><span className="font-semibold">Delivery:</span> 4–5 business days after dispatch</li>
                  <li><span className="font-semibold">Tracking update:</span> allow 24 hrs</li>
                  <li><span className="font-semibold">Marked delivered issue:</span> raise within 24 hrs</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
                <h3 className="text-base font-bold mb-2">Quick Actions</h3>
                <div className="flex flex-col gap-2 text-sm">
                  <Link href="/support" className="text-[#800020] font-semibold hover:opacity-80 transition">Raise a Ticket</Link>
                  <Link href="/profile" className="text-[#800020] font-semibold hover:opacity-80 transition">My Account</Link>
                  <Link href="/exchange-and-return" className="text-[#800020] font-semibold hover:opacity-80 transition">Exchange &amp; Return</Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
