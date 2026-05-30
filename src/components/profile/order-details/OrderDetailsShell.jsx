"use client";

export default function OrderDetailsShell({
  children,
  className = "",
}) {
  return (
    <div className={`w-full space-y-4 ${className}`}>
      <div className="mx-auto w-full max-w-none space-y-4">
        {children}
      </div>
    </div>
  );
}