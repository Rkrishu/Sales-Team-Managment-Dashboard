/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Users, Award, Mail, Sparkles, Building } from "lucide-react";
import { DailyCall, User, Target } from "../types";
import { getPerformanceRating } from "../utils";

interface TeamPerformanceTabProps {
  users: User[];
  calls: DailyCall[];
  targets: Target[];
}

export default function TeamPerformanceTab({ users, calls, targets }: TeamPerformanceTabProps) {
  const activeTeamMembers = users.filter((u) => u.role === "team_member" && u.isActive);

  // Time boundaries for aggregation
  const todayStr = new Date().toISOString().split("T")[0];
  
  // A helper date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  // Helper date 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

  // Map each active team member to aggregated metrics
  const performanceRows = activeTeamMembers.map((member) => {
    const memberCalls = calls.filter((c) => c.employeeId === member.id);

    // 1. Daily Calls (today)
    const dailyCallsSum = memberCalls
      .filter((c) => c.date === todayStr)
      .reduce((acc, c) => acc + c.callsMade, 0);

    // 2. Weekly Calls (last 7 days logs)
    const weeklyCallsSum = memberCalls
      .filter((c) => c.date >= sevenDaysAgoStr)
      .reduce((acc, c) => acc + c.callsMade, 0);

    // 3. Monthly Calls (last 30 days logs)
    const monthlyCallsSum = memberCalls
      .filter((c) => c.date >= thirtyDaysAgoStr)
      .reduce((acc, c) => acc + c.callsMade, 0);

    // 4. Connected Calls (historically logged)
    const totalConnectedSum = memberCalls.reduce((acc, c) => acc + c.callsConnected, 0);

    // 5. Total Conversions
    const totalConvertedSum = memberCalls.reduce((acc, c) => acc + c.clientsConverted, 0);

    // 6. Assigned Target (Look at conversions target portion)
    // Let's divide team-wide target by number of active team members to assign equal shares, 
    // or set a default individual target (e.g. 10 conversions per person)
    const activeConvTarget = targets.find((t) => t.timeframe === "monthly" && t.targetType === "conversions");
    const teamTargetValue = activeConvTarget ? activeConvTarget.value : 40;
    const individualAssignedTarget = Math.round(teamTargetValue / Math.max(1, activeTeamMembers.length));

    // Achievement scale
    const achievementPercent = individualAssignedTarget > 0 
      ? Math.round((totalConvertedSum / individualAssignedTarget) * 100)
      : 100;

    const ratingDetails = getPerformanceRating(achievementPercent);

    return {
      userId: member.id,
      name: member.name,
      email: member.email,
      dailyCalls: dailyCallsSum,
      weeklyCalls: weeklyCallsSum,
      monthlyCalls: monthlyCallsSum,
      connectedCalls: totalConnectedSum,
      conversions: totalConvertedSum,
      assignedTarget: individualAssignedTarget,
      achievedPercent: achievementPercent,
      rating: ratingDetails
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Team Performance Analysis</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Consolidated execution metrics with dynamic rating benchmarks (Green: Above Target, Amber: Near, Red: Below)
        </p>
      </div>

      {/* Grid of micro cards for high performing stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/20 dark:to-teal-950/10 p-5 rounded-xl border border-emerald-500/10 shadow-xs">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Achieving Threshold</h4>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">Conversions Achievement &gt;= 95%</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 dark:from-amber-950/20 dark:to-slate-900 p-5 rounded-xl border border-amber-500/10 shadow-xs">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Maintain Standard</h4>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">Target range between 75% – 94%</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 dark:from-rose-950/20 dark:to-slate-900 p-5 rounded-xl border border-rose-500/10 shadow-xs">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Under Evaluation</h4>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">Critical: Below Target (&lt; 75%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Performance Matrix Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Sales Representative</th>
                <th className="p-4 text-center">Daily Dials</th>
                <th className="p-4 text-center">Weekly Dials</th>
                <th className="p-4 text-center">Monthly Dials</th>
                <th className="p-4 text-center">Connected Calls</th>
                <th className="p-4 text-center font-bold text-slate-600 dark:text-slate-300">Conversions</th>
                <th className="p-4 text-center">Quota Share Target</th>
                <th className="p-4 text-center">Achievement %</th>
                <th className="p-4 text-right">Performance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
              {performanceRows.length > 0 ? (
                performanceRows.map((person) => (
                  <tr key={person.userId} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/10 transition font-sans">
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-950/45 flex items-center justify-center font-semibold text-indigo-600 dark:text-indigo-400">
                          {person.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{person.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-1">
                            <Mail className="h-2.5 w-2.5 shrink-0" />
                            <span>{person.email}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap font-medium">{person.dailyCalls}</td>
                    <td className="p-4 text-center whitespace-nowrap font-medium">{person.weeklyCalls}</td>
                    <td className="p-4 text-center whitespace-nowrap font-semibold">{person.monthlyCalls}</td>
                    <td className="p-4 text-center whitespace-nowrap font-medium text-slate-500">{person.connectedCalls}</td>
                    <td className="p-4 text-center whitespace-nowrap font-bold text-slate-950 dark:text-white">{person.conversions}</td>
                    <td className="p-4 text-center whitespace-nowrap text-slate-400 font-medium">
                      {person.assignedTarget} deals / mo
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center space-x-2">
                        <div className="w-12 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${person.rating.color}`} 
                            style={{ width: `${Math.min(100, person.achievedPercent)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{person.achievedPercent}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${person.rating.bg}`}>
                        {person.rating.rating}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 italic">
                    No active Team Members registered on board.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
