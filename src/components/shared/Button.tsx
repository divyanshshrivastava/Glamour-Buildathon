import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  href?: string;
  className?: string;
}

const variantStyles = {
  primary:
    "bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md",
  secondary:
    "bg-accent text-foreground hover:bg-accent-hover",
  outline:
    "border-2 border-foreground text-foreground hover:bg-foreground hover:text-white",
  ghost:
    "text-foreground hover:bg-accent/50",
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  children,
  href,
  className,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 cursor-pointer whitespace-nowrap",
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
