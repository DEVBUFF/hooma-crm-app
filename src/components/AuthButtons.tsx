import Link from "next/link"

export function AuthButtons() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold">Hooma CRM</h1>
      <div className="flex gap-4">
        <Link
          href="/auth/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Вход
        </Link>
        <Link
          href="/auth/register"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Регистрация
        </Link>
      </div>
    </div>
  )
}