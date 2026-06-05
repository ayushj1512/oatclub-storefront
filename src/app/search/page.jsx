import { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";
import UniversalLuxuryLoader from "@/components/common/UniversalLuxuryLoader";

export default function Page() {
  return (
    <Suspense fallback={<UniversalLuxuryLoader />}>
      <SearchPageClient />
    </Suspense>
  );
}
