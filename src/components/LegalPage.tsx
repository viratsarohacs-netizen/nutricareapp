export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-3xl font-bold text-brand-900">{title}</h1>
      <p className="mt-1 text-sm text-brand-600/70">Last updated: {updated}</p>
      <div className="mt-8 space-y-6 text-[15px] leading-7 text-brand-800/90 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-brand-900 [&_h2]:mt-8 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
        {children}
      </div>
    </main>
  );
}
