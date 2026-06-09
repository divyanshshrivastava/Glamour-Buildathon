import AnimateIn from "./AnimateIn";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  align = "center",
  className = "",
}: SectionHeaderProps) {
  return (
    <AnimateIn direction="up" className={className}>
      <div
        className={`mb-12 md:mb-16 ${
          align === "center" ? "text-center" : "text-left"
        }`}
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </AnimateIn>
  );
}
