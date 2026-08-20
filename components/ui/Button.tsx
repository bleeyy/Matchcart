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
    "px-5 py-3 rounded-2xl font-semibold transition-all duration-200 active:scale-95";

  const variants = {
    primary:
      "bg-[#ee806c] text-[#243239] shadow-[0_8px_18px_rgba(215,94,85,0.18)] hover:-translate-y-0.5 hover:bg-[#d75e55]",
    
    secondary:
      "border border-[#ded6c9] text-[#243239] hover:bg-[#f1eadf]",
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