/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// User roles definition
export type UserRole = 'admin' | 'team_member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

// Session state model
export interface AuthState {
  user: User | null;
  token: string | null;
}

// Daily call log entry
export interface DailyCall {
  id: string;
  date: string; // YYYY-MM-DD
  employeeId: string;
  employeeName: string;
  callsMade: number;
  callsConnected: number;
  interestedCalls?: number;  // Added for color segmentation
  notConnectedCalls?: number; // Added for color segmentation
  followUpsScheduled: number;
  meetingsBooked: number;
  clientsConverted: number;
  revenueGenerated: number; // Added to support revenue targets
  remarks: string;
  createdAt: string;
}

// Client status types
export type LeadStatus = 
  | 'New Lead'
  | 'Contacted'
  | 'Follow-Up'
  | 'Interested'
  | 'Negotiation'
  | 'Converted'
  | 'Lost';

// Client conversion record
export interface ClientLead {
  id: string;
  clientName: string;
  contactNumber: string;
  leadSource: string;
  assignedToId: string;
  assignedToName: string;
  status: LeadStatus;
  notes: string;
  lastUpdated: string;
}

// Target definition
export interface Target {
  id: string;
  timeframe: 'weekly' | 'monthly';
  targetType: 'calls' | 'connections' | 'conversions' | 'revenue';
  title: string;
  value: number; // The target goal number
  achieved: number;
  startDate: string;
  endDate: string;
}

// Pitch & script message template
export interface PitchScript {
  id: string;
  title: string;
  category: 'Sales Pitch' | 'WhatsApp Template' | 'Call Script' | 'Email Template' | 'Objection Handling';
  content: string;
  isFavorite?: boolean;
  productLine?: string; // added categorization helper
  createdBy: string;
  createdAt: string;
}

// Audit log entry
export interface AuditLog {
  id: string;
  userName: string;
  email: string;
  userId: string;
  actionType: string; // e.g. 'CREATE_USER', 'LOG_CALLS', 'UPDATE_TARGET', 'DELETE_PITCH', 'EXPORT_DATA'
  details: string;
  timestamp: string;
}

// App KPI dashboard states
export interface OverviewStats {
  totalTeamMembers: number;
  monthlyTarget: number;
  achievedTarget: number; // conversion target or active revenue target
  remainingTarget: number;
  conversionRate: number;
  totalCalls: number;
  connectedCalls: number;
  convertedClients: number;
}

// Notification alerts
export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'alert' | 'success' | 'info';
  timestamp: string;
  read: boolean;
}
