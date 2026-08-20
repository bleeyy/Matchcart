export default function Header() {
  return (
    <header className="mb-8 pt-3">
      <div className="mb-5 flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-[#68736f]">
        <span>MatchCart</span>
        <span className="rounded-full bg-[#b8c8a4]/45 px-3 py-1.5 text-[#3f594a]">Fresh thinking</span>
      </div>
      <h1 className="max-w-sm font-[family-name:var(--font-display)] text-5xl leading-[0.94] tracking-[-0.04em] text-[#243239]">
        A smarter shop starts here.
      </h1>
      <p className="mt-4 max-w-xs text-[0.98rem] leading-6 text-[#68736f]">
        Build your list, then let MatchCart find where it costs less.
      </p>
    </header>
  );
}