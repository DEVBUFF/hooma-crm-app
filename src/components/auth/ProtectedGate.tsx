"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSalonByOwnerId } from "@/lib/salon";

export function ProtectedGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [checkingSalon, setCheckingSalon] = useState(true);

  useEffect(() => {
    if (loading) return;

    // Not logged in → go to login
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    // Logged in → check if salon exists
    (async () => {
      setCheckingSalon(true);
      const salon = await getSalonByOwnerId(user.uid);

      const isOnboarding = pathname.startsWith("/onboarding");

      if (!salon && !isOnboarding) {
        router.replace("/onboarding");
        setCheckingSalon(false);
        return;
      }

      if (salon && isOnboarding) {
        router.replace("/app");
        setCheckingSalon(false);
        return;
      }

      // All good
      setCheckingSalon(false);

      // Optional: if user lands on "/" redirect them
      if (pathname === "/") {
        router.replace(salon ? "/app" : "/onboarding");
      }
    })();
  }, [loading, user, pathname, router]);

  if (loading || checkingSalon) return null; // You can render a loader here
  return <>{children}</>;
}