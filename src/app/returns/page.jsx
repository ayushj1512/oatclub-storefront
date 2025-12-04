"use client";

import Link from "next/link";

export default function ExchangeAndReturnPage() {
  return (
    <main className="w-full bg-white text-gray-900">
      <section className="w-full px-4 md:px-10 py-10 md:py-14">
        <div className="w-full">
          <div className="flex flex-col gap-2 mb-8">
            <p className="text-xs font-semibold text-[#800020] tracking-widest uppercase">Miray Fashion</p>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Exchange &amp; Return Policy</h1>
            <p className="text-sm md:text-base text-gray-600">Read our size exchange and return policy, timelines, fees, and the process to raise a request.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-8">
            {/* CONTENT */}
            <div className="space-y-8">
              {/* QUICK HIGHLIGHTS */}
              <div className="rounded-2xl border border-gray-200 p-5 md:p-6 bg-gray-50">
                <h2 className="text-lg md:text-xl font-bold mb-3">Quick Highlights</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li><span className="font-semibold">7-day open window</span> from the date of delivery for <span className="font-semibold">Size Exchange</span> and <span className="font-semibold">Returns</span>.</li>
                  <li><span className="font-semibold">Size Exchange:</span> Only size exchange is allowed (subject to stock availability).</li>
                  <li><span className="font-semibold">Return:</span> <span className="font-semibold">No-questions-asked</span> return within 7 days (subject to conditions below).</li>
                  <li><span className="font-semibold">Exchange fee:</span> INR <span className="font-semibold">99</span> (charged once per order even if delivered in parts).</li>
                  <li><span className="font-semibold">Second exchange:</span> INR <span className="font-semibold">250</span>.</li>
                  <li><span className="font-semibold">Damaged/defective/wrong item:</span> Raise a ticket within <span className="font-semibold">24 hours</span>.</li>
                </ul>
              </div>

              {/* EXCHANGE POLICY */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">Exchange Policy</h2>
                <p className="text-sm md:text-base text-gray-700">
                  Miray Fashion’s <span className="font-semibold">7 days Size Exchange</span> policy gives you the option to exchange items purchased from the website/app
                  for <span className="font-semibold">size only</span> within <span className="font-semibold">7 days</span> of receipt of the item. We only ask that you don’t use the product and preserve its original condition, tags and packaging.
                  You are welcome to try on a product but please take adequate measures to preserve its condition.
                </p>

                <div className="rounded-2xl border border-gray-200 p-5 md:p-6">
                  <h3 className="text-base md:text-lg font-bold mb-2">Exchange Fee</h3>
                  <p className="text-sm md:text-base text-gray-700">
                    For all size exchanges, a nominal exchange fee of <span className="font-semibold">INR 99</span> will be charged which will be included in the replacement order invoice.
                    This fee helps cover the cost of processing and handling the exchange. The exchange fee is charged only once in case the original order is split and products are delivered separately.
                  </p>
                  <p className="text-sm md:text-base text-gray-700 mt-3"><span className="font-semibold">Note:</span> All exchanges are subject to stock availability.</p>
                </div>
              </div>

              {/* RETURN POLICY (ADDED) */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">Return Policy (7-Day Open Window)</h2>
                <p className="text-sm md:text-base text-gray-700">
                  Miray Fashion offers a <span className="font-semibold">7-day no-questions-asked return</span> window from the date of delivery. You can raise a return request within 7 days,
                  and we will arrange the return pickup (subject to service availability in your pincode), as long as the product meets the conditions listed below.
                </p>
                <div className="rounded-2xl border border-gray-200 p-5 md:p-6 bg-gray-50">
                  <h3 className="text-base md:text-lg font-bold mb-2">Return Conditions</h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                    <li>Product(s) must be <span className="font-semibold">unused</span>, in original condition, with <span className="font-semibold">all tags</span> and <span className="font-semibold">original packaging</span> intact.</li>
                    <li>For sets/combos, <span className="font-semibold">return must be initiated for the entire set/combo</span> (individual items cannot be returned separately).</li>
                    <li>Our courier partner will pick up only the product(s) that you submit in the return request.</li>
                    <li>Return pickup is subject to the availability of service in your area pincode.</li>
                  </ul>
                </div>
                <p className="text-sm md:text-base text-gray-700">
                  <span className="font-semibold">Refunds:</span> Once the returned product passes inspection, the refund will be processed to the original payment method or as store credit (as applicable), after verification.
                </p>
              </div>

              {/* TERMS & CONDITIONS */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">Terms &amp; Conditions (Exchange &amp; Return)</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>All product(s) to be exchanged/returned must be unused and should be in their original condition with all tags and packaging intact (e.g. shoes must be packed in the original shoe box).</li>
                  <li>An exchange fee of <span className="font-semibold">INR 99</span> applies to size exchange and will be included in the replacement order invoice.</li>
                  <li>Please allow <span className="font-semibold">24 hours post-delivery</span> of your order for your Exchange/Return option to be updated beside your order in your Miray Fashion account.</li>
                  <li>Please check the product(s), reason, and other related details carefully. Our courier partner will pick up only the product(s) mentioned at the time of submitting the request.</li>
                  <li>If the product(s) handed over to the courier executive don’t match the request details, the pickup may be cancelled by the courier executive.</li>
                  <li>Any exchange/return for a set/combo has to be carried out for the whole set/combo. Individual product(s) from the set/combo can’t be exchanged/returned separately.</li>
                  <li>Miray Fashion is not liable for any extra product(s) or wrong product(s) handed over to the courier executive at the time of pickup.</li>
                  <li>Reverse pick up is subject to the availability of the service in your area pincode.</li>
                  <li>Proper images of the product(s) with tags should be uploaded at the time of initiating the exchange/return process for the request to be accepted. Invalid images may lead to rejection.</li>
                </ul>
              </div>

              {/* SECOND EXCHANGE */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">Second Size Exchange</h2>
                <p className="text-sm md:text-base text-gray-700">
                  We do not have a second size exchange policy. However, if you still want to initiate the exchange, an exchange fee of <span className="font-semibold">INR 250</span> will be applicable for a second exchange.
                </p>
              </div>

              {/* DAMAGED / DEFECTIVE */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">Damaged / Defective / Incomplete / Wrong Order</h2>
                <p className="text-sm md:text-base text-gray-700">
                  We strive to deliver the best quality standards. However, in case you receive a damaged / defective product(s), we should be notified within <span className="font-semibold">24 hours</span> of delivery by raising a <span className="font-semibold">TICKET</span> from your Miray Fashion account.
                  After careful inspection of your issue raised, we will replace the product(s) with the correct one.
                </p>
              </div>

              {/* PICKUP TIMELINE */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">Pickup Timeline</h2>
                <p className="text-sm md:text-base text-gray-700">
                  Reverse pickup will be done in <span className="font-semibold">2-3 working days</span> by our courier partner. However, the reverse pickup solely depends on the service availability in your PINCODE.
                  In case your pincode is non-serviceable for a reverse pickup, you’ll have to courier the product(s) to us and we will reimburse the courier charges up to <span className="font-semibold">INR 250</span> as applicable.
                </p>
              </div>

              {/* FAILED PICKUP */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">Why did the pickup fail?</h2>
                <p className="text-sm md:text-base text-gray-700">
                  We make <span className="font-semibold">three attempts</span> to pick up the order. If the order is not picked up on the third attempt, the pickup request will be marked as failed.
                  We will reinitiate the pickup in such cases once you reach us by raising a <span className="font-semibold">TICKET</span> from your Miray Fashion account.
                </p>
              </div>

              {/* SUPPORT */}
              <div className="rounded-2xl border border-gray-200 p-5 md:p-6 bg-gray-50">
                <h2 className="text-lg md:text-xl font-bold mb-2">Need Help?</h2>
                <p className="text-sm md:text-base text-gray-700">
                  In case you have any issues with the order(s), kindly raise a <span className="font-semibold">TICKET</span> from your Miray Fashion Account and we will try our best to provide a solution within <span className="font-semibold">48 hours</span> of raising your TICKET.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/contact" className="inline-flex items-center justify-center rounded-full bg-[#800020] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
                    Contact Support
                  </Link>
                  <Link href="/profile" className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-white transition">
                    Go to My Account
                  </Link>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Miray Fashion reserves the right to amend these terms and conditions at any time. Any request for exchange/return will be accepted after proper inspection of the request and is under the sole discretion of Miray Fashion to accept or deny.
              </p>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-4">
              <div className="rounded-2xl border border-gray-200 p-5">
                <h3 className="text-base font-bold mb-2">Important Timelines</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li><span className="font-semibold">Exchange window:</span> 7 days from delivery</li>
                  <li><span className="font-semibold">Return window:</span> 7 days from delivery</li>
                  <li><span className="font-semibold">Ticket (damage/wrong):</span> Within 24 hours</li>
                  <li><span className="font-semibold">Pickup attempts:</span> Up to 3</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
                <h3 className="text-base font-bold mb-2">Fees</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li><span className="font-semibold">Size exchange:</span> INR 99</li>
                  <li><span className="font-semibold">Second exchange:</span> INR 250</li>
                  <li><span className="font-semibold">Courier reimbursement (non-serviceable pincode):</span> Up to INR 250</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5">
                <h3 className="text-base font-bold mb-2">Where to raise a request?</h3>
                <p className="text-sm text-gray-700">Go to your account and raise an Exchange/Return request or a Ticket.</p>
                <div className="mt-3">
                  <Link href="/profile" className="inline-flex items-center justify-center w-full rounded-full bg-black px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
                    My Account
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
