"use client";

import { Toaster } from "react-hot-toast";

export default function ClientProviders({ children }) {
  return (
    <>
      {children}
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}
