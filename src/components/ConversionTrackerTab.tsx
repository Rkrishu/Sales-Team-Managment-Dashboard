/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  Layers, 
  PhoneCall, 
  UserPlus, 
  Network, 
  Search,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  FolderMinus
} from "lucide-react";
import { ClientLead, User, LeadStatus } from "../types";

interface ConversionTrackerTabProps {
  leads: ClientLead[];
  users: User[];
  currentUser: User;
  onAddLead: (leadData: Partial<ClientLead>) => void;
  onEditLead: (id: string, leadData: Partial<ClientLead>) => void;
  onDeleteLead: (id: string) => void;
}

const ALL_STATUSES: LeadStatus[] = [
  "New Lead",
  "Contacted",
  "Follow-Up",
  "Interested",
  "Negotiation",
  "Converted",
  "Lost"
];

export default function ConversionTrackerTab({
  leads,
  users,
  currentUser,
  onAddLead,
  onEditLead,
  onDeleteLead
}: ConversionTrackerTabProps) {
  const isAdmin = currentUser.role === "admin";
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [leadSource, setLeadSource] = useState("LinkedIn");
  const [assignedToId, setAssignedToId] = useState("");
  const [status, setStatus] = useState<LeadStatus>("New Lead");
  const [notes, setNotes] = useState("");

  const salesReps = users.filter(u => u.role === "team_member" && u.isActive);

  // Group leads for funnel calculation
  const funnelCounts = ALL_STATUSES.reduce((acc, currentStatus) => {
    acc[currentStatus] = leads.filter(l => l.status === currentStatus).length;
    return acc;
  }, {} as Record<LeadStatus, number>);

  // Determine maximum count to scale funnel blocks fairly
  const maxFunnelCount = Math.max(...Object.values(funnelCounts), 1);

  // Filter lists based on search & segment selected
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.assignedToName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.leadSource.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenCreateForm = () => {
    setEditId(null);
    setClientName("");
    setContactNumber("");
    setLeadSource("LinkedIn");
    setAssignedToId(salesReps[0]?.id || "");
    setStatus("New Lead");
    setNotes("");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (lead: ClientLead) => {
    setEditId(lead.id);
    setClientName(lead.clientName);
    setContactNumber(lead.contactNumber);
    setLeadSource(lead.leadSource);
    setAssignedToId(lead.assignedToId);
    setStatus(lead.status);
    setNotes(lead.notes);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !assignedToId) return;

    const payload = {
      clientName: clientName.trim(),
      contactNumber,
      leadSource,
      assignedToId,
      status,
      notes
    };

    if (editId) {
      onEditLead(editId, payload);
    } else {
      onAddLead(payload);
    }
    setIsFormOpen(false);
  };

  const getStatusColor = (sta: LeadStatus) => {
    switch (sta) {
      case "New Lead": return "text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30";
      case "Contacted": return "text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/10";
      case "Follow-Up": return "text-purple-500 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-300/10";
      case "Interested": return "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-300/10";
      case "Negotiation": return "text-pink-500 bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-300/10";
      case "Converted": return "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-300/10";
      case "Lost": return "text-slate-500 bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Client Acquisition & Conversion Funnel</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAdmin 
              ? "Oversee and track potential lead values, communications progression, and closed deals" 
              : "Access potential opportunities assigned directly to you"
            }
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreateForm}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Client Lead</span>
          </button>
        )}
      </div>

      {/* Funnel Visualization Stage Flow */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-xl shadow-xs">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Pipeline Funnel Visualization</h4>
        
        {/* Horizontal Funnel progression */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {ALL_STATUSES.map((stg, index) => {
            const count = funnelCounts[stg];
            // Scale bar height or size
            const percentage = maxFunnelCount > 0 ? (count / maxFunnelCount) * 100 : 0;
            const isThemeCompleted = stg === "Converted";
            const isThemeLost = stg === "Lost";

            return (
              <div 
                key={stg} 
                onClick={() => setStatusFilter(statusFilter === stg ? "All" : stg)}
                className={`relative cursor-pointer flex flex-col justify-between p-3.5 rounded-lg border transition duration-150 ${
                  statusFilter === stg 
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-500' 
                    : 'bg-slate-50/50 dark:bg-slate-950/15 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5 font-sans">
                  <span className="font-semibold text-slate-400 text-[10px]">{index + 1}. Stage</span>
                  {isThemeCompleted && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                </div>

                <p className="font-semibold text-slate-850 dark:text-slate-150 text-xs truncate">{stg}</p>
                <div className="flex items-baseline space-x-1 mt-1">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">{count}</span>
                  <span className="text-[10px] text-slate-400">leads</span>
                </div>

                {/* Scaled gauge indicator inside bento card */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isThemeCompleted 
                        ? 'bg-emerald-500' 
                        : isThemeLost 
                          ? 'bg-rose-500/80' 
                          : 'bg-indigo-500'
                    }`} 
                    style={{ width: `${Math.max(12, percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main client profiles directory */}
      <div className="space-y-4">
        
        {/* Fiters & search bars */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-405 dark:text-slate-505" />
            <input
              type="text"
              placeholder="Search leads by name, assigned executive, lead source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-sans pl-10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Filter Stage:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-sans bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2 rounded-lg border border-slate-200 dark:border-slate-800"
            >
              <option value="All">All Stages</option>
              {ALL_STATUSES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lead profile creation Modal */}
        {isFormOpen && isAdmin && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-slate-940/65 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-100">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                {editId ? "Update Client Lead File" : "Register Potential Client Lead"}
              </h3>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Client Profile Name</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Wayne Enterprise Corp"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Contact Number</label>
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="+1-555-0100"
                      className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Lead Source</label>
                    <select
                      value={leadSource}
                      onChange={(e) => setLeadSource(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                    >
                      <option value="LinkedIn">LinkedIn Outreach</option>
                      <option value="Website Direct">Website Direct</option>
                      <option value="Referral">Referral Contract</option>
                      <option value="Cold Call">Cold Dialer</option>
                      <option value="Webinar">Webinar Masterclass</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Owner Assignment</label>
                    <select
                      value={assignedToId}
                      required
                      onChange={(e) => setAssignedToId(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                    >
                      <option value="" disabled>Select Executive</option>
                      {salesReps.map(rep => (
                        <option key={rep.id} value={rep.id}>{rep.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Funnel Target Stage</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as LeadStatus)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                    >
                      {ALL_STATUSES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Negotiation / Discovery Notes</label>
                  <textarea
                    value={notes}
                    rows={3}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide details about requirements, quote values, obstacles raised..."
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-transparent rounded-lg border border-slate-200 dark:border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                  >
                    {editId ? "Update File" : "Save Lead"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Profiles Cards Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead) => (
              <div 
                key={lead.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-xl shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>

                    <span className="text-[10px] bg-slate-50 dark:bg-slate-950 text-slate-400 font-medium px-2 py-0.5 rounded border border-slate-150 dark:border-slate-800">
                      ID: {lead.id}
                    </span>
                  </div>

                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{lead.clientName}</h4>
                  <p className="text-xs text-slate-400 font-medium mt-1">Lead Source: <b className="text-slate-600 dark:text-slate-350">{lead.leadSource}</b></p>
                  
                  {lead.contactNumber && (
                    <p className="text-xs text-slate-500 font-sans mt-0.5">Contact: <b>{lead.contactNumber}</b></p>
                  )}

                  <div className="mt-4 p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-lg border border-slate-100 dark:border-slate-805 text-xs text-slate-600 dark:text-slate-400 min-h-16 h-16 overflow-y-auto">
                    {lead.notes || <span className="italic text-slate-350">No notes written for this client file yet.</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50 dark:border-slate-800/50">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-indigo-50/50 dark:bg-indigo-950/25 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-[10px]">
                      {lead.assignedToName.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-350">{lead.assignedToName}</span>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditForm(lead)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-400 hover:text-indigo-600 rounded transition"
                        title="Edit Client File"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteLead(lead.id)}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 rounded transition"
                        title="Delete Client File"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
              <FolderMinus className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-705 mb-2" />
              <p className="text-sm font-medium">No active client opportunity folders found.</p>
              <p className="text-xs">Adjust your search input or register a new client profile.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
