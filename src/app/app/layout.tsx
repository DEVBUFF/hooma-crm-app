"use client"

import { usePathname } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardTopbar } from "@/components/dashboard-topbar"
import { BottomTabBar } from "@/components/bottom-tab-bar"
import {
  OnboardingProvider,
  useOnboarding,
} from "@/components/onboarding-context"
import { OnboardingModal } from "@/components/onboarding-modal"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OnboardingProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </OnboardingProvider>
  )
}

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isCalendar = pathname.startsWith("/app/calendar")
  const { showModal, markCompleted, markSkipped } = useOnboarding()

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#F9FAFB", color: "#1A1A2E" }}
    >
      <DashboardSidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <DashboardTopbar />

        <main
          className={
            isCalendar
              ? "flex-1 overflow-hidden"
              : "flex-1 overflow-y-auto pb-24 md:pb-8"
          }
        >
          {isCalendar ? (
            <div key={pathname} className="anim-fade-in h-full">
              {children}
            </div>
          ) : (
            <div
              key={pathname}
              className="anim-page px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1200px] mx-auto w-full"
            >
              {children}
            </div>
          )}
        </main>
      </div>

      <BottomTabBar />

      <OnboardingModal
        open={showModal}
        onComplete={markCompleted}
        onSkip={markSkipped}
      />
    </div>
  )
}
