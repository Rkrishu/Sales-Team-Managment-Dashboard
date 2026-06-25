/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { 
  User, 
  DailyCall, 
  ClientLead, 
  Target, 
  PitchScript, 
  AuditLog, 
  SystemNotification, 
  UserRole,
  LeadStatus
} from "./src/types";

// Setup database paths
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "sales_db.json");

// In-memory representation of our DB
interface DatabaseSchema {
  users: User[];
  passwords: Record<string, { hash: string; salt: string }>;
  calls: DailyCall[];
  leads: ClientLead[];
  targets: Target[];
  pitches: PitchScript[];
  auditLogs: AuditLog[];
  sessions: Record<string, { userId: string; expiresAt: string }>;
}

// Generate secure salt & hash
function hashPassword(password: string, salt: string): string {
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

function generateId(): string {
  return crypto.randomUUID();
}

// Initial Database Seeding
const INITIAL_SALT = "sales_salt_2026";
const DEFAULT_DB: DatabaseSchema = {
  users: [
    { id: "u-admin", name: "Executive Admin", email: "admin@salescorp.com", role: "admin", isActive: true, createdAt: "2026-06-01T08:00:00Z" },
    { id: "u-sarah", name: "Sarah Jenkins", email: "sarah@salescorp.com", role: "team_member", isActive: true, createdAt: "2026-06-02T09:15:00Z" },
    { id: "u-alex", name: "Alex Rodriguez", email: "alex@salescorp.com", role: "team_member", isActive: true, createdAt: "2026-06-02T10:30:00Z" },
    { id: "u-david", name: "David Kim", email: "david@salescorp.com", role: "team_member", isActive: true, createdAt: "2026-06-03T11:00:00Z" },
    { id: "u-emma", name: "Emma Watson", email: "emma@salescorp.com", role: "team_member", isActive: true, createdAt: "2026-06-04T08:45:00Z" },
  ],
  passwords: {
    "admin@salescorp.com": { hash: hashPassword("admin123", INITIAL_SALT), salt: INITIAL_SALT },
    "sarah@salescorp.com": { hash: hashPassword("sarah123", INITIAL_SALT), salt: INITIAL_SALT },
    "alex@salescorp.com": { hash: hashPassword("alex123", INITIAL_SALT), salt: INITIAL_SALT },
    "david@salescorp.com": { hash: hashPassword("david123", INITIAL_SALT), salt: INITIAL_SALT },
    "emma@salescorp.com": { hash: hashPassword("emma123", INITIAL_SALT), salt: INITIAL_SALT },
  },
  calls: [
    // Seeding daily call records for past weeks
    { id: "c-1", date: "2026-06-15", employeeId: "u-sarah", employeeName: "Sarah Jenkins", callsMade: 65, callsConnected: 45, followUpsScheduled: 18, meetingsBooked: 8, clientsConverted: 3, revenueGenerated: 15000, remarks: "Excellent responses on product introduction. Scheduled key followups.", createdAt: "2026-06-15T18:00:00Z" },
    { id: "c-2", date: "2026-06-15", employeeId: "u-alex", employeeName: "Alex Rodriguez", callsMade: 60, callsConnected: 38, followUpsScheduled: 14, meetingsBooked: 5, clientsConverted: 2, revenueGenerated: 8500, remarks: "Decent connectivity. Some clients raised pricing concerns.", createdAt: "2026-06-15T18:15:00Z" },
    { id: "c-3", date: "2026-06-16", employeeId: "u-sarah", employeeName: "Sarah Jenkins", callsMade: 70, callsConnected: 50, followUpsScheduled: 20, meetingsBooked: 9, clientsConverted: 4, revenueGenerated: 22000, remarks: "Closed a key client for Enterprise tier. Great momentum.", createdAt: "2026-06-16T18:00:00Z" },
    { id: "c-4", date: "2026-06-16", employeeId: "u-alex", employeeName: "Alex Rodriguez", callsMade: 65, callsConnected: 40, followUpsScheduled: 15, meetingsBooked: 6, clientsConverted: 1, revenueGenerated: 5000, remarks: "A lot of follow-ups scheduled for next Monday.", createdAt: "2026-06-16T18:30:00Z" },
    { id: "c-5", date: "2026-06-17", employeeId: "u-david", employeeName: "David Kim", callsMade: 55, callsConnected: 32, followUpsScheduled: 10, meetingsBooked: 4, clientsConverted: 2, revenueGenerated: 11000, remarks: "Focusing on quality meetings. Solid traction.", createdAt: "2026-06-17T17:45:00Z" },
    { id: "c-6", date: "2026-06-17", employeeId: "u-emma", employeeName: "Emma Watson", callsMade: 50, callsConnected: 30, followUpsScheduled: 8, meetingsBooked: 3, clientsConverted: 1, revenueGenerated: 4500, remarks: "Steady afternoon calls. Many voicemail box conversions.", createdAt: "2026-06-17T18:00:00Z" },
    { id: "c-7", date: "2026-06-18", employeeId: "u-sarah", employeeName: "Sarah Jenkins", callsMade: 65, callsConnected: 42, followUpsScheduled: 15, meetingsBooked: 7, clientsConverted: 2, revenueGenerated: 10000, remarks: "Continued pipeline traction. Converting warmer group.", createdAt: "2026-06-18T18:00:00Z" },
    { id: "c-8", date: "2026-06-18", employeeId: "u-alex", employeeName: "Alex Rodriguez", callsMade: 68, callsConnected: 41, followUpsScheduled: 16, meetingsBooked: 5, clientsConverted: 2, revenueGenerated: 9500, remarks: "Two clients converting on the mid-market packages.", createdAt: "2026-06-18T18:30:00Z" },
    { id: "c-9", date: "2026-06-19", employeeId: "u-david", employeeName: "David Kim", callsMade: 58, callsConnected: 35, followUpsScheduled: 11, meetingsBooked: 4, clientsConverted: 3, revenueGenerated: 16500, remarks: "Great conversion rate today. Follow-ups yielded results.", createdAt: "2026-06-19T17:50:00Z" },
    { id: "c-10", date: "2026-06-19", employeeId: "u-emma", employeeName: "Emma Watson", callsMade: 52, callsConnected: 33, followUpsScheduled: 9, meetingsBooked: 5, clientsConverted: 2, revenueGenerated: 9000, remarks: "Solid finish for the weekly cycle. Follow Ups scheduled.", createdAt: "2026-06-19T18:10:00Z" },
    // A log for June 21 (Yesterday) to ensure we have recent activity
    { id: "c-11", date: "2026-06-21", employeeId: "u-sarah", employeeName: "Sarah Jenkins", callsMade: 45, callsConnected: 28, followUpsScheduled: 10, meetingsBooked: 3, clientsConverted: 2, revenueGenerated: 12000, remarks: "Sunday followups requested by several highly interested leads.", createdAt: "2026-06-21T18:00:00Z" },
  ],
  leads: [
    { id: "l-1", clientName: "Acme Corporation (John Smith)", contactNumber: "+1-555-0100", leadSource: "LinkedIn", assignedToId: "u-sarah", assignedToName: "Sarah Jenkins", status: "Converted", notes: "Closed 50 user team package. Handed off to accounts.", lastUpdated: "2026-06-16T15:30:00Z" },
    { id: "l-2", clientName: "Globex Industries", contactNumber: "+1-555-0122", leadSource: "Website Direct", assignedToId: "u-alex", assignedToName: "Alex Rodriguez", status: "Negotiation", notes: "Discussing customized SLA agreements. Highly positive.", lastUpdated: "2026-06-18T16:45:00Z" },
    { id: "l-3", clientName: "Initech Labs", contactNumber: "+1-555-0144", leadSource: "Referral", assignedToId: "u-david", assignedToName: "David Kim", status: "Interested", notes: "Demo completed successfully. Shared custom proposal.", lastUpdated: "2026-06-19T11:15:00Z" },
    { id: "l-4", clientName: "Umbrella Corp Tech", contactNumber: "+1-555-0166", leadSource: "LinkedIn", assignedToId: "u-emma", assignedToName: "Emma Watson", status: "Follow-Up", notes: "Requested follow-up email with detailed security compliance.", lastUpdated: "2026-06-19T14:20:00Z" },
    { id: "l-5", clientName: "Hooli Cloud Solutions", contactNumber: "+1-555-0188", leadSource: "Cold Call", assignedToId: "u-sarah", assignedToName: "Sarah Jenkins", status: "Converted", notes: "Closed full system upgrade yesterday.", lastUpdated: "2026-06-21T17:35:00Z" },
    { id: "l-6", clientName: "Soylent Logistics", contactNumber: "+1-555-0199", leadSource: "Website Direct", assignedToId: "u-alex", assignedToName: "Alex Rodriguez", status: "Contacted", notes: "Sent introduction details over WhatsApp template.", lastUpdated: "2026-06-21T12:00:00Z" },
    { id: "l-7", clientName: "Wayne Enterprise Procurement", contactNumber: "+1-555-0210", leadSource: "Referral", assignedToId: "u-david", assignedToName: "David Kim", status: "New Lead", notes: "Inbound contact from their director. Needs discovery call scheduled.", lastUpdated: "2026-06-22T00:00:00Z" },
    { id: "l-8", clientName: "Cyberdyne Systems Systems", contactNumber: "+1-555-0235", leadSource: "LinkedIn", assignedToId: "u-emma", assignedToName: "Emma Watson", status: "Lost", notes: "Chose to postpone system upgrades for next fiscal budget.", lastUpdated: "2026-06-18T10:00:00Z" },
  ],
  targets: [
    { id: "t-1", timeframe: "monthly", targetType: "conversions", title: "June Team Conversions", value: 35, achieved: 24, startDate: "2026-06-01", endDate: "2026-06-30" },
    { id: "t-2", timeframe: "monthly", targetType: "revenue", title: "June Revenue (USD)", value: 200000, achieved: 131500, startDate: "2026-06-01", endDate: "2026-06-30" },
    { id: "t-3", timeframe: "weekly", targetType: "calls", title: "Weekly Dial Threshold", value: 1200, achieved: 648, startDate: "2026-06-15", endDate: "2026-06-22" },
    { id: "t-4", timeframe: "weekly", targetType: "connections", title: "Weekly Client Connections", value: 800, achieved: 406, startDate: "2026-06-15", endDate: "2026-06-22" },
  ],
  pitches: [
    {
      id: "p-1",
      title: "Elevator Pitch: Standard Cloud Migration",
      category: "Sales Pitch",
      content: "For forward-thinking businesses experiencing latency and high hosting bills, our Unified Cloud suite migrate and scale your legacy applications with automated clustering. Unlike generic clouds, we cut operational overhead by up to 40% with automated cluster management. Would you be open to a 5-minute visual run-through this Wednesday?",
      isFavorite: true,
      productLine: "Cloud Migration Suite",
      createdBy: "Executive Admin",
      createdAt: "2026-06-10T10:00:00Z"
    },
    {
      id: "p-2",
      title: "WhatsApp Intro: Post-Webinar Outreach",
      category: "WhatsApp Template",
      content: "Hi [Name]! Thanks for joining our Cloud Security masterclass yesterday. 🚀 As promised, here are the slide materials: salescorp.com/slides. Quick question: is tightening cluster permissions a priority for your team this quarter? We can jump-start with a free audit! Let me know if tomorrow at 2 PM works.",
      isFavorite: true,
      productLine: "Cloud Security",
      createdBy: "Executive Admin",
      createdAt: "2026-06-12T14:30:00Z"
    },
    {
      id: "p-3",
      title: "Call Script: Handling Pricing Objections",
      category: "Objection Handling",
      content: "Client: 'That proposal is way out of our budget.'\n\nResponse: 'I hear you completely, [Name]. It sounds like we need to ensure this program doesn't just act as an expense, but directly covers its own cost. Let's look at your current database hardware licensing fees. By consolidating them into our fully managed space, we actually eliminate $1,500/month in local hypervisor maintenance immediately. Knowing that this offsets the platform costs, does the timing of migration feel more justified?'",
      isFavorite: false,
      productLine: "All Products",
      createdBy: "Executive Admin",
      createdAt: "2026-06-13T09:15:00Z"
    },
    {
      id: "p-4",
      title: "Cold Call Script: Cloud Database Security",
      category: "Call Script",
      content: "Hi [First Name], this is [Your Name] from SalesCorp. I know I called out of the blue, but I was looking at your engineering posts on LinkedIn regarding high cloud latency.\n\nWe specialize in setting up zero-trust direct-connect datalakes that reduce query times from seconds to milliseconds. I was wondering if you're the right person to talk to about resolving data lookup bottlenecks?",
      isFavorite: true,
      productLine: "Database Management",
      createdBy: "Executive Admin",
      createdAt: "2026-06-14T11:00:00Z"
    },
    {
      id: "p-5",
      title: "Email Template: Post-Demo Follow-Up",
      category: "Email Template",
      content: "Subject: SalesCorp Demo follow-up - customized deployment architecture\n\nHi [Name],\n\nThank you for taking the time to review our platform yesterday. I loved hearing about [Company]'s goal to double active endpoints by December.\n\nAs promised, I have attached our Custom Solution Blueprint detailing:\n1. Dedicated node segregation layout\n2. Real-time logging proxy routing\n3. Consolidated pricing summary\n\nLet's schedule a brief 10-minute engineering sync on Thursday to address any comments. Do you have availability at 3 PM?\n\nBest regards,\n[Your Name]\nSalesCorp Senior Lead",
      isFavorite: false,
      productLine: "Enterprise Platform",
      createdBy: "Executive Admin",
      createdAt: "2026-06-14T16:40:00Z"
    }
  ],
  auditLogs: [
    { id: "log-1", userName: "System Initializer", email: "system@salescorp.com", userId: "system", actionType: "DATABASE_INIT", details: "Database successfully seeded with standard corporate profiles, performance targets, scripts, and past client logs.", timestamp: "2026-06-22T00:00:00Z" }
  ],
  sessions: {}
};

// Database Access wrapper
class SalesDatabase {
  private data: DatabaseSchema = { ...DEFAULT_DB };

  constructor() {
    this.load();
  }

  // Load from disk
  private load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);
        console.log("Database successfully loaded from sales_db.json");
      } else {
        this.save();
        console.log("No existing database. Created and seeded default schema.");
      }
    } catch (e) {
      console.error("Database loading exception, defaulting to memory store", e);
    }
  }

  // Save to disk
  public save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      // Atomic write using temp file
      const tempFile = DB_FILE + ".tmp";
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), "utf-8");
      fs.renameSync(tempFile, DB_FILE);
    } catch (e) {
      console.error("Critical error saving database to file system:", e);
    }
  }

  public getUsers(): User[] {
    return this.data.users;
  }

  public getPasswords(): Record<string, { hash: string; salt: string }> {
    return this.data.passwords;
  }

  public getCalls(): DailyCall[] {
    return this.data.calls;
  }

  public getLeads(): ClientLead[] {
    return this.data.leads;
  }

  public getTargets(): Target[] {
    return this.data.targets;
  }

  public getPitches(): PitchScript[] {
    return this.data.pitches;
  }

  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  public getSessions(): Record<string, { userId: string; expiresAt: string }> {
    return this.data.sessions;
  }

  // Set database mutation arrays directly
  public setCalls(calls: DailyCall[]) {
    this.data.calls = calls;
    this.save();
  }

  public setLeads(leads: ClientLead[]) {
    this.data.leads = leads;
    this.save();
  }

  public setTargets(targets: Target[]) {
    this.data.targets = targets;
    this.save();
  }

  public setPitches(pitches: PitchScript[]) {
    this.data.pitches = pitches;
    this.save();
  }

  public setUsers(users: User[]) {
    this.data.users = users;
    this.save();
  }

  public addAuditLog(userName: string, email: string, userId: string, actionType: string, details: string) {
    const newLog: AuditLog = {
      id: "log-" + generateId().slice(0, 8),
      userName,
      email,
      userId,
      actionType,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(newLog); // newer log shows first
    this.save();
    return newLog;
  }

  public addSession(token: string, userId: string, expiresAt: string) {
    this.data.sessions[token] = { userId, expiresAt };
    this.save();
  }

  public removeSession(token: string) {
    delete this.data.sessions[token];
    this.save();
  }
}

const db = new SalesDatabase();

// Express Application Core
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simple Session Authorization Middleware based on Bearer Token
  function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Access denied. Valid login token is required." });
      return;
    }

    const token = authHeader.substring(7);
    const session = db.getSessions()[token];

    if (!session) {
      res.status(401).json({ error: "Your session is invalid or has expired." });
      return;
    }

    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      db.removeSession(token);
      res.status(401).json({ error: "Your session has expired. Please login again." });
      return;
    }

    const user = db.getUsers().find(u => u.id === session.userId);
    if (!user) {
      res.status(401).json({ error: "Associated user profile could not be found." });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: "Your account is currently suspended." });
      return;
    }

    // Attach user information to request
    (req as any).user = user;
    (req as any).token = token;
    next();
  }

  // Role Checker Guard Helper
  function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = (req as any).user as User;
    if (user.role !== "admin") {
      res.status(403).json({ error: "Unauthorized. This action is restricted to Admins only." });
      return;
    }
    next();
  }

  // --- API ROUTE GROUPS ---

  // User login and Auth
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Please enter both Email and Password." });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = db.getUsers().find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      res.status(401).json({ error: "Invalid credentials. Please verify details." });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: "This user profile has been suspended." });
      return;
    }

    const passwordRecord = db.getPasswords()[normalizedEmail];
    if (!passwordRecord) {
      res.status(400).json({ error: "Authentication system error. Restoring profile failed." });
      return;
    }

    const computedHash = hashPassword(password, passwordRecord.salt);
    if (computedHash !== passwordRecord.hash) {
      res.status(401).json({ error: "Invalid credentials. Please verify details." });
      return;
    }

    // Generate secure session token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 Hours valid

    db.addSession(token, user.id, expiresAt);
    db.addAuditLog(user.name, user.email, user.id, "USER_LOGIN", "User logged into the platform successfully.");

    res.json({
      user,
      token
    });
  });

  // User session retrieval
  app.get("/api/auth/session", authenticate, (req, res) => {
    const user = (req as any).user as User;
    res.json({ user, token: (req as any).token });
  });

  // User logout
  app.post("/api/auth/logout", authenticate, (req, res) => {
    const token = (req as any).token as string;
    const user = (req as any).user as User;

    db.removeSession(token);
    db.addAuditLog(user.name, user.email, user.id, "USER_LOGOUT", "User logged out of the application.");

    res.json({ success: true, message: "Logged out successfully" });
  });

  // --- CALL LOGGING (Daily Call Tracking) ---

  // READ calls
  app.get("/api/calls", authenticate, (req, res) => {
    const user = (req as any).user as User;
    const calls = db.getCalls();

    if (user.role === "admin") {
      res.json(calls);
    } else {
      // Team members only see their OWN calls
      const filtered = calls.filter(c => c.employeeId === user.id);
      res.json(filtered);
    }
  });

  // CREATE daily call report (Admin and Team Members)
  app.post("/api/calls", authenticate, (req, res) => {
    const actor = (req as any).user as User;
    let { date, employeeId, callsMade, callsConnected, interestedCalls, notConnectedCalls, followUpsScheduled, meetingsBooked, clientsConverted, remarks, revenueGenerated } = req.body;

    // Non-admins can only log calls for themselves
    if (actor.role !== "admin") {
      employeeId = actor.id;
    }

    if (!date || !employeeId) {
      res.status(400).json({ error: "Missing required fields: Date and Employee selection are mandatory." });
      return;
    }

    const employee = db.getUsers().find(u => u.id === employeeId);
    if (!employee && actor.role === "admin") {
      res.status(404).json({ error: "The selected team member could not be found." });
      return;
    }

    const newCall: DailyCall = {
      id: "c-" + generateId().slice(0, 8),
      date,
      employeeId,
      employeeName: employee ? employee.name : actor.name,
      callsMade: Number(callsMade) || 0,
      callsConnected: Number(callsConnected) || 0,
      interestedCalls: Number(interestedCalls) || 0,
      notConnectedCalls: Number(notConnectedCalls) || 0,
      followUpsScheduled: Number(followUpsScheduled) || 0,
      meetingsBooked: Number(meetingsBooked) || 0,
      clientsConverted: Number(clientsConverted) || 0,
      revenueGenerated: Number(revenueGenerated) || 0,
      remarks: remarks || "",
      createdAt: new Date().toISOString()
    };

    const currentCalls = db.getCalls();
    currentCalls.unshift(newCall); // add latest first
    db.setCalls(currentCalls);

    // Update system targets real-time progress too!
    const allTargets = db.getTargets();
    for (const target of allTargets) {
      if (target.targetType === "calls") {
        target.achieved += newCall.callsMade;
      } else if (target.targetType === "connections") {
        target.achieved += newCall.callsConnected;
      } else if (target.targetType === "conversions") {
        target.achieved += newCall.clientsConverted;
      } else if (target.targetType === "revenue") {
        target.achieved += newCall.revenueGenerated;
      }
    }
    db.setTargets(allTargets);

    db.addAuditLog(
      actor.name, 
      actor.email, 
      actor.id, 
      "CREATE_DAILY_CALL", 
      `Logged daily statistics for ${newCall.employeeName} for ${date}: ${callsMade} calls, ${callsConnected} connected, ${clientsConverted} converted, Revenue: $${newCall.revenueGenerated}.`
    );

    res.status(201).json(newCall);
  });

  // UPDATE daily call report (Admin and owner Team Members)
  app.put("/api/calls/:id", authenticate, (req, res) => {
    const actor = (req as any).user as User;
    const { id } = req.params;
    let { date, employeeId, callsMade, callsConnected, interestedCalls, notConnectedCalls, followUpsScheduled, meetingsBooked, clientsConverted, remarks, revenueGenerated } = req.body;

    const currentCalls = db.getCalls();
    const callIndex = currentCalls.findIndex(c => c.id === id);

    if (callIndex === -1) {
      res.status(404).json({ error: "The specified call tracking record was not found." });
      return;
    }

    const oldCall = currentCalls[callIndex];
    
    // Non-admins can only modify their own call records
    if (actor.role !== "admin" && oldCall.employeeId !== actor.id) {
      res.status(403).json({ error: "Access Denied: You cannot modify records belonging to other personnel." });
      return;
    }

    // Force self employeeId for non-admins
    if (actor.role !== "admin") {
      employeeId = actor.id;
    }

    // Employee details
    let empName = oldCall.employeeName;
    let empId = oldCall.employeeId;
    if (employeeId && employeeId !== oldCall.employeeId) {
      const employee = db.getUsers().find(u => u.id === employeeId);
      if (employee) {
        empId = employee.id;
        empName = employee.name;
      }
    }

    const updatedCall: DailyCall = {
      ...oldCall,
      date: date || oldCall.date,
      employeeId: empId,
      employeeName: empName,
      callsMade: callsMade !== undefined ? Number(callsMade) : oldCall.callsMade,
      callsConnected: callsConnected !== undefined ? Number(callsConnected) : oldCall.callsConnected,
      interestedCalls: interestedCalls !== undefined ? Number(interestedCalls) : oldCall.interestedCalls,
      notConnectedCalls: notConnectedCalls !== undefined ? Number(notConnectedCalls) : oldCall.notConnectedCalls,
      followUpsScheduled: followUpsScheduled !== undefined ? Number(followUpsScheduled) : oldCall.followUpsScheduled,
      meetingsBooked: meetingsBooked !== undefined ? Number(meetingsBooked) : oldCall.meetingsBooked,
      clientsConverted: clientsConverted !== undefined ? Number(clientsConverted) : oldCall.clientsConverted,
      revenueGenerated: revenueGenerated !== undefined ? Number(revenueGenerated) : oldCall.revenueGenerated,
      remarks: remarks !== undefined ? remarks : oldCall.remarks
    };

    // Correct target achievements dynamically
    const allTargets = db.getTargets();
    for (const target of allTargets) {
      if (target.targetType === "calls") {
        target.achieved = Math.max(0, target.achieved - oldCall.callsMade + updatedCall.callsMade);
      } else if (target.targetType === "connections") {
        target.achieved = Math.max(0, target.achieved - oldCall.callsConnected + updatedCall.callsConnected);
      } else if (target.targetType === "conversions") {
        target.achieved = Math.max(0, target.achieved - oldCall.clientsConverted + updatedCall.clientsConverted);
      } else if (target.targetType === "revenue") {
        target.achieved = Math.max(0, target.achieved - oldCall.revenueGenerated + updatedCall.revenueGenerated);
      }
    }
    db.setTargets(allTargets);

    currentCalls[callIndex] = updatedCall;
    db.setCalls(currentCalls);

    db.addAuditLog(
      actor.name, 
      actor.email, 
      actor.id, 
      "UPDATE_DAILY_CALL", 
      `Updated call record id ${id} for ${empName} on date ${updatedCall.date}.`
    );

    res.json(updatedCall);
  });

  // DELETE daily call report (Admin and owner Team Members)
  app.delete("/api/calls/:id", authenticate, (req, res) => {
    const actor = (req as any).user as User;
    const { id } = req.params;

    const currentCalls = db.getCalls();
    const callIndex = currentCalls.findIndex(c => c.id === id);

    if (callIndex === -1) {
      res.status(404).json({ error: "The call tracking record was not found to delete." });
      return;
    }

    const removedCall = currentCalls[callIndex];

    // Non-admins can only delete their own call records
    if (actor.role !== "admin" && removedCall.employeeId !== actor.id) {
      res.status(403).json({ error: "Access Denied: You cannot delete records belonging to other personnel." });
      return;
    }

    currentCalls.splice(callIndex, 1);
    db.setCalls(currentCalls);

    // Correct target achievements dynamically
    const allTargets = db.getTargets();
    for (const target of allTargets) {
      if (target.targetType === "calls") {
        target.achieved = Math.max(0, target.achieved - removedCall.callsMade);
      } else if (target.targetType === "connections") {
        target.achieved = Math.max(0, target.achieved - removedCall.callsConnected);
      } else if (target.targetType === "conversions") {
        target.achieved = Math.max(0, target.achieved - removedCall.clientsConverted);
      } else if (target.targetType === "revenue") {
        target.achieved = Math.max(0, target.achieved - removedCall.revenueGenerated);
      }
    }
    db.setTargets(allTargets);

    db.addAuditLog(
      actor.name, 
      actor.email, 
      actor.id, 
      "DELETE_DAILY_CALL", 
      `Deleted old call record id ${id} of ${removedCall.employeeName} dated ${removedCall.date}.`
    );

    res.json({ success: true, message: "Record successfully deleted" });
  });

  // --- CLIENT LEADS (Client Conversion Tracker) ---

  // READ all leads
  app.get("/api/leads", authenticate, (req, res) => {
    const user = (req as any).user as User;
    const leads = db.getLeads();

    if (user.role === "admin") {
      res.json(leads);
    } else {
      // Team members only see leads actively assigned to them
      const filtered = leads.filter(l => l.assignedToId === user.id);
      res.json(filtered);
    }
  });

  // CREATE lead (Admin Only)
  app.post("/api/leads", authenticate, requireAdmin, (req, res) => {
    const admin = (req as any).user as User;
    const { clientName, contactNumber, leadSource, assignedToId, status, notes } = req.body;

    if (!clientName || !assignedToId) {
      res.status(400).json({ error: "Client Name and Assigned Employee selection are mandatory fields." });
      return;
    }

    const employee = db.getUsers().find(u => u.id === assignedToId);
    if (!employee) {
      res.status(404).json({ error: "The selected team executive could not be identified." });
      return;
    }

    const newLead: ClientLead = {
      id: "l-" + generateId().slice(0, 8),
      clientName,
      contactNumber: contactNumber || "",
      leadSource: leadSource || "LinkedIn",
      assignedToId: employee.id,
      assignedToName: employee.name,
      status: status || "New Lead",
      notes: notes || "",
      lastUpdated: new Date().toISOString()
    };

    const currentLeads = db.getLeads();
    currentLeads.unshift(newLead);
    db.setLeads(currentLeads);

    db.addAuditLog(
      admin.name, 
      admin.email, 
      admin.id, 
      "CREATE_CLIENT_LEAD", 
      `Created new lead '${clientName}' assigned to executive ${employee.name} with status [${newLead.status}].`
    );

    res.status(201).json(newLead);
  });

  // UPDATE lead (Admin Only)
  app.put("/api/leads/:id", authenticate, requireAdmin, (req, res) => {
    const admin = (req as any).user as User;
    const { id } = req.params;
    const { clientName, contactNumber, leadSource, assignedToId, status, notes } = req.body;

    const currentLeads = db.getLeads();
    const leadIndex = currentLeads.findIndex(l => l.id === id);

    if (leadIndex === -1) {
      res.status(404).json({ error: "The client lead record could not be found." });
      return;
    }

    const oldLead = currentLeads[leadIndex];
    let assignedName = oldLead.assignedToName;
    let assignedId = oldLead.assignedToId;

    if (assignedToId && assignedToId !== oldLead.assignedToId) {
      const employee = db.getUsers().find(u => u.id === assignedToId);
      if (employee) {
        assignedId = employee.id;
        assignedName = employee.name;
      }
    }

    const updatedLead: ClientLead = {
      ...oldLead,
      clientName: clientName || oldLead.clientName,
      contactNumber: contactNumber !== undefined ? contactNumber : oldLead.contactNumber,
      leadSource: leadSource || oldLead.leadSource,
      assignedToId: assignedId,
      assignedToName: assignedName,
      status: status || oldLead.status,
      notes: notes !== undefined ? notes : oldLead.notes,
      lastUpdated: new Date().toISOString()
    };

    currentLeads[leadIndex] = updatedLead;
    db.setLeads(currentLeads);

    db.addAuditLog(
      admin.name, 
      admin.email, 
      admin.id, 
      "UPDATE_CLIENT_LEAD", 
      `Updated lead status of Client '${updatedLead.clientName}' to [${updatedLead.status}].`
    );

    res.json(updatedLead);
  });

  // DELETE lead (Admin Only)
  app.delete("/api/leads/:id", authenticate, requireAdmin, (req, res) => {
    const admin = (req as any).user as User;
    const { id } = req.params;

    const currentLeads = db.getLeads();
    const leadIndex = currentLeads.findIndex(l => l.id === id);

    if (leadIndex === -1) {
      res.status(404).json({ error: "The lead record could not be found for deletion." });
      return;
    }

    const deletedLead = currentLeads[leadIndex];
    currentLeads.splice(leadIndex, 1);
    db.setLeads(currentLeads);

    db.addAuditLog(
      admin.name, 
      admin.email, 
      admin.id, 
      "DELETE_CLIENT_LEAD", 
      `Removed lead file for '${deletedLead.clientName}' assigned to executive ${deletedLead.assignedToName}.`
    );

    res.json({ success: true, message: "Lead record successfully wiped out" });
  });

  // --- TARGET MANAGEMENT ---

  // GET targets (Admin and Team)
  app.get("/api/targets", authenticate, (req, res) => {
    res.json(db.getTargets());
  });

  // CREATE target (Admin Only)
  app.post("/api/targets", authenticate, requireAdmin, (req, res) => {
    const admin = (req as any).user as User;
    const { title, timeframe, targetType, value, startDate, endDate } = req.body;

    if (!title || !timeframe || !targetType || !value) {
      res.status(400).json({ error: "Title, Timeframe, Target Type, and Goal Value are mandatory." });
      return;
    }

    // Dynamic actual value calculation based on currently logged data
    let calculatedAchieved = 0;
    const allCalls = db.getCalls();

    for (const call of allCalls) {
      if (targetType === "calls") {
        calculatedAchieved += call.callsMade;
      } else if (targetType === "connections") {
        calculatedAchieved += call.callsConnected;
      } else if (targetType === "conversions") {
        calculatedAchieved += call.clientsConverted;
      } else if (targetType === "revenue") {
        calculatedAchieved += call.revenueGenerated;
      }
    }

    const newTarget: Target = {
      id: "t-" + generateId().slice(0, 8),
      title,
      timeframe,
      targetType,
      value: Number(value),
      achieved: calculatedAchieved,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const currentTargets = db.getTargets();
    currentTargets.push(newTarget);
    db.setTargets(currentTargets);

    db.addAuditLog(
      admin.name, 
      admin.email, 
      admin.id, 
      "CREATE_TARGET", 
      `Created target objectives '${title}' (${timeframe}) with a threshold goal of ${value}.`
    );

    res.status(201).json(newTarget);
  });

  // UPDATE target (Admin Only)
  app.put("/api/targets/:id", authenticate, requireAdmin, (req, res) => {
    const admin = (req as any).user as User;
    const { id } = req.params;
    const { title, timeframe, targetType, value, startDate, endDate, achieved } = req.body;

    const currentTargets = db.getTargets();
    const index = currentTargets.findIndex(t => t.id === id);

    if (index === -1) {
      res.status(404).json({ error: "Target objectives parameters not found." });
      return;
    }

    const oldTarget = currentTargets[index];
    const updatedTarget: Target = {
      ...oldTarget,
      title: title || oldTarget.title,
      timeframe: timeframe || oldTarget.timeframe,
      targetType: targetType || oldTarget.targetType,
      value: value !== undefined ? Number(value) : oldTarget.value,
      achieved: achieved !== undefined ? Number(achieved) : oldTarget.achieved,
      startDate: startDate || oldTarget.startDate,
      endDate: endDate || oldTarget.endDate
    };

    currentTargets[index] = updatedTarget;
    db.setTargets(currentTargets);

    db.addAuditLog(
      admin.name, 
      admin.email, 
      admin.id, 
      "UPDATE_TARGET", 
      `Reconfigured goals parameters of '${updatedTarget.title}' to threshold value ${updatedTarget.value}.`
    );

    res.json(updatedTarget);
  });

  // DELETE target (Admin Only)
  app.delete("/api/targets/:id", authenticate, requireAdmin, (req, res) => {
    const admin = (req as any).user as User;
    const { id } = req.params;

    const currentTargets = db.getTargets();
    const index = currentTargets.findIndex(t => t.id === id);

    if (index === -1) {
      res.status(404).json({ error: "Target not found to delete." });
      return;
    }

    const deleted = currentTargets[index];
    currentTargets.splice(index, 1);
    db.setTargets(currentTargets);

    db.addAuditLog(
      admin.name, 
      admin.email, 
      admin.id, 
      "DELETE_TARGET", 
      `Deleted target objective '${deleted.title}' (${deleted.timeframe}).`
    );

    res.json({ success: true, message: "Target objectives deleted successfully" });
  });


  // --- PITCH & SCRIPT LIBRARY ---

  // GET pitches (Admin and Team)
  app.get("/api/pitches", authenticate, (req, res) => {
    res.json(db.getPitches());
  });

  // CREATE pitch script item (Admin Only)
  app.post("/api/pitches", authenticate, requireAdmin, (req, res) => {
    const admin = (req as any).user as User;
    const { title, category, content, productLine } = req.body;

    if (!title || !category || !content) {
      res.status(400).json({ error: "Title, Category selection, and Pitch script body content are mandatory fields." });
      return;
    }

    const newPitch: PitchScript = {
      id: "p-" + generateId().slice(0, 8),
      title,
      category,
      content,
      productLine: productLine || "General Sales",
      isFavorite: false,
      createdBy: admin.name,
      createdAt: new Date().toISOString()
    };

    const currentPitches = db.getPitches();
    currentPitches.unshift(newPitch);
    db.setPitches(currentPitches);

    db.addAuditLog(
      admin.name, 
      admin.email, 
      admin.id, 
      "CREATE_PITCH", 
      `Saved script draft '${title}' under Category [${category}].`
    );

    res.status(201).json(newPitch);
  });

  // UPDATE pitch script item (Admin Only)
  app.put("/api/pitches/:id", authenticate, requireAdmin, (req, res) => {
    const admin = (req as any).user as User;
    const { id } = req.params;
    const { title, category, content, productLine, isFavorite } = req.body;

    const currentPitches = db.getPitches();
    const index = currentPitches.findIndex(p => p.id === id);

    if (index === -1) {
      res.status(404).json({ error: "Pitch script target ID not found." });
      return;
    }

    const oldPitch = currentPitches[index];
    const updatedPitch: PitchScript = {
      ...oldPitch,
      title: title || oldPitch.title,
      category: category || oldPitch.category,
      content: content || oldPitch.content,
      productLine: productLine !== undefined ? productLine : oldPitch.productLine,
      isFavorite: isFavorite !== undefined ? isFavorite : oldPitch.isFavorite
    };

    currentPitches[index] = updatedPitch;
    db.setPitches(currentPitches);

    // Skip verbose log on quick favorite toggle
    const isOnlyFavoriteChange = isFavorite !== undefined && !title && !category && !content && !productLine;
    if (!isOnlyFavoriteChange) {
      db.addAuditLog(
        admin.name, 
        admin.email, 
        admin.id, 
        "UPDATE_PITCH", 
        `Updated details on script block '${updatedPitch.title}'.`
      );
    }

    res.json(updatedPitch);
  });

  // DELETE pitch script item (Admin Only)
  app.delete("/api/pitches/:id", authenticate, requireAdmin, (req, res) => {
    const admin = (req as any).user as User;
    const { id } = req.params;

    const currentPitches = db.getPitches();
    const index = currentPitches.findIndex(p => p.id === id);

    if (index === -1) {
      res.status(404).json({ error: "Selected script not found in library." });
      return;
    }

    const deleted = currentPitches[index];
    currentPitches.splice(index, 1);
    db.setPitches(currentPitches);

    db.addAuditLog(
      admin.name, 
      admin.email, 
      admin.id, 
      "DELETE_PITCH", 
      `Removed pitch scripts for '${deleted.title}' from Library archives.`
    );

    res.json({ success: true, message: "Pitch script removed from registry" });
  });

  // --- TEAM USER CONFIGURATION MANAGEMENT (Admin Only) ---

  // READ users list
  app.get("/api/users", authenticate, requireAdmin, (req, res) => {
    // Exclude password hashes
    res.json(db.getUsers());
  });

  // CREATE user (Admin Only)
  app.post("/api/users", authenticate, requireAdmin, (req, res) => {
    const admin = (req as any).user as User;
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: "Name, email, password, and system role parameters are required." });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = db.getUsers().find(u => u.email.toLowerCase() === normalizedEmail);

    if (existingUser) {
      res.status(400).json({ error: "A user profile with this identical email already exists." });
      return;
    }

    const newUser: User = {
      id: "u-" + generateId().slice(0, 8),
      name: name.trim(),
      email: normalizedEmail,
      role: role as UserRole,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const currentUsers = db.getUsers();
    currentUsers.push(newUser);
    db.setUsers(currentUsers);

    // Write hashed password safely
    const passwords = db.getPasswords();
    passwords[normalizedEmail] = {
      hash: hashPassword(password, INITIAL_SALT),
      salt: INITIAL_SALT
    };
    db.save();

    db.addAuditLog(
      admin.name, 
      admin.email, 
      admin.id, 
      "CREATE_USER", 
      `Created new team user credentials for ${newUser.name} with Role: [${newUser.role}].`
    );

    res.status(201).json(newUser);
  });

  // UPDATE user active status (Admin Only)
  app.put("/api/users/:id", authenticate, requireAdmin, (req, res) => {
    const admin = (req as any).user as User;
    const { id } = req.params;
    const { name, role, isActive } = req.body;

    const currentUsers = db.getUsers();
    const idx = currentUsers.findIndex(u => u.id === id);

    if (idx === -1) {
      res.status(404).json({ error: "The designated user profile could not be found." });
      return;
    }

    const oldUser = currentUsers[idx];
    if (admin.id === id && isActive === false) {
      res.status(400).json({ error: "Prohibited Action. Executing Admin can not auto-suspend their own active authorization session." });
      return;
    }

    if (admin.id === id && role !== undefined && role !== oldUser.role) {
      res.status(400).json({ error: "Prohibited Action: Administrators are not permitted to change their own role assignment." });
      return;
    }

    const updatedUser: User = {
      ...oldUser,
      name: name !== undefined ? name.trim() : oldUser.name,
      role: role !== undefined ? role as UserRole : oldUser.role,
      isActive: isActive !== undefined ? Boolean(isActive) : oldUser.isActive
    };

    currentUsers[idx] = updatedUser;
    db.setUsers(currentUsers);

    db.addAuditLog(
      admin.name, 
      admin.email, 
      admin.id, 
      "UPDATE_USER", 
      `Amended profile configuration on User ${updatedUser.name}. Status: [Active=${updatedUser.isActive}, Role=${updatedUser.role}].`
    );

    res.json(updatedUser);
  });


  // --- AUDIT LOGS (Admin Only) ---
  app.get("/api/audit-logs", authenticate, requireAdmin, (req, res) => {
    res.json(db.getAuditLogs());
  });


  // --- DYNAMIC NOTIFICATIONS SYSTEM ---
  // Calculates system status alerts automatically in real-time
  app.get("/api/notifications", authenticate, (req, res) => {
    const notifications: SystemNotification[] = [];
    const calls = db.getCalls();
    const leads = db.getLeads();
    const targets = db.getTargets();

    // 1. Check if Daily performance data has been logged for TODAY
    const todayStr = new Date().toISOString().split('T')[0];
    const loggedToday = calls.some(c => c.date === todayStr);
    
    if (!loggedToday) {
      notifications.push({
        id: "notif-1",
        title: "Daily Data Missing",
        message: "No call performance logs have been entered for today's sales operations cycle yet.",
        type: "warning",
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    // 2. Check for drop in average conversion rate (Converted Calls / Connected Calls %)
    const totalConnected = calls.reduce((acc, c) => acc + c.callsConnected, 0);
    const totalConverted = calls.reduce((acc, c) => acc + c.clientsConverted, 0);
    const overallRate = totalConnected > 0 ? (totalConverted / totalConnected) * 100 : 0;

    if (overallRate < 11 && totalConnected > 20) {
      notifications.push({
        id: "notif-2",
        title: "Team Conversion Alert",
        message: `Crucial metric dip: Team-wide connection-to-conversion rate has fallen to ${overallRate.toFixed(1)}%. Core followup script review recommended.`,
        type: "alert",
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    // 3. Targets achieved or team members missing weekly target ratios
    // Check key monthly conversion target first
    const activeMonthlyConv = targets.find(t => t.timeframe === "monthly" && t.targetType === "conversions");
    if (activeMonthlyConv && activeMonthlyConv.achieved >= activeMonthlyConv.value) {
      notifications.push({
        id: "notif-3",
        title: "Month Goal Achieved!",
        message: `Milestone Alert: The June business conversion milestone goal (${activeMonthlyConv.value}) has been surpassed! Total registered is ${activeMonthlyConv.achieved}.`,
        type: "success",
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    // 4. Alerts for team members with low target engagement
    // Find reps with logged calls but zero conversions
    const empPerformanceMap: Record<string, { name: string; calls: number; conversions: number }> = {};
    for (const call of calls) {
      if (!empPerformanceMap[call.employeeId]) {
        empPerformanceMap[call.employeeId] = { name: call.employeeName, calls: 0, conversions: 0 };
      }
      empPerformanceMap[call.employeeId].calls += call.callsMade;
      empPerformanceMap[call.employeeId].conversions += call.clientsConverted;
    }

    Object.keys(empPerformanceMap).forEach((id) => {
      const perf = empPerformanceMap[id];
      if (perf.calls > 150 && perf.conversions === 0) {
        notifications.push({
          id: `notif-miss-${id}`,
          title: `Low Performance: ${perf.name}`,
          message: `${perf.name} has registered ${perf.calls} calls without a verified lead conversion inside active performance history logs.`,
          type: "warning",
          timestamp: new Date().toISOString(),
          read: false
        });
      }
    });

    res.json(notifications);
  });


  // --- STATIC ASSETS & VITE SERVING ---

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to 0.0.0.0 and port 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sales Corporate Dashboard backend running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical Failure in Server Boot Engine:", err);
});
