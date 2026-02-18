"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSalonByOwnerId, Salon } from "@/lib/salon";

export function useSalon() {
  const { user } = useAuth();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const s = await getSalonByOwnerId(user.uid);
      setSalon(s);
      setLoading(false);
    })();
  }, [user]);

  return { salon, loading };
}