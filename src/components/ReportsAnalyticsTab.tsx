/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  User, 
  Database, 
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  Info
} from "lucide-react";
import { DailyCall, User as UserType } from "../types";
import { downloadCSV, printReport, formatCurrency } from "../utils";

interface ReportsAnalyticsTabProps {
  calls: DailyCall[];
  users: UserType[];
  currentUser: UserType;
}

type ReportType = "daily" | "weekly" | "monthly" | "employee";

export default function ReportsAnalyticsTab({ calls, users, currentUser }: ReportsAnalyticsTabProps) {
  const isAdmin = currentUser.role === "admin";
  const [reportType, setReportType] = useState<ReportType>("monthly");
  const [selectedEmpId, setSelectedEmpId] = useState(users.find(u => u.role === "team_member")?.id || "");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const activeReps = users.filter(u => u.role === "team_member");

  // Compute boundaries for filtering
  const todayStr = new Date().toISOString().split("T")[0];
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

  // Filter based on selected criteria
  const getFilteredLogs = (): DailyCall[] => {
    switch (reportType) {
      case "daily":
        return calls.filter(c => c.date === todayStr);
      case "weekly":
        return calls.filter(c => c.date >= sevenDaysAgoStr);
      case "employee":
        return calls.filter(c => c.employeeId === selectedEmpId);
      case "monthly":
      default:
        return calls.filter(c => c.date >= thirtyDaysAgoStr);
    }
  };

  const logs = getFilteredLogs();

  // Pagination calculations
  const totalItems = logs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedLogs = logs.slice(startIndex, startIndex + itemsPerPage);

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

  // Aggregate metrics
  const totalCalls = logs.reduce((acc, c) => acc + c.callsMade, 0);
  const totalConnected = logs.reduce((acc, c) => acc + c.callsConnected, 0);
  const totalConversions = logs.reduce((acc, c) => acc + c.clientsConverted, 0);
  const totalRevenue = logs.reduce((acc, c) => acc + (c.revenueGenerated || 0), 0);
  const logsCount = logs.length;

  const connectedRate = totalCalls > 0 ? ((totalConnected / totalCalls) * 100).toFixed(1) : "0.0";
  const conversionRate = totalConnected > 0 ? ((totalConversions / totalConnected) * 100).toFixed(1) : "0.0";

  // Trigger exports (Admin Only!)
  const handleExportCSV = () => {
    if (!isAdmin) return;
    
    const title = `${reportType.toUpperCase()} SALES REPORT`;
    const headers = [
      "Log ID", 
      "Date", 
      "Employee Name", 
      "Calls Made", 
      "Connected Calls", 
      "Follow Ups", 
      "Meetings Booked", 
      "Conversions", 
      "Revenue Generated", 
      "Remarks"
    ];
    
    const rows = logs.map(c => [
      c.id,
      c.date,
      c.employeeName,
      c.callsMade,
      c.callsConnected,
      c.followUpsScheduled,
      c.meetingsBooked,
      c.clientsConverted,
      c.revenueGenerated || 0,
      c.remarks
    ]);

    downloadCSV(`${reportType}_report.csv`, headers, rows);
  };

  const handlePrintPDF = () => {
    if (!isAdmin) return;

    const title = `${reportType.toUpperCase()} SALES PERFORMANCE SUMMARY`;
    const headers = ["Date", "Employee Executive", "Calls Made", "Connected", "Conversions", "Revenue ($)", "Remarks"];
    const rows = logs.map(c => [
      c.date,
      c.employeeName,
      c.callsMade,
      c.callsConnected,
      c.clientsConverted,
      formatCurrency(c.revenueGenerated || 0),
      c.remarks
    ]);

    const summary = {
      "Total Active Entries": logsCount,
      "Aggregated Calls Engaged": totalCalls,
      "Connections Reached": totalConnected,
      "Connection Dial Rate": `${connectedRate}%`,
      "Conversions Registered": totalConversions,
      "Lead Conversion Rate": `${conversionRate}%`,
      "Consolidated Revenue": formatCurrency(totalRevenue)
    };

    printReport(title, headers, rows, summary);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 font-sans">Corporate Reports & Analytics Console</h2>
        <p className="text-xs text-slate-405 mt-0.5">Generate, view, and print detailed execution metrics reports</p>
      </div>

      {/* Selectors card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-xl shadow-xs">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Report Configurations</h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-50 dark:border-slate-800/80 items-end">
          
          <div>
            <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Timeframe Index</label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value as ReportType);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg"
            >
              <option value="daily">Daily Report (Today)</option>
              <option value="weekly">Weekly Report (Past 7 Days)</option>
              <option value="monthly">Monthly Report (Past 30 Days)</option>
              <option value="employee">Individual Employee Report</option>
            </select>
          </div>

          <div>
            {reportType === "employee" ? (
              <>
                <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Select Employee</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => {
                    setSelectedEmpId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg"
                >
                  {activeReps.map(rep => (
                    <option key={rep.id} value={rep.id}>{rep.name}</option>
                  ))}
                </select>
              </>
            ) : (
              <div className="text-xs text-slate-400 py-3 flex items-center space-x-1">
                <Info className="h-4 w-4 shrink-0 text-slate-350" />
                <span>Scope encompasses overall team achievements.</span>
              </div>
            )}
          </div>

          {/* Export Choices: Admin-Only safeguards */}
          <div className="flex sm:justify-end space-x-2">
            {isAdmin ? (
              <>
                <button
                  onClick={handleExportCSV}
                  disabled={logsCount === 0}
                  className="flex items-center space-x-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700, border border-indigo-200 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                  title="Download CSV / Excel spreadsheet"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden md:inline">Spreadsheet</span>
                </button>
                <button
                  onClick={handlePrintPDF}
                  disabled={logsCount === 0}
                  className="flex items-center space-x-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                  title="Print Report canvas as Adobe PDF"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print PDF</span>
                </button>
              </>
            ) : (
              <div className="text-[10px] bg-slate-50 dark:bg-slate-950 text-slate-400 px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-805 text-center w-full">
                🔐 Data Export is Restricted to Admins.
              </div>
            )}
          </div>

        </div>

        {/* Aggregated Totals inside preview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-5 text-center">
          
          <div className="p-3 bg-slate-50/50 dark:bg-slate-950/25 rounded-lg border border-slate-100 dark:border-slate-800/80">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Entries</p>
            <p className="font-bold text-slate-850 dark:text-white mt-1 text-sm">{logsCount}</p>
          </div>

          <div className="p-3 bg-slate-50/50 dark:bg-slate-950/25 rounded-lg border border-slate-100 dark:border-slate-800/80">
            <p className="text-[10px] text-slate-400 font-semibold uppercase text-blue-500">Calls Handled</p>
            <p className="font-bold text-slate-850 dark:text-white mt-1 text-sm">{totalCalls}</p>
          </div>

          <div className="p-3 bg-slate-50/50 dark:bg-slate-950/25 rounded-lg border border-slate-100 dark:border-slate-805">
            <p className="text-[10px] text-slate-400 font-semibold uppercase text-emerald-500">Acquisitions</p>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-1 text-sm">{totalConversions}</p>
          </div>

          <div className="p-3 bg-slate-50/50 dark:bg-slate-950/25 rounded-lg border border-slate-100 dark:border-slate-805">
            <p className="text-[10px] text-slate-400 font-semibold uppercase text-indigo-500">Conv Rate %</p>
            <p className="font-bold text-indigo-600 dark:text-indigo-400 mt-1 text-sm">{conversionRate}%</p>
          </div>

          <div className="p-3 bg-slate-50/50 dark:bg-slate-950/25 rounded-lg border border-slate-100 dark:border-slate-805 col-span-2 md:col-span-1">
            <p className="text-[10px] text-slate-400 font-semibold uppercase text-slate-600 dark:text-slate-350">Gross Revenue</p>
            <p className="font-bold text-slate-800 dark:text-slate-100 mt-1 text-sm">{formatCurrency(totalRevenue)}</p>
          </div>

        </div>
      </div>

      {/* Preview Listing Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50/50 dark:bg-slate-950/25 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-500">Recent logs covered by report</span>
          <span className="font-mono text-[10px] text-slate-400">{logsCount} rows</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/20 dark:bg-slate-950/10 border-b border-slate-100 dark:border-slate-800 text-[10px] font-semibold text-slate-405 uppercase tracking-wider">
                <th className="p-4">Log Date</th>
                <th className="p-4">Executive Owner</th>
                <th className="p-4 text-center">Dials</th>
                <th className="p-4 text-center">Connected</th>
                <th className="p-4 text-center text-emerald-500">Closed Conversions</th>
                <th className="p-4 text-right">Revenue Generated</th>
                <th className="p-4 max-w-xs">Remarks Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/10 transition font-sans">
                    <td className="p-4 font-semibold whitespace-nowrap">{log.date}</td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">{log.employeeName}</td>
                    <td className="p-4 text-center whitespace-nowrap">{log.callsMade}</td>
                    <td className="p-4 text-center whitespace-nowrap">{log.callsConnected}</td>
                    <td className="p-4 text-center font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{log.clientsConverted}</td>
                    <td className="p-4 text-right font-bold whitespace-nowrap">{formatCurrency(log.revenueGenerated || 0)}</td>
                    <td className="p-4 truncate max-w-xs text-slate-400 italic font-sans">{log.remarks || "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    No logged communications met the designated conditions.
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
