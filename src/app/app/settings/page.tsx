"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSalon } from "@/lib/useSalon";
import { t } from "@/lib/tokens";
import { Skeleton } from "@/components/patterns/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save } from "lucide-react";

const DATE_FORMATS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY", example: "27/03/2026" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY", example: "03/27/2026" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD", example: "2026-03-27" },
];

const CURRENCIES = [
  { value: "GEL", label: "GEL — Georgian Lari" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "TRY", label: "TRY — Turkish Lira" },
];

const inputStyle: React.CSSProperties = {
  background: t.colors.semantic.bg,
  color: t.colors.semantic.text,
  border: `1px solid ${t.colors.semantic.borderSubtle}`,
  borderRadius: `${t.radius.lg}px`,
};

export default function SettingsPage() {
  const { salon, loading: salonLoading } = useSalon();

  const [currency, setCurrency] = useState("");
  const [dateFormat, setDateFormat] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Seed form from salon settings once loaded
  useEffect(() => {
    if (!salon || loaded) return;
    setCurrency(salon.settings?.currency ?? "GEL");
    setDateFormat(salon.settings?.dateFormat ?? "DD/MM/YYYY");
    setLoaded(true);
  }, [salon, loaded]);

  const hasChanges = useCallback(() => {
    if (!salon) return false;
    return (
      currency !== (salon.settings?.currency ?? "GEL") ||
      dateFormat !== (salon.settings?.dateFormat ?? "DD/MM/YYYY")
    );
  }, [salon, currency, dateFormat]);

  async function handleSave() {
    if (!salon) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "salons", salon.id), {
        "settings.currency": currency,
        "settings.dateFormat": dateFormat,
      });
      toast.success("Settings saved — refreshing…");
      // Reload to propagate new settings through useSalon everywhere
      setTimeout(() => window.location.reload(), 400);
    } catch (err) {
      console.error("[Settings] save error:", err);
      toast.error("Could not save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (salonLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="space-y-1">
          <Skeleton h="h-4" w="w-16" />
          <Skeleton h="h-3" w="w-48" />
        </div>
        <Card>
          <div className="space-y-5">
            <Skeleton h="h-5" w="w-32" />
            <Skeleton h="h-10" w="w-full" rounded="rounded-lg" />
            <Skeleton h="h-5" w="w-32" />
            <Skeleton h="h-10" w="w-full" rounded="rounded-lg" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <p
          className="text-xs font-medium uppercase tracking-widest mb-1"
          style={{ color: t.colors.semantic.textSubtle }}
        >
          Settings
        </p>
        <p className="text-sm" style={{ color: t.colors.semantic.textMuted }}>
          Configure your salon preferences.
        </p>
      </div>

      {/* Regional settings card */}
      <Card>
        <CardHeader>
          <CardTitle>Regional</CardTitle>
          <CardDescription>Currency and date display preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 mt-2">
          {/* Currency */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium uppercase tracking-widest"
              style={{ color: t.colors.semantic.textSubtle }}
            >
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow appearance-none cursor-pointer"
              style={inputStyle}
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date format */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium uppercase tracking-widest"
              style={{ color: t.colors.semantic.textSubtle }}
            >
              Date format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DATE_FORMATS.map((fmt) => {
                const selected = dateFormat === fmt.value;
                return (
                  <button
                    key={fmt.value}
                    type="button"
                    onClick={() => setDateFormat(fmt.value)}
                    className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                    style={{
                      background: selected ? t.colors.semantic.primaryTint : t.colors.semantic.bg,
                      border: `1.5px solid ${selected ? t.colors.semantic.primary : t.colors.semantic.borderSubtle}`,
                      color: selected ? t.colors.semantic.primary : t.colors.semantic.text,
                    }}
                  >
                    <span className="font-semibold">{fmt.value}</span>
                    <span
                      className="text-xs"
                      style={{ color: selected ? t.colors.semantic.primary : t.colors.semantic.textMuted }}
                    >
                      {fmt.example}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={!hasChanges() || saving}
              className="gap-2"
            >
              <Save size={15} />
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
