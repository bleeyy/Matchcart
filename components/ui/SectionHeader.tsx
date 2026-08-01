type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function SectionHeader({
  title,
  subtitle,
}: SectionHeaderProps) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold text-[#191F24]">
        {title}
      </h2>

      {subtitle && (
        <p className="text-sm text-[#3B4954] mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}