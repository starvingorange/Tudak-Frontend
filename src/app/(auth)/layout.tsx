export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-10 bg-[var(--bg-hero)] px-6 py-12">
      {children}
    </main>
  );
}
