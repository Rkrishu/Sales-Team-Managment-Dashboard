/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Trophy, 
  Target, 
  PhoneCall, 
  TrendingUp, 
  Sparkles, 
  Percent, 
  Star,
  Zap,
  ArrowUpRight
} from "lucide-react";
import { DailyCall, User, Target as TargetType } from "../types";

interface LeaderboardTabProps {
  users: User[];
  calls: DailyCall[];
  targets: TargetType[];
}

type SortCriteria = "conversions" | "calls" | "connections" | "revenue" | "achievement";

export default function LeaderboardTab({ users, calls, targets }: LeaderboardTabProps) {
  const [criteria, setCriteria] = useState<SortCriteria>("conversions");
  
  const activeMembers = users.filter(u => u.role === "team_member" && u.isActive);

  // Core metrics map
  const boardData = activeMembers.map(member => {
    const memberCalls = calls.filter(c => c.employeeId === member.id);
    
    const callsMade = memberCalls.reduce((acc, c) => acc + c.callsMade, 0);
    const connected = memberCalls.reduce((acc, c) => acc + c.callsConnected, 0);
    const conversions = memberCalls.reduce((acc, c) => acc + c.clientsConverted, 0);
    const revenue = memberCalls.reduce((acc, c) => acc + (c.revenueGenerated || 0), 0);

    // Calculate achievement ratio against individual quota
    const activeConvTarget = targets.find((t) => t.timeframe === "monthly" && t.targetType === "conversions");
    const teamTargetValue = activeConvTarget ? activeConvTarget.value : 40;
    const individualAssignedTarget = Math.round(teamTargetValue / Math.max(1, activeMembers.length));
    
    const achievementPercent = individualAssignedTarget > 0 
      ? Math.round((conversions / individualAssignedTarget) * 100)
      : 100;

    return {
      userId: member.id,
      name: member.name,
      email: member.email,
      conversions,
      callsMade,
      connected,
      revenue,
      achievement: achievementPercent
    };
  });

  // Sort candidates
  const sortedBoard = [...boardData].sort((a, b) => {
    switch (criteria) {
      case "calls": return b.callsMade - a.callsMade;
      case "connections": return b.connected - a.connected;
      case "revenue": return b.revenue - a.revenue;
      case "achievement": return b.achievement - a.achievement;
      case "conversions":
      default:
        return b.conversions - a.conversions;
    }
  });

  // Slice podium models
  const podium = sortedBoard.slice(0, 3);
  const remainder = sortedBoard.slice(3);

  // Rendering display values
  const getDisplayScore = (person: typeof boardData[0]) => {
    switch (criteria) {
      case "calls": return `${person.callsMade} dials`;
      case "connections": return `${person.connected} connected`;
      case "revenue": return `$${person.revenue.toLocaleString()}`;
      case "achievement": return `${person.achievement}% of quota`;
      case "conversions":
      default:
        return `${person.conversions} conversions`;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 font-sans">Active Leaderboard Rankings</h2>
          <p className="text-xs text-slate-400 mt-0.5">Gamify sales conversions and reward outstanding achievements</p>
        </div>

        {/* Sorting Dropdowns */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-410 font-medium">Rank By:</span>
          <select
            value={criteria}
            onChange={(e) => setCriteria(e.target.value as SortCriteria)}
            className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-lg p-2 font-semibold"
          >
            <option value="conversions">Deals Converted</option>
            <option value="calls">Calls Made</option>
            <option value="connections">Connected Calls</option>
            <option value="revenue">Revenue Generated</option>
            <option value="achievement">Quota Achievement %</option>
          </select>
        </div>
      </div>

      {/* Podium Visualization */}
      {podium.length > 0 && (
        <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30" />

          <div className="absolute -top-12 -right-12 h-36 w-36 bg-indigo-500/10 blur-3xl rounded-full" />
          <div className="absolute -bottom-12 -left-12 h-36 w-36 bg-rose-500/10 blur-3xl rounded-full" />

          {/* Title tag */}
          <div className="flex items-center justify-center space-x-2 relative z-10 mb-8">
            <Trophy className="h-5 w-5 text-amber-450 animate-bounce" />
            <span className="text-xs font-bold text-slate-350 tracking-widest uppercase">Performance Summit</span>
          </div>

          {/* Podium layout */}
          <div className="grid grid-cols-3 max-w-lg mx-auto items-end gap-1 relative z-10 pt-4 font-sans">
            
            {/* 2nd Place (Left) */}
            {podium[1] ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="h-14 w-14 rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center text-xl font-bold font-mono shadow-md text-slate-300">
                    🥈
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-200 truncate max-w-[85px] mt-2.5 text-center">{podium[1].name.split(" ")[0]}</p>
                <p className="text-[10px] font-semibold text-slate-450 text-center">{getDisplayScore(podium[1])}</p>
                <div className="w-16 bg-slate-800 border-t border-slate-700/60 h-16 rounded-t-lg mt-3 flex items-center justify-center font-bold text-slate-300 text-lg">
                  2
                </div>
              </div>
            ) : <div />}

            {/* 1st Place (Center) */}
            {podium[0] ? (
              <div className="flex flex-col items-center -mt-4">
                <div className="relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xl animate-pulse">👑</div>
                  <div className="h-18 w-18 rounded-full bg-amber-500/15 border-4 border-amber-500 flex items-center justify-center text-3xl font-bold font-mono shadow-lg text-amber-500">
                    🥇
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-100 truncate max-w-[100px] mt-3 tracking-wide text-center">{podium[0].name.split(" ")[0]}</p>
                <p className="text-xs font-semibold text-amber-450 text-center mt-0.5">{getDisplayScore(podium[0])}</p>
                <div className="w-20 bg-gradient-to-t from-slate-800 to-indigo-950/80 border-t-2 border-amber-500 h-24 rounded-t-lg mt-3.5 flex flex-col items-center justify-center font-bold text-amber-500 text-2xl">
                  <span>1</span>
                  <Zap className="h-4 w-4 text-amber-450 animate-pulse mt-0.5" />
                </div>
              </div>
            ) : <div />}

            {/* 3rd Place (Right) */}
            {podium[2] ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="h-13 w-13 rounded-full bg-amber-900/20 border-2 border-amber-700 flex items-center justify-center text-lg font-bold font-mono shadow-md text-amber-600">
                    🥉
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-200 truncate max-w-[85px] mt-2 text-center">{podium[2].name.split(" ")[0]}</p>
                <p className="text-[10px] font-semibold text-slate-450 text-center">{getDisplayScore(podium[2])}</p>
                <div className="w-16 bg-slate-800 border-t border-slate-700/60 h-12 rounded-t-lg mt-3 flex items-center justify-center font-bold text-slate-400 text-lg">
                  3
                </div>
              </div>
            ) : <div />}

          </div>
        </div>
      )}

      {/* Main leader ranking listings */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-805 rounded-xl shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          
          <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
            <span>Corporate Representative ranking</span>
            <span>Total metric units</span>
          </div>

          {sortedBoard.map((person, idx) => {
            const rank = idx + 1;
            const isTop3 = rank <= 3;
            
            return (
              <div 
                key={person.userId} 
                className={`p-4 flex items-center justify-between hover:bg-slate-50/30 dark:hover:bg-slate-950/10 transition font-sans ${
                  isTop3 ? 'font-medium bg-slate-50/10' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Rank identifier */}
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center font-mono font-bold ${
                    rank === 1 
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' 
                      : rank === 2 
                        ? 'bg-slate-100 text-slate-800 dark:bg-slate-850 dark:text-slate-300' 
                        : rank === 3 
                          ? 'bg-amber-900/10 text-amber-700 dark:bg-amber-950/20 dark:text-amber-500' 
                          : 'text-slate-400'
                  }`}>
                    {rank}
                  </span>

                  {/* Representative avatar details */}
                  <div className="flex items-center space-x-3">
                    <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center font-bold text-indigo-650 dark:text-indigo-400 text-xs">
                      {person.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-855 dark:text-slate-100">{person.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{person.email}</p>
                    </div>
                  </div>
                </div>

                {/* Performance stats right-aligned */}
                <div className="text-right flex items-center space-x-5">
                  <div className="hidden sm:block">
                    <div className="flex items-center space-x-4 text-[11px] text-slate-405">
                      <span>Dials: <b>{person.callsMade}</b></span>
                      <span>Conv %: <b>{person.achievement}%</b></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold text-slate-950 dark:text-white px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-lg">
                      {getDisplayScore(person)}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-emerald-500 shrink-0" />
                  </div>
                </div>

              </div>
            );
          })}

          {sortedBoard.length === 0 && (
            <div className="p-8 text-center text-slate-400 italic">No team member statistics registered for the active period.</div>
          )}
        </div>
      </div>

    </div>
  );
}
