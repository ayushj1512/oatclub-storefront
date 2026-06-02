export default function TestPage() {
  const options = [
    {
      title: "Option 1",
      content: (
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-semibold">
            Shop By Collection
          </h2>
        </div>
      ),
    },

    {
      title: "Option 2",
      content: (
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-black/10" />
          <h2 className="uppercase tracking-[0.35em] text-sm md:text-lg font-medium">
            Shop By Collection
          </h2>
          <div className="flex-1 h-px bg-black/10" />
        </div>
      ),
    },

    {
      title: "Option 3",
      content: (
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-black/40">
            Discover
          </p>
          <h2 className="mt-2 text-4xl md:text-6xl font-semibold">
            Collections
          </h2>
        </div>
      ),
    },

    {
      title: "Option 4",
      content: (
        <div className="text-center">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
            COLLECTIONS
          </h2>
        </div>
      ),
    },

    {
      title: "Option 5",
      content: (
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-semibold">
            Shop By Collection
          </h2>
          <div className="w-14 h-px bg-black mx-auto mt-4" />
        </div>
      ),
    },

    {
      title: "Option 6",
      content: (
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-black/40 mb-2">
            OATCLUB
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold">
            Shop By Collection
          </h2>
        </div>
      ),
    },

    {
      title: "Option 7",
      content: (
        <div className="text-center">
          <span className="border border-black/10 rounded-full px-4 py-1 text-xs uppercase tracking-[0.3em]">
            Collections
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-semibold">
            Style By Collection
          </h2>
        </div>
      ),
    },

    {
      title: "Option 8",
      content: (
        <div className="text-center">
          <div className="inline-flex items-center gap-3">
            <div className="w-8 h-px bg-black/20" />
            <span className="text-xs uppercase tracking-[0.4em] text-black/40">
              Collections
            </span>
            <div className="w-8 h-px bg-black/20" />
          </div>

          <h2 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight">
            Shop By Collection
          </h2>
        </div>
      ),
    },

    {
      title: "Option 9",
      content: (
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-black/40">
            OATCLUB
          </p>

          <h2 className="mt-3 text-5xl md:text-7xl font-semibold tracking-tight">
            Collections
          </h2>

          <p className="mt-3 text-sm text-black/50">
            Designed for every version of you
          </p>
        </div>
      ),
    },

    {
      title: "Option 10",
      content: (
        <div className="text-center">
          <h2 className="text-6xl md:text-8xl font-bold tracking-[-0.05em]">
            OAT
          </h2>

          <p className="mt-2 uppercase tracking-[0.45em] text-sm text-black/50">
            Shop By Collection
          </p>
        </div>
      ),
    },

    {
      title: "Option 11",
      content: (
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.4em] text-black/40">
            Explore
          </span>

          <h2 className="mt-3 text-4xl md:text-6xl font-semibold">
            Find Your Style
          </h2>
        </div>
      ),
    },

    {
      title: "Option 12",
      content: (
        <div className="flex items-center gap-5">
          <div className="flex-1 h-px bg-black/10" />

          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.35em] text-black/40">
              OATCLUB
            </p>

            <h2 className="text-xl md:text-3xl font-semibold">
              Shop By Collection
            </h2>
          </div>

          <div className="flex-1 h-px bg-black/10" />
        </div>
      ),
    },

    {
      title: "Option 13",
      content: (
        <div className="flex justify-between items-end">
          <h2 className="text-4xl md:text-6xl font-semibold">
            Collections
          </h2>

          <span className="uppercase text-xs tracking-[0.3em] text-black/40">
            OATCLUB
          </span>
        </div>
      ),
    },

    {
      title: "Option 14",
      content: (
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-light">
            Shop By
            <span className="font-semibold"> Collection</span>
          </h2>
        </div>
      ),
    },

    {
      title: "Option 15",
      content: (
        <div className="text-center">
          <span className="uppercase tracking-[0.5em] text-xs text-black/40">
            Curated
          </span>

          <h2 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight">
            Shop By Collection
          </h2>

          <p className="mt-2 text-sm text-black/50">
            Own All Trends
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-20">
        {options.map((item) => (
          <div key={item.title}>
            <div className="mb-6 text-xs font-medium text-black/40 uppercase">
              {item.title}
            </div>

            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}