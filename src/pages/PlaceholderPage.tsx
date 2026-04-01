type PlaceholderPageProps = {
  title: string;
  subtitle: string;
};

export function PlaceholderPage({ title, subtitle }: PlaceholderPageProps) {
  return (
    <div
      id="tokens-page-top"
      className="relative z-10 mx-auto max-w-lg rounded border border-outline-variant/10 bg-surface-container p-10 text-center"
    >
      <h1 className="font-headline text-2xl font-bold text-primary">{title}</h1>
      <p className="mt-3 text-sm text-on-surface-variant">{subtitle}</p>
    </div>
  );
}
