export default function Shimmer({ height = 300 }) {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden bg-gray-100 relative"
      style={{ height }}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
    </div>
  );
}
