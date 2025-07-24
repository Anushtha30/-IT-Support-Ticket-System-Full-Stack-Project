import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { X, Calendar, MapPin, User, Tag } from "lucide-react";

interface TicketModalProps {
  ticketId: number;
  onClose: () => void;
}

const commentSchema = z.object({
  comment: z.string().min(1, "Comment is required"),
  isInternal: z.boolean().default(false),
});

type CommentFormData = z.infer<typeof commentSchema>;

export default function TicketModal({ ticketId, onClose }: TicketModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch ticket details
  const { data: ticket, isLoading: ticketLoading } = useQuery({
    queryKey: ["/api/tickets", ticketId],
    queryFn: async () => {
      const response = await fetch(`/api/tickets/${ticketId}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch ticket");
      return response.json();
    },
  });

  // Fetch ticket comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["/api/tickets", ticketId, "comments"],
    queryFn: async () => {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
  });

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      comment: "",
      isInternal: false,
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (data: CommentFormData) => {
      await apiRequest("POST", `/api/tickets/${ticketId}/comments`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticketId, "comments"] });
      form.reset();
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const handleAddComment = async (data: CommentFormData) => {
    await addCommentMutation.mutateAsync(data);
  };

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
      low: { variant: "outline" as const, text: "Low" },
      medium: { variant: "default" as const, text: "Medium" },
      high: { variant: "destructive" as const, text: "High" },
      critical: { variant: "destructive" as const, text: "Critical" },
    };
    return priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
  };

  if (ticketLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            Loading ticket details...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!ticket) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            Ticket not found
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const statusConfig = getStatusBadge(ticket.status);
  const priorityConfig = getPriorityBadge(ticket.priority);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {ticket.subject}
              <span className="text-sm text-gray-500">#{ticket.id}</span>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {/* Comments Section */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Comments & Updates</h4>
              <div className="space-y-4">
                {commentsLoading ? (
                  <div>Loading comments...</div>
                ) : comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No comments yet</p>
                ) : (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User size={16} className="text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {comment.user?.firstName} {comment.user?.lastName}
                              {comment.user?.role === 'admin' && (
                                <span className="ml-1 text-xs text-blue-600">(IT Support)</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {comment.isInternal && (
                          <Badge variant="outline" className="text-xs">
                            Internal
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{comment.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              {user?.role === 'admin' && (
                <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAddComment)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Add Comment</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={3}
                                placeholder="Add a comment or update..."
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="flex items-center justify-between">
                        <FormField
                          control={form.control}
                          name="isInternal"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm">Internal comment (not visible to user)</FormLabel>
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={addCommentMutation.isPending}>
                          {addCommentMutation.isPending ? "Adding..." : "Add Comment"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Metadata */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Ticket Information</h4>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <Badge variant={statusConfig.variant}>{statusConfig.text}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Priority</dt>
                  <dd className="mt-1">
                    <Badge variant={priorityConfig.variant}>{priorityConfig.text}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Category</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{ticket.issueType}</dd>
                </div>
                {ticket.location && (
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900">{ticket.location}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-medium text-gray-500">Submitter</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {ticket.submitter?.firstName} {ticket.submitter?.lastName}
                  </dd>
                </div>
                {ticket.assignee && (
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Assigned To</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {ticket.assignee.firstName} {ticket.assignee.lastName}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Admin Actions */}
            {user?.role === 'admin' && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-3">
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                    <i className="fas fa-play mr-2"></i>
                    Start Working
                  </Button>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <i className="fas fa-check mr-2"></i>
                    Mark Resolved
                  </Button>
                  <Button variant="outline" className="w-full">
                    <i className="fas fa-user-plus mr-2"></i>
                    Reassign
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
