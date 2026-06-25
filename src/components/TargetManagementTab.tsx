/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Target as TargetIcon, 
  Plus, 
  Trash2, 
  Clock, 
  Briefcase, 
  DollarSign, 
  Coins, 
  Edit3,
  CheckCircle,
  TrendingDown
} from "lucide-react";
import { Target, User } from "../types";
import { formatCurrency } from "../utils";

interface TargetManagementTabProps {
  targets: Target[];
  currentUser: User;
  onAddTarget: (targetData: Partial<Target>) => void;
  onEditTarget: (id: string, targetData: Partial<Target>) => void;
  onDeleteTarget: (id: string) => void;
}

export default function TargetManagementTab({
  targets,
  currentUser,
  onAddTarget,
  onEditTarget,
  onDeleteTarget
}: TargetManagementTabProps) {
  const isAdmin = currentUser.role === "admin";

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly">("monthly");
  const [targetType, setTargetType] = useState<"calls" | "connections" | "conversions" | "revenue">("conversions");
  const [value, setValue] = useState(100);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);

  const handleOpenCreateForm = () => {
    setEditId(null);
    setTitle("");
    setTimeframe("monthly");
    setTargetType("conversions");
    setValue(50);
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (target: Target) => {
    setEditId(target.id);
    setTitle(target.title);
    setTimeframe(target.timeframe);
    setTargetType(target.targetType);
    setValue(target.value);
    setStartDate(target.startDate);
    setEndDate(target.endDate);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !value) return;

    const payload = {
      title: title.trim(),
      timeframe,
      targetType,
      value: Number(value),
      startDate,
      endDate
    };

    if (editId) {
      onEditTarget(editId, payload);
    } else {
      onAddTarget(payload);
    }
    setIsFormOpen(false);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "calls":
        return <Clock className="h-4 w-4" />;
      case "connections":
        return <Briefcase className="h-4 w-4" />;
      case "conversions":
        return <CheckCircle className="h-4 w-4" />;
      case "revenue":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <TargetIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 font-sans">Corporate Sales Targets & Quotas</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAdmin 
              ? "Reconfigure team-wide revenue targets, communication frequencies, and deal ratios" 
              : "Review organizational goals, weekly milestones, and achievements"
            }
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreateForm}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Objective</span>
          </button>
        )}
      </div>

      {/* Target config modal */}
      {isFormOpen && isAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/85 rounded-xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {editId ? "Update Target Parameter" : "Set New Sales Objective"}
            </h3>
            
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Goal Indicator Label</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q2 Enterprise Package Quota"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Duration Scope</label>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value as "weekly" | "monthly")}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                  >
                    <option value="weekly">Weekly Target</option>
                    <option value="monthly">Monthly Milestone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Target Dimension</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                  >
                    <option value="conversions">Deals Converted</option>
                    <option value="revenue">Revenue (USD)</option>
                    <option value="calls">Calls Engaged</option>
                    <option value="connections">Client Connections</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Target Numeric Value</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Active From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Active Until</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                  />
                </div>
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
                  {editId ? "Update Parameter" : "Commit Target"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Render active progress bars card by card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {targets.length > 0 ? (
          targets.map((target) => {
            const pct = Math.round((target.achieved / target.value) * 100);
            const pendingAmount = Math.max(0, target.value - target.achieved);
            const isCompleted = target.achieved >= target.value;

            // Type Label Display Help
            const getTypeLabel = (type: string) => {
              switch (type) {
                case "conversions": return "Convers.";
                case "revenue": return "Revenue";
                case "calls": return "Dials";
                case "connections": return "Conn.";
                default: return "Stats";
              }
            };

            return (
              <div 
                key={target.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-xl shadow-xs hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className={`p-2 rounded-lg ${
                      isCompleted 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {getIconForType(target.targetType)}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-950 dark:text-slate-100 text-sm">{target.title}</h4>
                      <p className="text-[10px] text-slate-400 tracking-wide font-medium uppercase mt-0.5">
                        {target.timeframe} • {getTypeLabel(target.targetType)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenEditForm(target)}
                          className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded transition"
                          title="Edit Target"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTarget(target.id)}
                          className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 rounded transition"
                          title="Delete Target"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="mt-5 space-y-4 font-sans text-xs">
                  
                  {/* Progress Line */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-medium">
                      <span>Total Achievement Ratio</span>
                      <span className={`font-semibold ${isCompleted ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        {pct}% Completed
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Summary grid */}
                  <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-50 dark:border-slate-800/60 text-center">
                    <div className="p-2 bg-slate-50/50 dark:bg-slate-950/25 rounded-lg">
                      <p className="text-[10px] text-slate-400 font-medium uppercase">Required</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-150 mt-1">
                        {target.targetType === "revenue" ? formatCurrency(target.value) : target.value}
                      </p>
                    </div>

                    <div className="p-2 bg-slate-50/50 dark:bg-slate-950/25 rounded-lg">
                      <p className="text-[10px] text-slate-400 font-medium uppercase text-emerald-500">Achieved</p>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-450 mt-1">
                        {target.targetType === "revenue" ? formatCurrency(target.achieved) : target.achieved}
                      </p>
                    </div>

                    <div className="p-2 bg-slate-50/50 dark:bg-slate-950/25 rounded-lg">
                      <p className="text-[10px] text-slate-400 font-medium uppercase text-indigo-500">Pending</p>
                      <p className="font-semibold text-indigo-600 dark:text-indigo-455 mt-1">
                        {target.targetType === "revenue" ? formatCurrency(pendingAmount) : pendingAmount}
                      </p>
                    </div>
                  </div>

                  {/* Lifespan date indicators */}
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Valid From: <b>{target.startDate}</b></span>
                    <span>Deadline: <b className={isCompleted ? "text-emerald-500" : "text-amber-500"}>{target.endDate}</b></span>
                  </div>

                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 p-8 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
            <p className="text-sm font-medium">No team-wide configuration goals specified.</p>
            <p className="text-xs">Select Create Objective above to provision performance quotas.</p>
          </div>
        )}
      </div>

    </div>
  );
}
