/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Users, 
  Target, 
  Phone, 
  PhoneCall, 
  TrendingUp, 
  Percent, 
  ChevronRight, 
  Award 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { DailyCall, ClientLead, Target as TargetType } from "../types";
import { calculateConnectedRate, calculateConversionRate, formatCurrency } from "../utils";

interface OverviewTabProps {
  calls: DailyCall[];
  leads: ClientLead[];
  targets: TargetType[];
  teamCount: number;
}

export default function OverviewTab({ calls, leads, targets, teamCount }: OverviewTabProps) {
  // Calculate general KPI aggregations
  const totalCallsMade = calls.reduce((acc, c) => acc + c.callsMade, 0);
  const totalCallsConnected = calls.reduce((acc, c) => acc + c.callsConnected, 0);
  const totalClientsConverted = calls.reduce((acc, c) => acc + c.clientsConverted, 0);
  const totalRevenueGenerated = calls.reduce((acc, c) => acc + (c.revenueGenerated || 0), 0);

  const connectedRate = calculateConnectedRate(totalCallsConnected, totalCallsMade);
  const conversionRate = calculateConversionRate(totalClientsConverted, totalCallsConnected);

  // Active Monthly conversion target
  const monthlyTargetObj = targets.find(t => t.timeframe === "monthly" && t.targetType === "conversions");
  const monthlyTargetValue = monthlyTargetObj ? monthlyTargetObj.value : 50; // default 50
  const achievedTargetValue = totalClientsConverted;
  const remainingTargetValue = Math.max(0, monthlyTargetValue - achievedTargetValue);

  // Prepare trend data of last 7 logged entries for our LineChart
  const trendData = [...calls]
    .slice(0, 10)
    .reverse()
    .map(c => ({
      date: c.date,
      Made: c.callsMade,
      Connected: c.callsConnected,
      Converted: c.clientsConverted,
      Revenue: c.revenueGenerated || 0
    }));

  // Lead status breakdown for PieChart
  const leadStatusMap = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(leadStatusMap).map(([name, value]) => ({
    name,
    value
  }));

  // High contrasting elegant theme colors
  const COLORS = [
    "#3b82f6", // Blue (New Lead)
    "#f59e0b", // Yellow (Contacted)
    "#10b981", // Green (Converted)
    "#ec4899", // Pink (Negotiation)
    "#8b5cf6", // Purple (Follow-Up)
    "#6b7280", // Gray (Lost)
    "#06b6d4"  // Cyan (Interested)
  ];

  return (
    <div className="space-y-6">
      {/* Alert Ribbon if any target is outstanding */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Award className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-medium text-slate-100 text-sm">Active Monthly Performance Drive</h4>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Team has reached <span className="text-white font-semibold">{achievedTargetValue} conversions</span> out of the {monthlyTargetValue} monthly volume threshold goal.
            </p>
          </div>
        </div>
        <div className="mt-3 sm:mt-0">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {Math.round((achievedTargetValue / monthlyTargetValue) * 100)}% Milestone Completed
          </span>
        </div>
      </div>

      {/* Grid of 4 Key Responsive KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Team & Revenue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Sales Revenue</p>
              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-1">{formatCurrency(totalRevenueGenerated)}</h3>
            </div>
            <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5 mt-4 text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">{teamCount}</span>
            <span className="text-slate-400">active conversion executives enrolled</span>
          </div>
        </div>

        {/* Card 2: Dial Activity */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Calls Engaged</p>
              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-1">{totalCallsMade}</h3>
            </div>
            <div className="p-3 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-lg">
              <Phone className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5 mt-4 text-xs">
            <span className="font-semibold text-blue-600 dark:text-blue-400">{totalCallsConnected}</span>
            <span className="text-slate-400">client connections reached ({connectedRate}%)</span>
          </div>
        </div>

        {/* Card 3: Target Remaining */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Target Outstanding</p>
              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-1">{remainingTargetValue}</h3>
            </div>
            <div className="p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-lg">
              <Target className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5 mt-4 text-xs text-slate-400">
            <span>Target: <b>{monthlyTargetValue}</b></span>
            <span>•</span>
            <span>Achieved: <b className="text-slate-700 dark:text-slate-300">{achievedTargetValue}</b></span>
          </div>
        </div>

        {/* Card 4: Team Conversion */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Conversion Efficiency</p>
              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-1">{conversionRate}%</h3>
            </div>
            <div className="p-3 bg-pink-500/15 text-pink-600 dark:text-pink-400 rounded-lg">
              <Percent className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5 mt-4 text-xs">
            <span className="font-semibold text-pink-600 dark:text-pink-400">{totalClientsConverted}</span>
            <span className="text-slate-400">direct client acquisitions confirmed</span>
          </div>
        </div>

      </div>

      {/* Visual Analytics Sections: Lines & Pies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Daily Performance Trend (Line Chart) */}
        <div className="bg-white dark:bg-slate-900 lg:col-span-2 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Performance & Activity Trends</h3>
              <p className="text-xs text-slate-400 mt-1">Audit timeline tracing call frequency and conversions over logging periods</p>
            </div>
          </div>

          <div className="h-72 w-full font-sans">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/40" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '8px', 
                      border: 'none',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                  <Line type="monotone" name="Calls Engaged" dataKey="Made" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="Client Connections" dataKey="Connected" stroke="#f59e0b" strokeWidth={2.5} />
                  <Line type="monotone" name="Conversions" dataKey="Converted" stroke="#10b981" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                <p className="text-sm font-medium">No performance history data available yet.</p>
                <p className="text-xs">Once daily data is entered by an Admin, visual trends will populate here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Client Lead Funnel Distribution (Pie Chart) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Lead Status Distributions</h3>
            <p className="text-xs text-slate-400 mt-1">Pipeline allocation map showing client placement status</p>
          </div>

          <div className="h-48 my-3 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '8px', 
                      border: 'none',
                      color: '#f8fafc',
                      fontSize: '11px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No active lead information segmented.</p>
            )}
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-36 pr-1">
            {pieData.length > 0 ? (
              pieData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.value} {item.value === 1 ? 'client' : 'clients'}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">Add client tracking details to view allocations.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
