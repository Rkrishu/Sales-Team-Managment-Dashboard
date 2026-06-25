/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Database, 
  Search, 
  Clock, 
  User, 
  Tag, 
  ShieldAlert, 
  ArrowRight,
  UserCheck2,
  CalendarDays
} from "lucide-react";
import { AuditLog } from "../types";

interface AuditLogsTabProps {
  logs: AuditLog[];
}

export default function AuditLogsTab({ logs }: AuditLogsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get unique list of logged action types
  const logTypes = ["All", ...Array.from(new Set(logs.map(l => l.actionType)))];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actionType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = actionFilter === "All" || log.actionType === actionFilter;

    return matchesSearch && matchesFilter;
  });

  // Pagination calculations
  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

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

  const getActionBadge = (actType: string) => {
    switch (actType) {
      case "USER_LOGIN":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30";
      case "CREATE_DAILY_CALL":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30";
      case "UPDATE_DAILY_CALL":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30";
      case "DELETE_DAILY_CALL":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30";
      case "CREATE_TARGET":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30";
      case "CREATE_CLIENT_LEAD":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30";
      case "CREATE_USER":
        return "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/10";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 font-sans">Security Audit Trail Log Activity</h2>
          <p className="text-xs text-slate-405 mt-0.5">Automated logging of core administrative configurations and database mutations</p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium">Filter Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-sans bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-lg p-2 font-semibold"
          >
            {logTypes.map(lt => (
              <option key={lt} value={lt}>{lt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Input bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-405 dark:text-slate-510" />
        <input
          type="text"
          placeholder="Filter audit entries by executive Name, email profiles, action metadata..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full text-xs font-sans pl-10 bg-white dark:bg-slate-900 text-slate-805 dark:text-slate-100 p-2.5 rounded-lg border border-slate-202 dark:border-slate-800 focus:outline-hidden focus:border-indigo-500"
        />
      </div>

      {/* Timeline Layout */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/55 dark:bg-slate-950/25 border-b border-slate-105 dark:border-slate-800 text-[10px] font-semibold text-slate-405 uppercase tracking-wider">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Executive operator</th>
                <th className="p-4">Action Type</th>
                <th className="p-4 max-w-lg">Operation Details</th>
                <th className="p-4 text-right">Log ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/10 transition font-sans">
                    <td className="p-4 whitespace-nowrap text-slate-400">
                      <div className="flex items-center space-x-2">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2.5">
                        <UserCheck2 className="h-4 w-4 text-indigo-505" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{log.userName}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{log.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadge(log.actionType)}`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td className="p-4 max-w-lg font-sans text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                      {log.details}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap text-[11px] font-mono font-bold text-slate-400 uppercase">
                      {log.id}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                    No matching audit logs registered in standard archives.
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
                className="px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 text-slate-650 dark:text-slate-350 disabled:cursor-not-allowed font-medium transition"
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
