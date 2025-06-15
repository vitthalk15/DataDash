import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendArrowProps {
  value: number;
  className?: string;
}

export function TrendArrow({ value, className }: TrendArrowProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;

  return (
    <span className={cn("flex items-center gap-1", className)}>
      {isPositive && <ArrowUp className="h-4 w-4 text-green-500" />}
      {isNegative && <ArrowDown className="h-4 w-4 text-red-500" />}
      <span className={cn(
        "text-sm font-medium",
        isPositive && "text-green-500",
        isNegative && "text-red-500"
      )}>
        {Math.abs(value)}%
      </span>
    </span>
  );
} 