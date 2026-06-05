import Link from "next/link";

export const INFO_NAV = [
  ["Support", "/support"],
  ["FAQs", "/faq"],
  ["Shipping Policy", "/shipping-policy"],
  ["Exchange & Return", "/exchange-and-return"],
  ["Cancellation & Refund", "/cancellation-and-refund"],
  ["Privacy Policy", "/privacy-policy"],
  ["Terms & Conditions", "/terms-and-conditions"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

export function InfoPageLayout({
  eyebrow = "OATCLUB CARE",
  title,
  intro,
  children,
  activePath,
  aside,
}) {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="border-b border-black/10 bg-[#fbfbfb] px-3 py-8 md:px-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-[9px] font-black uppercase tracking-[0.32em] text-black/45">
            {eyebrow}
          </p>
          <h1 className="mt-2 max-w-3xl text-2xl font-black uppercase leading-tight md:text-4xl">
            {title}
          </h1>
          {intro ? (
            <p className="mt-3 max-w-2xl text-xs font-bold uppercase leading-6 tracking-[0.08em] text-black/55 md:text-sm">
              {intro}
            </p>
          ) : null}
        </div>
      </section>

      <section className="px-3 py-4 md:px-8 md:py-7">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[230px_1fr_290px]">
          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <nav className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto border-b border-black/10 px-3 pb-3 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:border-b-0 lg:px-0 lg:pb-0">
              {INFO_NAV.map(([label, href]) => {
                const active = activePath === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`shrink-0 border px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] transition lg:block lg:border-0 lg:border-b lg:px-0 lg:py-3 ${
                      active
                        ? "border-black bg-black text-white lg:bg-transparent lg:text-black"
                        : "border-black/10 text-black/55 hover:text-black"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <article className="min-w-0 space-y-4">{children}</article>

          <aside className="space-y-3 lg:sticky lg:top-28 lg:h-fit">
            {aside || (
              <InfoCallout
                label="NEED HELP?"
                title="WE REPLY ON WEEKDAYS"
                body="Email us with your order number and a clear note. We will keep it simple."
                action={{ href: "mailto:hey@oatclub.in", label: "EMAIL OATCLUB" }}
              />
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

export function InfoBlock({ title, children }) {
  return (
    <section className="border-b border-black/10 pb-5">
      <h2 className="text-base font-black uppercase leading-6 tracking-[0.04em] md:text-lg">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm font-medium leading-7 text-black/68 md:text-[15px]">
        {children}
      </div>
    </section>
  );
}

export function InfoCallout({ label, title, body, action }) {
  return (
    <div className="border border-black/10 bg-[#fbfbfb] p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-black/40">
        {label}
      </p>
      <h3 className="mt-2 text-sm font-black uppercase leading-5">{title}</h3>
      <p className="mt-2 text-xs font-bold uppercase leading-5 tracking-[0.06em] text-black/55">
        {body}
      </p>
      {action ? (
        <Link
          href={action.href}
          className="mt-4 flex h-10 items-center justify-center bg-black text-[9px] font-black uppercase tracking-[0.18em] text-white"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function InfoTable({ rows }) {
  return (
    <div className="overflow-hidden border border-black/10">
      <table className="w-full text-left text-[11px] font-bold uppercase tracking-[0.08em]">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-black/10 last:border-b-0">
              <th className="w-[42%] bg-[#fbfbfb] px-3 py-3 align-top text-black/45">
                {label}
              </th>
              <td className="px-3 py-3 align-top text-black/75">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
