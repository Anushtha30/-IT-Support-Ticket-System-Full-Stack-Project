import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Eye, User } from "lucide-react";

interface TicketCardProps {
  ticket: any;
  onClick: () => void;
  detailed?: boolean;
}

export default function TicketCard({ ticket, onClick, detailed = false }: TicketCardProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { variant: "secondary" as const, text: "New" },
      "in-progress": { variant: "default" as const, text: "In Progress" },
      resolved: { variant: "secondary" as const, text: "Resolved" },
      closed: { variant: "outline" as const, text: "Closed" },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { variant: "outline" as const, text: "Low Priority", className: "border-blue-200 text-blue-800" },
      medium: { variant: "outline" as const, text: "Medium Priority", className: "border-yellow-200 text-yellow-800" },
      high: { variant: "outline" as const, text: "High Priority", className: "border-red-200 text-red-800" },
      critical: { variant: "destructive" as const, text: "Critical", className: "bg-red-100 text-red-800" },
    };
    return priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
  };

  const getIssueIcon = (issueType: string) => {
    const icons = {
      hardware: "fas fa-laptop",
      software: "fas fa-code",
      network: "fas fa-wifi",
      email: "fas fa-envelope",
      printing: "fas fa-print",
      account: "fas fa-user",
      other: "fas fa-question-circle",
    };
    return icons[issueType as keyof typeof icons] || icons.other;
  };

  const getIssueColor = (issueType: string) => {
    const colors = {
      hardware: "bg-blue-100",
      software: "bg-green-100",
      network: "bg-red-100",
      email: "bg-yellow-100",
      printing: "bg-purple-100",
      account: "bg-indigo-100",
      other: "bg-gray-100",
    };
    return colors[issueType as keyof typeof colors] || colors.other;
  };

  const statusConfig = getStatusBadge(ticket.status);
  const priorityConfig = getPriorityBadge(ticket.priority);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className={`flex-shrink-0 h-12 w-12 rounded-lg ${getIssueColor(ticket.issueType)} flex items-center justify-center`}>
              <i className={`${getIssueIcon(ticket.issueType)} text-lg`}></i>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium text-gray-900">{ticket.subject}</p>
                <Badge 
                  variant={priorityConfig.variant}
                  className={priorityConfig.className}
                >
                  {priorityConfig.text}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  Submitted: {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
                {ticket.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    {ticket.location}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant={statusConfig.variant}>
              {statusConfig.text}
            </Badge>
            <Button variant="ghost" size="sm">
              <Eye size={16} />
            </Button>
          </div>
        </div>
        
        {detailed && (
          <div className="mt-4 text-sm text-gray-600">
            <p className="line-clamp-2">{ticket.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500">
                <span>Ticket #{ticket.id}</span>
                {ticket.assignee && (
                  <>
                    <span className="mx-2">•</span>
                    <span>Assigned to: {ticket.assignee.firstName} {ticket.assignee.lastName}</span>
                  </>
                )}
              </div>
              <Button variant="link" size="sm" className="text-xs">
                View Full Details
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
