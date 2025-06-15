import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface ChartWidgetProps {
  title: string;
  description: string;
  type: "area" | "bar" | "line";
  data: any[];
  dataKey: string;
  className?: string;
}

const ChartWidget = ({ title, description, type, data, dataKey, className }: ChartWidgetProps) => {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#1f2937", 
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#f9fafb"
              }} 
            />
            <Area type="monotone" dataKey={dataKey} stroke="#8b5cf6" fill="url(#colorValue)" strokeWidth={2} />
          </AreaChart>
        );
      
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#1f2937", 
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#f9fafb"
              }} 
            />
            <Bar dataKey={dataKey} fill="#ec4899" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#1f2937", 
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#f9fafb"
              }} 
            />
            <Line type="monotone" dataKey={dataKey} stroke="#06d6a0" strokeWidth={3} dot={{ fill: "#06d6a0" }} />
          </LineChart>
        );
      
      default:
        return null;
    }
  };

  if (!title && !description) {
    return (
      <div className={cn("h-48", className)}>
        <ResponsiveContainer width="100%" height="100%" >
          {renderChart()}
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-foreground">{title}</CardTitle>
        <CardDescription className="text-gray-400">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={cn("h-48", className)}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartWidget;
