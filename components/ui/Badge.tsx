type BadgeProps = {
  children: React.ReactNode;
  variant?: "primary" | "soft";
  className?: string;
};

export default function Badge({
  children,
  variant = "primary",
  className = "",
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold";

  const variants = {
    primary: "bg-[#EF846C] text-[#191F24]",
    soft: "bg-[#CEB9BC] text-[#191F24]",
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}