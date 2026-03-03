import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardTopbar } from "@/components/dashboard-topbar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background-image overflow-hidden" style={{ backgroundColor: "#F0EEE5" }}>
      {/* Left sidebar */}
      <DashboardSidebar />

      {/* Right: topbar + content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar */}
        <DashboardTopbar />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
