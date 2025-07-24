import { Card, CardContent } from "@/components/ui/card";
import { 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Inbox, 
  User,
  TrendingUp
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: "ticket" | "clock" | "check" | "alert" | "inbox" | "user" | "chart";
  color: "blue" | "yellow" | "green" | "red" | "gray";
}

export default function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const getIcon = () => {
    const iconProps = { size: 24 };
    switch (icon) {
      case "ticket":
        return <Ticket {...iconProps} />;
      case "clock":
        return <Clock {...iconProps} />;
      case "check":
        return <CheckCircle {...iconProps} />;
      case "alert":
        return <AlertTriangle {...iconProps} />;
      case "inbox":
        return <Inbox {...iconProps} />;
      case "user":
        return <User {...iconProps} />;
      case "chart":
        return <TrendingUp {...iconProps} />;
      default:
        return <Ticket {...iconProps} />;
    }
  };

  const getColorClasses = () => {
    const colorMap = {
      blue: "text-blue-600",
      yellow: "text-yellow-600",
      green: "text-green-600",
      red: "text-red-600",
      gray: "text-gray-600",
    };
    return colorMap[color];
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={getColorClasses()}>
              {getIcon()}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
