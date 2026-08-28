type HeaderProps = {
    hasCompared: boolean;
};

export default function Header({
    hasCompared,
}: HeaderProps) {
    return (
        <header className="mb-9 pt-3 sm:mb-12">
            <div className="mb-6 flex items-center text-xs font-bold uppercase tracking-[0.18em] text-[#68736f]">
                <span className="text-[#d75e55]">MatchCart</span>
            </div>

            <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-5xl leading-[0.92] tracking-[-0.045em] text-[#243239] sm:text-6xl lg:text-7xl">
                Spend less on the things you actually buy.
            </h1>

            <div className="mt-6 flex max-w-xl items-start gap-3 text-[0.98rem] leading-6 text-[#68736f]">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#ee806c]" />

                <p>
                    Build your list, then let MatchCart find the best place to buy it.
                    {hasCompared && " Your latest comparison is ready below."}
                </p>
            </div>
        </header>
    );
}