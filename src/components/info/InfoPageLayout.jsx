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
    <main className="min-h-screen overflow-x-hidden bg-white text-black">
      <section className="border-b border-black/10 bg-[#fbfbfb] px-3 py-6 md:px-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-[8.5px] font-black uppercase tracking-[0.26em] text-black/45 md:text-[9px] md:tracking-[0.32em]">
            {eyebrow}
          </p>
          <h1 className="mt-2 max-w-3xl text-[24px] font-black uppercase leading-[1.05] md:text-4xl">
            {title}
          </h1>
          {intro ? (
            <p className="mt-2.5 max-w-2xl text-[11px] font-bold uppercase leading-5 tracking-[0.06em] text-black/55 md:mt-3 md:text-sm md:leading-6 md:tracking-[0.08em]">
              {intro}
            </p>
          ) : null}
        </div>
      </section>

      <section className="px-3 py-3 md:px-8 md:py-7">
        <div className="mx-auto grid max-w-7xl gap-4 md:gap-6 lg:grid-cols-[230px_1fr_290px]">
          <aside className="hidden lg:sticky lg:top-28 lg:block lg:h-fit">
            <nav className="no-scrollbar -mx-3 flex snap-x gap-1.5 overflow-x-auto border-b border-black/10 px-3 pb-2.5 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:border-b-0 lg:px-0 lg:pb-0">
              {INFO_NAV.map(([label, href]) => {
                const active = activePath === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`snap-start shrink-0 border px-2.5 py-2 text-[8.5px] font-black uppercase tracking-[0.13em] transition lg:block lg:border-0 lg:border-b lg:px-0 lg:py-3 lg:text-[9px] lg:tracking-[0.16em] ${
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

          <article className="min-w-0 space-y-3.5 md:space-y-4">{children}</article>

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
    <section className="border-b border-black/10 pb-4 md:pb-5">
      <h2 className="text-[15px] font-black uppercase leading-5 tracking-[0.04em] md:text-lg md:leading-6">
        {title}
      </h2>
      <div className="mt-2.5 space-y-2.5 text-[13px] font-medium leading-6 text-black/68 md:mt-3 md:space-y-3 md:text-[15px] md:leading-7">
        {children}
      </div>
    </section>
  );
}

export function InfoCallout({ label, title, body, action }) {
  return (
    <div className="border border-black/10 bg-[#fbfbfb] p-3.5 md:p-4">
      <p className="text-[8.5px] font-black uppercase tracking-[0.2em] text-black/40 md:text-[9px] md:tracking-[0.24em]">
        {label}
      </p>
      <h3 className="mt-1.5 text-[12px] font-black uppercase leading-5 md:text-sm">{title}</h3>
      <p className="mt-1.5 text-[10px] font-bold uppercase leading-4 tracking-[0.05em] text-black/55 md:mt-2 md:text-xs md:leading-5 md:tracking-[0.06em]">
        {body}
      </p>
      {action ? (
        <Link
          href={action.href}
          className="mt-3 flex h-9 items-center justify-center bg-black text-[8.5px] font-black uppercase tracking-[0.16em] text-white md:mt-4 md:h-10 md:text-[9px] md:tracking-[0.18em]"
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
      <div className="md:hidden">
        {rows.map(([label, value]) => (
          <div key={label} className="border-b border-black/10 last:border-b-0">
            <div className="bg-[#fbfbfb] px-3 py-2 text-[8.5px] font-black uppercase tracking-[0.16em] text-black/45">
              {label}
            </div>
            <div className="px-3 py-2.5 text-[11px] font-bold uppercase leading-5 tracking-[0.06em] text-black/72">
              {value}
            </div>
          </div>
        ))}
      </div>
      <table className="hidden w-full text-left text-[11px] font-bold uppercase tracking-[0.08em] md:table">
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
