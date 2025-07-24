import {
  users,
  tickets,
  ticketComments,
  type User,
  type UpsertUser,
  type InsertTicket,
  type Ticket,
  type TicketWithSubmitter,
  type InsertComment,
  type Comment,
  type CommentWithUser,
  type UpdateTicket,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Ticket operations
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  getTicketById(id: number): Promise<TicketWithSubmitter | undefined>;
  getTicketsByUser(userId: string): Promise<TicketWithSubmitter[]>;
  getAllTickets(): Promise<TicketWithSubmitter[]>;
  updateTicket(id: number, updates: UpdateTicket): Promise<Ticket>;
  getTicketStats(userId?: string): Promise<{
    total: number;
    new: number;
    inProgress: number;
    resolved: number;
    high: number;
  }>;
  
  // Comment operations
  addComment(comment: InsertComment): Promise<Comment>;
  getTicketComments(ticketId: number): Promise<CommentWithUser[]>;
  
  // Admin operations
  getAdminStats(): Promise<{
    newTickets: number;
    inProgress: number;
    highPriority: number;
    assignedToMe: number;
    avgResolution: string;
  }>;
  getITStaff(): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Ticket operations
  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const [newTicket] = await db
      .insert(tickets)
      .values(ticket)
      .returning();
    return newTicket;
  }

  async getTicketById(id: number): Promise<TicketWithSubmitter | undefined> {
    const [ticket] = await db
      .select({
        id: tickets.id,
        subject: tickets.subject,
        description: tickets.description,
        issueType: tickets.issueType,
        priority: tickets.priority,
        status: tickets.status,
        location: tickets.location,
        submitterId: tickets.submitterId,
        assignedToId: tickets.assignedToId,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        submitter: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        assignee: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.submitterId, users.id))
      .leftJoin(users, eq(tickets.assignedToId, users.id))
      .where(eq(tickets.id, id));

    return ticket as TicketWithSubmitter;
  }

  async getTicketsByUser(userId: string): Promise<TicketWithSubmitter[]> {
    const userTickets = await db
      .select({
        id: tickets.id,
        subject: tickets.subject,
        description: tickets.description,
        issueType: tickets.issueType,
        priority: tickets.priority,
        status: tickets.status,
        location: tickets.location,
        submitterId: tickets.submitterId,
        assignedToId: tickets.assignedToId,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        submitter: users,
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.submitterId, users.id))
      .where(eq(tickets.submitterId, userId))
      .orderBy(desc(tickets.createdAt));

    return userTickets.map(ticket => ({
      ...ticket,
      submitter: ticket.submitter!,
    }));
  }

  async getAllTickets(): Promise<TicketWithSubmitter[]> {
    const allTickets = await db
      .select({
        id: tickets.id,
        subject: tickets.subject,
        description: tickets.description,
        issueType: tickets.issueType,
        priority: tickets.priority,
        status: tickets.status,
        location: tickets.location,
        submitterId: tickets.submitterId,
        assignedToId: tickets.assignedToId,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        submitter: users,
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.submitterId, users.id))
      .orderBy(desc(tickets.createdAt));

    return allTickets.map(ticket => ({
      ...ticket,
      submitter: ticket.submitter!,
    }));
  }

  async updateTicket(id: number, updates: UpdateTicket): Promise<Ticket> {
    const [updatedTicket] = await db
      .update(tickets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return updatedTicket;
  }

  async getTicketStats(userId?: string): Promise<{
    total: number;
    new: number;
    inProgress: number;
    resolved: number;
    high: number;
  }> {
    const whereClause = userId ? eq(tickets.submitterId, userId) : undefined;
    
    const [stats] = await db
      .select({
        total: count(),
        new: count(eq(tickets.status, "new")),
        inProgress: count(eq(tickets.status, "in-progress")),
        resolved: count(eq(tickets.status, "resolved")),
        high: count(or(eq(tickets.priority, "high"), eq(tickets.priority, "critical"))),
      })
      .from(tickets)
      .where(whereClause);

    return {
      total: stats.total,
      new: stats.new,
      inProgress: stats.inProgress,
      resolved: stats.resolved,
      high: stats.high,
    };
  }

  // Comment operations
  async addComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db
      .insert(ticketComments)
      .values(comment)
      .returning();
    return newComment;
  }

  async getTicketComments(ticketId: number): Promise<CommentWithUser[]> {
    const comments = await db
      .select({
        id: ticketComments.id,
        ticketId: ticketComments.ticketId,
        userId: ticketComments.userId,
        comment: ticketComments.comment,
        isInternal: ticketComments.isInternal,
        createdAt: ticketComments.createdAt,
        user: users,
      })
      .from(ticketComments)
      .leftJoin(users, eq(ticketComments.userId, users.id))
      .where(eq(ticketComments.ticketId, ticketId))
      .orderBy(desc(ticketComments.createdAt));

    return comments.map(comment => ({
      ...comment,
      user: comment.user!,
    }));
  }

  // Admin operations
  async getAdminStats(): Promise<{
    newTickets: number;
    inProgress: number;
    highPriority: number;
    assignedToMe: number;
    avgResolution: string;
  }> {
    const [newTicketsCount] = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.status, "new"));

    const [inProgressCount] = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.status, "in-progress"));

    const [highPriorityCount] = await db
      .select({ count: count() })
      .from(tickets)
      .where(or(eq(tickets.priority, "high"), eq(tickets.priority, "critical")));

    return {
      newTickets: newTicketsCount.count,
      inProgress: inProgressCount.count,
      highPriority: highPriorityCount.count,
      assignedToMe: 0, // This would need to be calculated with current user context
      avgResolution: "2.3d", // This would need more complex calculation
    };
  }

  async getITStaff(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, "admin"));
  }
}

// Using memory storage for demo purposes
export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private tickets = new Map<number, Ticket>();
  private comments = new Map<number, Comment>();
  private ticketCounter = 1;
  private commentCounter = 1;

  constructor() {
    // Add sample users
    this.users.set("student1", {
      id: "student1",
      email: "student@university.edu",
      firstName: "Anushtha",
      lastName: "Sharma",
      profileImageUrl: null,
      role: "student",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    this.users.set("admin1", {
      id: "admin1", 
      email: "admin@university.edu",
      firstName: "IT",
      lastName: "Admin",
      profileImageUrl: null,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Add sample tickets
    this.tickets.set(1, {
      id: 1,
      subject: "Computer won't start",
      description: "My computer in room 201 won't turn on at all. I've checked the power cable and it's plugged in properly.",
      issueType: "hardware",
      priority: "high",
      status: "new",
      location: "Room 201, Computer Lab",
      submitterId: "student1",
      assignedToId: null,
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      updatedAt: new Date(Date.now() - 86400000),
    });

    this.tickets.set(2, {
      id: 2,
      subject: "Email not working",
      description: "I can't access my university email account. Getting authentication errors.",
      issueType: "email",
      priority: "medium", 
      status: "in-progress",
      location: "Library Study Room 3",
      submitterId: "student1",
      assignedToId: "admin1",
      createdAt: new Date(Date.now() - 172800000), // 2 days ago
      updatedAt: new Date(Date.now() - 43200000), // 12 hours ago
    });

    this.ticketCounter = 3;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      ...userData,
      createdAt: this.users.get(userData.id)?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const newTicket: Ticket = {
      ...ticket,
      id: this.ticketCounter++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tickets.set(newTicket.id, newTicket);
    return newTicket;
  }

  async getTicketById(id: number): Promise<TicketWithSubmitter | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;
    
    const submitter = this.users.get(ticket.submitterId);
    const assignee = ticket.assignedToId ? this.users.get(ticket.assignedToId) : undefined;
    
    return {
      ...ticket,
      submitter: submitter!,
      assignee,
    };
  }

  async getTicketsByUser(userId: string): Promise<TicketWithSubmitter[]> {
    const userTickets = Array.from(this.tickets.values())
      .filter(ticket => ticket.submitterId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return userTickets.map(ticket => ({
      ...ticket,
      submitter: this.users.get(ticket.submitterId)!,
      assignee: ticket.assignedToId ? this.users.get(ticket.assignedToId) : undefined,
    }));
  }

  async getAllTickets(): Promise<TicketWithSubmitter[]> {
    const allTickets = Array.from(this.tickets.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return allTickets.map(ticket => ({
      ...ticket,
      submitter: this.users.get(ticket.submitterId)!,
      assignee: ticket.assignedToId ? this.users.get(ticket.assignedToId) : undefined,
    }));
  }

  async updateTicket(id: number, updates: UpdateTicket): Promise<Ticket> {
    const ticket = this.tickets.get(id);
    if (!ticket) throw new Error("Ticket not found");
    
    const updatedTicket = {
      ...ticket,
      ...updates,
      updatedAt: new Date(),
    };
    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async getTicketStats(userId?: string): Promise<{
    total: number;
    new: number;
    inProgress: number;
    resolved: number;
    high: number;
  }> {
    const tickets = userId 
      ? Array.from(this.tickets.values()).filter(t => t.submitterId === userId)
      : Array.from(this.tickets.values());

    return {
      total: tickets.length,
      new: tickets.filter(t => t.status === "new").length,
      inProgress: tickets.filter(t => t.status === "in-progress").length,
      resolved: tickets.filter(t => t.status === "resolved").length,
      high: tickets.filter(t => t.priority === "high" || t.priority === "critical").length,
    };
  }

  async addComment(comment: InsertComment): Promise<Comment> {
    const newComment: Comment = {
      ...comment,
      id: this.commentCounter++,
      createdAt: new Date(),
    };
    this.comments.set(newComment.id, newComment);
    return newComment;
  }

  async getTicketComments(ticketId: number): Promise<CommentWithUser[]> {
    const ticketComments = Array.from(this.comments.values())
      .filter(comment => comment.ticketId === ticketId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return ticketComments.map(comment => ({
      ...comment,
      user: this.users.get(comment.userId)!,
    }));
  }

  async getAdminStats(): Promise<{
    newTickets: number;
    inProgress: number;
    highPriority: number;
    assignedToMe: number;
    avgResolution: string;
  }> {
    const tickets = Array.from(this.tickets.values());
    return {
      newTickets: tickets.filter(t => t.status === "new").length,
      inProgress: tickets.filter(t => t.status === "in-progress").length,
      highPriority: tickets.filter(t => t.priority === "high" || t.priority === "critical").length,
      assignedToMe: 0,
      avgResolution: "2.1d",
    };
  }

  async getITStaff(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === "admin");
  }
}

export const storage = new MemStorage();
