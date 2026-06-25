/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  PhoneCall, 
  UserPlus, 
  MessageSquare,
  AlertCircle,
  FileSpreadsheet,
  Info
} from "lucide-react";
import { DailyCall, User } from "../types";
import { calculateConnectedRate, calculateConversionRate, formatCurrency } from "../utils";

interface DailyTrackingTabProps {
  calls: DailyCall[];
  users: User[];
  currentUser: User;
  onAddCall: (callData: Partial<DailyCall>) => void;
  onEditCall: (id: string, callData: Partial<DailyCall>) => void;
  onDeleteCall: (id: string) => void;
}

export default function DailyTrackingTab({
  calls,
  users,
  currentUser,
  onAddCall,
  onEditCall,
  onDeleteCall
}: DailyTrackingTabProps) {
  const isAdmin = currentUser.role === "admin";
  
  // Local states for management forms
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [callsMade, setCallsMade] = useState(1000);
  const [callsConnected, setCallsConnected] = useState(400);
  const [interestedCalls, setInterestedCalls] = useState(120);
  const [notConnectedCalls, setNotConnectedCalls] = useState(600);
  const [followUpsScheduled, setFollowUpsScheduled] = useState(45);
  const [meetingsBooked, setMeetingsBooked] = useState(12);
  const [clientsConverted, setClientsConverted] = useState(4);
  const [revenue, setRevenue] = useState(12000);
  const [remarks, setRemarks] = useState("");
  const [formError, setFormError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Non-admins only see their own logs if desired. Wait, they can see others if they want, but let's conform to original:
  // "Team members only see their own calls" -> wait, in App.tsx server.ts, team members are filtered to see only their own calls on the backend.
  // We'll show all calls passed down from props.
  const totalItems = calls.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedCalls = calls.slice(startIndex, startIndex + itemsPerPage);

  const getVisiblePages = (current: number, total: number) => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, "...", total];
    }
    if (current >= total - 2) {
      return [1, "...", total - 2, total - 1, total];
    }
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  const salesReps = users.filter(u => u.role === "team_member" && u.isActive);

  const handleOpenCreateForm = () => {
    setEditId(null);
    setSelectedUser(isAdmin ? (salesReps[0]?.id || currentUser.id) : currentUser.id);
    setDate(new Date().toISOString().split("T")[0]);
    setCallsMade(1000);
    setCallsConnected(400);
    setInterestedCalls(120);
    setNotConnectedCalls(600);
    setFollowUpsScheduled(45);
    setMeetingsBooked(12);
    setClientsConverted(4);
    setRevenue(12000);
    setRemarks("");
    setFormError("");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (call: DailyCall) => {
    setEditId(call.id);
    setSelectedUser(call.employeeId);
    setDate(call.date);
    setCallsMade(call.callsMade);
    setCallsConnected(call.callsConnected);
    setInterestedCalls(call.interestedCalls || 0);
    setNotConnectedCalls(call.notConnectedCalls || 0);
    setFollowUpsScheduled(call.followUpsScheduled);
    setMeetingsBooked(call.meetingsBooked);
    setClientsConverted(call.clientsConverted);
    setRevenue(call.revenueGenerated || 0);
    setRemarks(call.remarks);
    setFormError("");
    setIsFormOpen(true);
  };

  const autoFillNotConnected = () => {
    const diff = Math.max(0, callsMade - callsConnected);
    setNotConnectedCalls(diff);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const targetUser = isAdmin ? selectedUser : currentUser.id;

    if (!targetUser) {
      setFormError("A valid Sales Representative identity must be assigned.");
      return;
    }

    if (callsConnected > callsMade) {
      setFormError("Calls Connected cannot surpass absolute Calls Made.");
      return;
    }

    if (clientsConverted + interestedCalls > callsConnected) {
      setFormError("The sum of Converted (" + clientsConverted + ") and Interested (" + interestedCalls + ") cannot surpass total Connected calls (" + callsConnected + ").");
      return;
    }

    if (notConnectedCalls > callsMade) {
      setFormError("Not Connected calls cannot exceed total Calls Made.");
      return;
    }

    const payload = {
      date,
      employeeId: targetUser,
      callsMade,
      callsConnected,
      interestedCalls,
      notConnectedCalls,
      followUpsScheduled,
      meetingsBooked,
      clientsConverted,
      revenueGenerated: revenue,
      remarks
    };

    if (editId) {
      onEditCall(editId, payload);
    } else {
      onAddCall(payload);
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header with quick creation action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Daily Call Performance Logs</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAdmin 
              ? "Register, update, or audit daily communications and dial status metrics across corporate personnel" 
              : "Review and record your personal daily dial achievements, connected rates, and client segments"
            }
          </p>
        </div>

        <button
          onClick={handleOpenCreateForm}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          <span>Record Daily Log</span>
        </button>
      </div>

      {/* Editor Modal Drawer */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 dark:bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl max-w-lg w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 my-8">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {editId ? "Edit Daily Communication Log" : "Log Daily Call Performance Metrics"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {editId 
                ? "Re-evaluate specific communication and segmentation counts" 
                : "Record dial quantities (supports up to 1000+ daily), status proportions, and conversions"
              }
            </p>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-lg text-xs flex items-start space-x-2 text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Log Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Executive Rep</label>
                  {isAdmin ? (
                    <select
                      value={selectedUser}
                      required
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                    >
                      <option value="" disabled>Select User</option>
                      {salesReps.map(rep => (
                        <option key={rep.id} value={rep.id}>{rep.name}</option>
                      ))}
                      <option value={currentUser.id}>{currentUser.name} (Admin Log)</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value={currentUser.name}
                      className="w-full text-xs bg-slate-105 hover:cursor-not-allowed dark:bg-slate-950 text-slate-500 dark:text-slate-400 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                    />
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800/60">
                <p className="text-[10px] font-bold text-slate-405 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                  <PhoneCall className="h-3 w-3 mr-1 text-indigo-500" />
                  <span>Call Volumes & Direct Connectivity</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Total Calls Made (e.g. 1000)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={callsMade}
                      onChange={(e) => setCallsMade(Number(e.target.value))}
                      className="w-full text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-center font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Connected Calls (Spoken To)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={callsConnected}
                      onChange={(e) => setCallsConnected(Number(e.target.value))}
                      className="w-full text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-center font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50/20 dark:bg-indigo-950/10 p-3 rounded-lg border border-indigo-100/30">
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                  Color-Coded Status Proportions
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="relative border-t-2 border-emerald-500 pt-1">
                    <label className="block text-[10px] text-slate-500 mb-1">Converted</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={clientsConverted}
                      onChange={(e) => setClientsConverted(Number(e.target.value))}
                      className="w-full text-xs bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900/30 text-center font-bold"
                    />
                  </div>

                  <div className="relative border-t-2 border-sky-500 pt-1">
                    <label className="block text-[10px] text-slate-500 mb-1">Interested</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={interestedCalls}
                      onChange={(e) => setInterestedCalls(Number(e.target.value))}
                      className="w-full text-xs bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-450 p-2 rounded-lg border border-sky-200 dark:border-sky-900/30 text-center font-bold"
                    />
                  </div>

                  <div className="relative border-t-2 border-rose-500 pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] text-slate-500">Not Conn.</label>
                      <button 
                        type="button" 
                        onClick={autoFillNotConnected}
                        className="text-[8px] text-indigo-505 hover:underline font-semibold"
                        title="Auto-fill with (Made - Connected)"
                      >
                        Auto
                      </button>
                    </div>
                    <input
                      type="number"
                      min="0"
                      required
                      value={notConnectedCalls}
                      onChange={(e) => setNotConnectedCalls(Number(e.target.value))}
                      className="w-full text-xs bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 p-2 rounded-lg border border-rose-200 dark:border-rose-900/30 text-center font-bold"
                    />
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 mt-1.5 leading-relaxed">
                  * Note: Remainder of connected calls (<span className="text-amber-500 font-semibold">{Math.max(0, callsConnected - clientsConverted - interestedCalls)}</span>) represent &quot;Other / Uninterested&quot; connected calls styled in <span className="text-amber-500 font-semibold">Amber</span>.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Follow-Ups</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={followUpsScheduled}
                    onChange={(e) => setFollowUpsScheduled(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Meetings Bkd</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={meetingsBooked}
                    onChange={(e) => setMeetingsBooked(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Revenue ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={revenue}
                    onChange={(e) => setRevenue(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-center font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Special Remarks</label>
                <textarea
                  value={remarks}
                  rows={2}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Notes, representative status, customer objections, template used, etc..."
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 bg-transparent rounded-lg border border-slate-200 dark:border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  {editId ? "Save Changes" : "Log Performance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Performance Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Log Date</th>
                <th className="p-4">Executive Name</th>
                <th className="p-4 text-center">Calls Made</th>
                <th className="p-4 text-center">Connected (Rate)</th>
                <th className="p-4 text-center">Follow-ups</th>
                <th className="p-4 text-center">Deals Converted (Rate)</th>
                <th className="p-4 text-right">Revenue Generated</th>
                <th className="p-4">Status & Segment Analysis (Color-Coded)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {paginatedCalls.length > 0 ? (
                paginatedCalls.map((call) => {
                  const connRate = calculateConnectedRate(call.callsConnected, call.callsMade);
                  const convRate = calculateConversionRate(call.clientsConverted, call.callsConnected);
                  
                  // Compute segmented components for distribution pill
                  const convertedCount = call.clientsConverted;
                  const interestedCount = call.interestedCalls || 0;
                  const nonConnectedCount = call.notConnectedCalls || Math.max(0, call.callsMade - call.callsConnected);
                  const otherConnectedCount = Math.max(0, call.callsConnected - convertedCount - interestedCount);

                  return (
                    <tr 
                      key={call.id} 
                      className="hover:bg-slate-50/30 dark:hover:bg-slate-950/10 transition font-sans text-slate-700 dark:text-slate-300"
                    >
                      <td className="p-4 whitespace-nowrap align-middle">
                        <div className="flex items-center space-x-2 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{call.date}</span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap align-middle font-semibold text-slate-900 dark:text-slate-100">
                        {call.employeeName}
                        {call.employeeId === currentUser.id && (
                          <span className="ml-1.5 inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            You
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap align-middle font-bold text-slate-800 dark:text-slate-200">
                        {call.callsMade}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap align-middle">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {call.callsConnected}
                        </div>
                        <div className="text-[10px] text-indigo-500 font-sans mt-0.5">
                          {connRate}% Dial Rate
                        </div>
                      </td>
                      <td className="p-4 text-center whitespace-nowrap align-middle text-slate-500">
                        {call.followUpsScheduled}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap align-middle">
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {call.clientsConverted}
                        </div>
                        <div className="text-[10px] text-emerald-500 font-sans mt-0.5">
                          {convRate}% Conv Rate
                        </div>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap align-middle font-semibold text-slate-800 dark:text-slate-150">
                        {formatCurrency(call.revenueGenerated || 0)}
                      </td>
                      <td className="p-4 min-w-[240px] align-middle">
                        {/* Segmented display metric for high-volume logs */}
                        <div className="space-y-1">
                          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-850 flex overflow-hidden">
                            {/* Converted (Emerald) */}
                            {convertedCount > 0 && (
                              <div 
                                className="h-full bg-emerald-500 transition-all shrink-0" 
                                style={{ width: `${Math.max(3, (convertedCount / call.callsMade) * 100)}%` }}
                                title={`Converted: ${convertedCount}`}
                              />
                            )}
                            {/* Interested (Sky) */}
                            {interestedCount > 0 && (
                              <div 
                                className="h-full bg-sky-500 transition-all shrink-0" 
                                style={{ width: `${Math.max(3, (interestedCount / call.callsMade) * 100)}%` }}
                                title={`Interested: ${interestedCount}`}
                              />
                            )}
                            {/* Other Connected (Amber) */}
                            {otherConnectedCount > 0 && (
                              <div 
                                className="h-full bg-amber-500 transition-all shrink-0" 
                                style={{ width: `${Math.max(3, (otherConnectedCount / call.callsMade) * 100)}%` }}
                                title={`Connected (Uninterested): ${otherConnectedCount}`}
                              />
                            )}
                            {/* Not Connected (Rose) */}
                            {nonConnectedCount > 0 && (
                              <div 
                                className="h-full bg-rose-500 transition-all shrink-0 animate-pulse-slow" 
                                style={{ width: `${Math.max(3, (nonConnectedCount / call.callsMade) * 100)}%` }}
                                title={`Not Connected / No Answer: ${nonConnectedCount}`}
                              />
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[9px] font-sans">
                            <span className="inline-flex items-center text-slate-500" title="Daily Converted Deals">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 shrink-0" />
                              <span className="font-semibold text-slate-700 dark:text-slate-350">{convertedCount} Converted</span>
                            </span>
                            <span className="inline-flex items-center text-slate-500" title="Interested Leads Scheduled">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-1 shrink-0" />
                              <span className="font-semibold text-slate-700 dark:text-slate-350">{interestedCount} Interested</span>
                            </span>
                            <span className="inline-flex items-center text-slate-500" title="Spoken to but not qualified">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1 shrink-0" />
                              <span className="font-semibold text-slate-700 dark:text-slate-355">{otherConnectedCount} Other Conn</span>
                            </span>
                            <span className="inline-flex items-center text-slate-500" title="Busy, No Answer or Rejected">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1 shrink-0" />
                              <span className="font-semibold text-slate-700 dark:text-slate-350">{nonConnectedCount} Void</span>
                            </span>
                          </div>

                          {call.remarks && (
                            <p className="text-[10px] text-slate-400 italic truncate max-w-xs mt-1 border-t border-slate-50 dark:border-slate-800/40 pt-1">
                              &ldquo;{call.remarks}&rdquo;
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-1 whitespace-nowrap align-middle">
                        {(isAdmin || call.employeeId === currentUser.id) ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEditForm(call)}
                              className="inline-flex p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-600 transition"
                              title="Edit Record"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteCall(call.id)}
                              className="inline-flex p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded text-slate-400 hover:text-rose-600 transition"
                              title="Delete Record"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Audited</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 italic">
                    No matching communication records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800 gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {Math.min(startIndex + itemsPerPage, totalItems)}
              </span>{" "}
              of <span className="font-semibold text-slate-700 dark:text-slate-300">{totalItems}</span> entries
            </div>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
                className="px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 text-slate-600 dark:text-slate-350 disabled:cursor-not-allowed font-medium transition"
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
                {getVisiblePages(activePage, totalPages).map((p, idx) => {
                  if (p === "...") {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={`page-${p}`}
                      type="button"
                      onClick={() => setCurrentPage(Number(p))}
                      className={`px-2.5 py-1.5 rounded font-semibold text-xs transition ${
                        activePage === p
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-650 dark:text-slate-350"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={activePage === totalPages}
                className="px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 text-slate-650 dark:text-slate-350 disabled:cursor-not-allowed font-medium transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
