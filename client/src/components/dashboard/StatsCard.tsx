
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
}

const StatsCard = ({ title, value, change, trend, icon: Icon }: StatsCardProps) => {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-500 mt-1">{value}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Icon className="h-6 w-6 text-purple-400" />
          </div>
        </div>
        
        <div className="flex items-center mt-4">
          {trend === "up" ? (
            <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
          )}
          <span className={cn(
            "text-sm font-medium",
            trend === "up" ? "text-green-400" : "text-red-400"
          )}>
            {change}
          </span>
          <span className="text-gray-400 text-sm ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
