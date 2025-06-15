
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const activities = [
  {
    id: 1,
    user: "John Doe",
    action: "completed order",
    item: "#1234",
    time: "2 minutes ago",
    status: "success",
  },
  {
    id: 2,
    user: "Sarah Smith",
    action: "left review",
    item: "Product A",
    time: "5 minutes ago",
    status: "info",
  },
  {
    id: 3,
    user: "Mike Johnson",
    action: "cancelled order",
    item: "#1235",
    time: "10 minutes ago",
    status: "warning",
  },
  {
    id: 4,
    user: "Emma Wilson",
    action: "registered account",
    item: "",
    time: "15 minutes ago",
    status: "success",
  },
];

const RecentActivity = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/20 text-green-400";
      case "warning":
        return "bg-yellow-500/20 text-yellow-400";
      case "info":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Activity</CardTitle>
        <CardDescription className="text-gray-400">
          Latest user actions and system events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-r from-purple-400 to-blue-400 text-white text-xs">
                {activity.user.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{activity.user}</span>{" "}
                  <span className="text-gray-400">{activity.action}</span>{" "}
                  {activity.item && <span className="text-purple-400">{activity.item}</span>}
                </p>
              </div>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
            
            <Badge className={getStatusColor(activity.status)}>
              {activity.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
