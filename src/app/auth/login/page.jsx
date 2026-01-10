import { Suspense } from "react";
import LoginClient from "./LoginClient";
import UniversalLuxuryLoader from "@/components/common/UniversalLuxuryLoader";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <UniversalLuxuryLoader />
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
