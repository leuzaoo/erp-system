import Link from "next/link";

export default function Home() {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center">
      <h1 className="text-4xl">Homepage</h1>
      <div className="mt-5 flex flex-col gap-2">
        <Link
          className="bg-pattern-100 rounded-3xl px-3 py-1 text-2xl tracking-tight text-black"
          href="/dashboard"
        >
          Go to Dashboard
        </Link>
        <Link
          className="bg-pattern-100 rounded-3xl px-3 py-1 text-2xl tracking-tight text-black"
          href="/login"
        >
          Go to Login
        </Link>
      </div>
    </main>
  );
}
