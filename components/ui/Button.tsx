type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  className?: string;
};

export default function Button({
  children,
  variant = "primary",
  onClick,
  className = "",
}: ButtonProps) {
  const baseStyles =
    "px-5 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95";

  const variants = {
    primary:
      "bg-[#EF846C] text-[#191F24] hover:opacity-90",
    
    secondary:
      "border border-[#3B4954] text-[#191F24] hover:bg-[#DFDCCD]",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}