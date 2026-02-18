import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
        <Link href="/app">Dashboard</Link> |{" "}
        <Link href="/app/services">Services</Link> |{" "}
        <Link href="/app/staff">Staff</Link> |{" "}
        <Link href="/app/customers">Customers</Link> |{" "}
        <Link href="/app/calendar">Calendar</Link>
      </nav>

      {children}
    </div>
  );
}