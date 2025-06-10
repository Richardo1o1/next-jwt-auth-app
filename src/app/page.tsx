import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="space-y-6 text-center">
        <h1 className="text-3xl font-bold">Welcome to the JWT Auth App</h1>
        <p>This is an unprotected home page.</p>
        <div className="space-x-4">
          <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Login
          </Link>
          <Link href="/dashboard" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Go to Dashboard (Protected)
          </Link>
        </div>
      </div>
    </main>
  );
}