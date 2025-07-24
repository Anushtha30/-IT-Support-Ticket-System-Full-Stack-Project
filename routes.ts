import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTicketSchema, insertCommentSchema, updateTicketSchema } from "@shared/schema";
import { z } from "zod";
import { isDemoMode, getDemoUser } from "./demo";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes  
  app.get('/api/auth/user', async (req, res) => {
    if (isDemoMode) {
      // Demo mode - return demo user
      const role = req.query.role as 'student' | 'admin' || 'student';
      const user = getDemoUser(role);
      return res.json(user);
    }
    
    // Production auth
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Demo mode login routes
  if (isDemoMode) {
    app.get('/api/demo/login/:role', async (req, res) => {
      const role = req.params.role as 'student' | 'admin';
      if (!['student', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      res.redirect(`/?demo=${role}`);
    });
  }

  // Helper function to get user ID
  const getUserId = (req: any) => {
    if (isDemoMode) {
      const role = req.query.role as 'student' | 'admin' || 'student';
      return getDemoUser(role).id;
    }
    return req.user?.claims?.sub;
  };

  const requireAuth = (req: any, res: any, next: any) => {
    if (isDemoMode) return next();
    return isAuthenticated(req, res, next);
  };

  // Ticket routes
  app.post('/api/tickets', requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const validatedData = insertTicketSchema.parse({
        ...req.body,
        submitterId: userId,
      });
      
      const ticket = await storage.createTicket(validatedData);
      res.json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid ticket data", errors: error.errors });
      } else {
        console.error("Error creating ticket:", error);
        res.status(500).json({ message: "Failed to create ticket" });
      }
    }
  });

  app.get('/api/tickets', requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const user = isDemoMode ? getDemoUser(req.query.role as 'student' | 'admin' || 'student') : await storage.getUser(userId);
      
      let tickets;
      if (user?.role === 'admin') {
        tickets = await storage.getAllTickets();
      } else {
        tickets = await storage.getTicketsByUser(userId);
      }
      
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.get('/api/tickets/:id', requireAuth, async (req: any, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = getUserId(req);
      const user = isDemoMode ? getDemoUser(req.query.role as 'student' | 'admin' || 'student') : await storage.getUser(userId);
      
      const ticket = await storage.getTicketById(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      // Check if user can access this ticket
      if (user?.role !== 'admin' && ticket.submitterId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(ticket);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });

  app.patch('/api/tickets/:id', requireAuth, async (req: any, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = getUserId(req);
      const user = isDemoMode ? getDemoUser(req.query.role as 'student' | 'admin' || 'student') : await storage.getUser(userId);
      
      // Only admins can update tickets
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validatedData = updateTicketSchema.parse(req.body);
      const updatedTicket = await storage.updateTicket(ticketId, validatedData);
      
      res.json(updatedTicket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        console.error("Error updating ticket:", error);
        res.status(500).json({ message: "Failed to update ticket" });
      }
    }
  });

  // Comment routes
  app.post('/api/tickets/:id/comments', requireAuth, async (req: any, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = getUserId(req);
      
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        ticketId,
        userId,
      });
      
      const comment = await storage.addComment(validatedData);
      res.json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      } else {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Failed to add comment" });
      }
    }
  });

  app.get('/api/tickets/:id/comments', requireAuth, async (req: any, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = getUserId(req);
      const user = isDemoMode ? getDemoUser(req.query.role as 'student' | 'admin' || 'student') : await storage.getUser(userId);
      
      // Check if user can access this ticket's comments
      const ticket = await storage.getTicketById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      if (user?.role !== 'admin' && ticket.submitterId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const comments = await storage.getTicketComments(ticketId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Stats routes
  app.get('/api/stats', requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const user = isDemoMode ? getDemoUser(req.query.role as 'student' | 'admin' || 'student') : await storage.getUser(userId);
      
      let stats;
      if (user?.role === 'admin') {
        stats = await storage.getAdminStats();
      } else {
        stats = await storage.getTicketStats(userId);
      }
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // IT Staff routes (admin only)
  app.get('/api/it-staff', requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const user = isDemoMode ? getDemoUser(req.query.role as 'student' | 'admin' || 'student') : await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const staff = await storage.getITStaff();
      res.json(staff);
    } catch (error) {
      console.error("Error fetching IT staff:", error);
      res.status(500).json({ message: "Failed to fetch IT staff" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
