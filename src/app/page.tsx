import HomeClient from "@/components/home/HomeClient";

// ✅ Do NOT use "use client" here (it’s a server component by default)
export default function HomePage() {
  return <HomeClient />;
}
