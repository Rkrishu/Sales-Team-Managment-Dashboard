/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Target, 
  PhoneCall, 
  LayoutDashboard, 
  ClipboardList, 
  TrendingUp, 
  BookOpen, 
  Trophy, 
  FilePieChart, 
  History, 
  Bell, 
  LogOut, 
  Sun, 
  Moon, 
  Lock, 
  Loader2,
  Mail,
  CheckCircle2,
  AlertTriangle,
  UserCheck
} from "lucide-react";
import { 
  User, 
  DailyCall, 
  ClientLead, 
  Target as TargetType, 
  PitchScript, 
  AuditLog, 
  SystemNotification 
} from "./types";

// Import tabs
import OverviewTab from "./components/OverviewTab";
import DailyTrackingTab from "./components/DailyTrackingTab";
import TeamPerformanceTab from "./components/TeamPerformanceTab";
import TargetManagementTab from "./components/TargetManagementTab";
import ConversionTrackerTab from "./components/ConversionTrackerTab";
import PitchLibraryTab from "./components/PitchLibraryTab";
import LeaderboardTab from "./components/LeaderboardTab";
import ReportsAnalyticsTab from "./components/ReportsAnalyticsTab";
import AuditLogsTab from "./components/AuditLogsTab";
import AdminUsersTab from "./components/AdminUsersTab";

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark" >(() => {
    const saved = localStorage.getItem("sales_dashboard_theme");
    return (saved === "dark" || saved === "light") ? saved : "light";
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Synchronize theme with <html> element and localStorage
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("sales_dashboard_theme", theme);
  }, [theme]);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // DB Sync state
  const [calls, setCalls] = useState<DailyCall[]>([]);
  const [leads, setLeads] = useState<ClientLead[]>([]);
  const [targets, setTargets] = useState<TargetType[]>([]);
  const [pitches, setPitches] = useState<PitchScript[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Restore session if present in localStorage on page load
  useEffect(() => {
    const savedToken = localStorage.getItem("sales_auth_token");
    if (savedToken) {
      fetchSession(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Sync database state whenever the logged-in user changes
  useEffect(() => {
    if (currentUser && token) {
      syncDatabase();
    }
  }, [currentUser, token]);

  const fetchSession = async (authToken: string) => {
    try {
      const response = await fetch("/api/auth/session", {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        setToken(data.token);
        localStorage.setItem("sales_auth_token", data.token);
      } else {
        localStorage.removeItem("sales_auth_token");
      }
    } catch (e) {
      console.error("Session restore exception:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const syncDatabase = async () => {
    if (!token) return;
    try {
      const authHeaders = { Authorization: `Bearer ${token}` };

      // Load concurrent streams in parallel
      const [callsRes, leadsRes, targetsRes, pitchesRes, notifRes] = await Promise.all([
        fetch("/api/calls", { headers: authHeaders }),
        fetch("/api/leads", { headers: authHeaders }),
        fetch("/api/targets", { headers: authHeaders }),
        fetch("/api/pitches", { headers: authHeaders }),
        fetch("/api/notifications", { headers: authHeaders }),
      ]);

      if (callsRes.ok) setCalls(await callsRes.json());
      if (leadsRes.ok) setLeads(await leadsRes.json());
      if (targetsRes.ok) setTargets(await targetsRes.json());
      if (pitchesRes.ok) setPitches(await pitchesRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());

      // If Admin, also load logs and user registries
      if (currentUser?.role === "admin") {
        const [auditRes, usersRes] = await Promise.all([
          fetch("/api/audit-logs", { headers: authHeaders }),
          fetch("/api/users", { headers: authHeaders })
        ]);
        if (auditRes.ok) setAuditLogs(await auditRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());
      }
    } catch (e) {
      console.error("Exception syncing database stream:", e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user);
        setToken(data.token);
        localStorage.setItem("sales_auth_token", data.token);
      } else {
        setAuthError(data.error || "Authentication failed. Clear credentials and retry.");
      }
    } catch (err) {
      setAuthError("Network error: Could not reach corporate backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!token) return;
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error("Logout issue:", e);
    } finally {
      setCurrentUser(null);
      setToken(null);
      localStorage.removeItem("sales_auth_token");
      setCalls([]);
      setLeads([]);
      setTargets([]);
      setNotifications([]);
      setAuditLogs([]);
      setUsers([]);
      setActiveTab("overview");
    }
  };

  // Demo account quick logins (1-click workflows)
  const loginAsDemo = async (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setAuthError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user);
        setToken(data.token);
        localStorage.setItem("sales_auth_token", data.token);
      } else {
        setAuthError(data.error);
      }
    } catch (err) {
      setAuthError("Could not reach backend.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- MUTATION handlers representing API proxies ---

  // Daily Calls
  const handleAddCall = async (callData: Partial<DailyCall>) => {
    try {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(callData)
      });
      if (res.ok) syncDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditCall = async (id: string, callData: Partial<DailyCall>) => {
    try {
      const res = await fetch(`/api/calls/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(callData)
      });
      if (res.ok) syncDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCall = async (id: string) => {
    if (!window.confirm("Confirm deletion of this historical call tracking entry?")) return;
    try {
      const res = await fetch(`/api/calls/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) syncDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  // Client Leads
  const handleAddLead = async (leadData: Partial<ClientLead>) => {
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(leadData)
      });
      if (res.ok) syncDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditLead = async (id: string, leadData: Partial<ClientLead>) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(leadData)
      });
      if (res.ok) syncDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm("Completely remove this client folder from directory registers?")) return;
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) syncDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  // Quotas / Targets
  const handleAddTarget = async (targetData: Partial<TargetType>) => {
    try {
      const res = await fetch("/api/targets", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(targetData)
      });
      if (res.ok) syncDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditTarget = async (id: string, targetData: Partial<TargetType>) => {
    try {
      const res = await fetch(`/api/targets/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(targetData)
      });
      if (res.ok) syncDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTarget = async (id: string) => {
    if (!window.confirm("Completely drop this active visual milestone model?")) return;
    try {
      const res = await fetch(`/api/targets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) syncDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  // Pitches / Script Messages
  const handleAddPitch = async (pitchData: Partial<PitchScript>) => {
    try {
      const res = await fetch("/api/pitches", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(pitchData)
      });
      if (res.ok) syncDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditPitch = async (id: string, pitchData: Partial<PitchScript>) => {
    try {
      const res = await fetch(`/api/pitches/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(pitchData)
      });
      if (res.ok) syncDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePitch = async (id: string) => {
    if (!window.confirm("Permanently purge this script from public corporate registries?")) return;
    try {
      const res = await fetch(`/api/pitches/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) syncDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  // Staff registry (Admin Users list)
  const handleAddUser = async (userData: any) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      if (res.ok) syncDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditUser = async (id: string, userData: Partial<User>) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      if (res.ok) syncDatabase();
    } catch (e) {
      console.error(e);
    }
  };


  // --- VIEW RENDERING MAP ---

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab calls={calls} leads={leads} targets={targets} teamCount={users.filter(u => u.role === "team_member" && u.isActive).length || 4} />;
      case "calls":
        return (
          <DailyTrackingTab 
            calls={calls} 
            users={users} 
            currentUser={currentUser!}
            onAddCall={handleAddCall}
            onEditCall={handleEditCall}
            onDeleteCall={handleDeleteCall}
          />
        );
      case "performance":
        return <TeamPerformanceTab users={users.length > 0 ? users : [currentUser!]} calls={calls} targets={targets} />;
      case "targets":
        return (
          <TargetManagementTab 
            targets={targets} 
            currentUser={currentUser!} 
            onAddTarget={handleAddTarget}
            onEditTarget={handleEditTarget}
            onDeleteTarget={handleDeleteTarget}
          />
        );
      case "conversions":
        return (
          <ConversionTrackerTab 
            leads={leads} 
            users={users} 
            currentUser={currentUser!} 
            onAddLead={handleAddLead}
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
          />
        );
      case "pitches":
        return (
          <PitchLibraryTab 
            pitches={pitches} 
            currentUser={currentUser!} 
            onAddPitch={handleAddPitch}
            onEditPitch={handleEditPitch}
            onDeletePitch={handleDeletePitch}
          />
        );
      case "leaderboard":
        return <LeaderboardTab users={users.length > 0 ? users : [currentUser!]} calls={calls} targets={targets} />;
      case "reports":
        return <ReportsAnalyticsTab calls={calls} users={users.length > 0 ? users : [currentUser!]} currentUser={currentUser!} />;
      case "audit":
        return currentUser?.role === "admin" ? <AuditLogsTab logs={auditLogs} /> : null;
      case "personnel":
        return currentUser?.role === "admin" ? <AdminUsersTab users={users} currentUser={currentUser} onAddUser={handleAddUser} onEditUser={handleEditUser} /> : null;
      default:
        return <div className="text-sm">Tab {activeTab} is not implemented.</div>;
    }
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  // Theme application class
  const appThemeClass = theme === "dark" ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800";

  return (
    <div className={`min-h-screen ${appThemeClass} flex flex-col font-sans transition-colors duration-200`}>
      
      {/* If loading full page boot or REST validations */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-100">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
          <p className="text-sm font-semibold tracking-wide font-sans">Connecting to Sales Performance database...</p>
          <p className="text-xs text-slate-500 mt-2">Checking secure credential records</p>
        </div>
      ) : !currentUser ? (
        
        // --- SECURE AUTHORIZATION GATEWAY SCREEN ---
        <div className="flex-1 flex flex-col items-center justify-center p-5 relative bg-slate-950">
          
          {/* Cosmic visual ambient glow */}
          <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-indigo-500/10 blur-3xl rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 h-72 w-72 bg-pink-500/10 blur-3xl rounded-full" />

          <div className="max-w-md w-full relative z-10 transition duration-150">
            
            {/* Header logo */}
            <div className="text-center mb-8">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center mx-auto text-white shadow-lg shadow-indigo-650/40">
                <Target className="h-6 w-6 animate-pulse" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white mt-4 font-sans uppercase">SalesCorp Executives</h1>
              <p className="text-xs text-slate-450 mt-1 font-sans">Team Performance & Performance Targets Console</p>
            </div>

            {/* Form card */}
            <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-5">
              <h2 className="text-sm font-bold text-slate-200 tracking-wider uppercase text-center flex items-center justify-center space-x-2">
                <Lock className="h-3.5 w-3.5" />
                <span>Protected Access Gateway</span>
              </h2>

              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-455 text-xs rounded-lg flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                  <span className="text-rose-400 font-sans">{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Registered Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-510" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. admin@salescorp.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-indigo-550 text-white pl-10 p-2.5 rounded-lg focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Access Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-indigo-550 text-white p-2.5 rounded-lg focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs tracking-wider uppercase shadow-md shadow-indigo-650/40 hover:-translate-y-0.5 transition duration-150"
                >
                  Verify Access Pass
                </button>
              </form>

              {/* Demo Account Showcase Toggle Panel */}
              <div className="pt-4 border-t border-slate-800/80">
                <p className="text-[10px] text-slate-450 uppercase font-bold text-center tracking-wider mb-2.5">
                  Demonstration Workspace Shortcuts
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => loginAsDemo("admin@salescorp.com", "admin123")}
                    className="p-2 bg-indigo-950/40 hover:bg-indigo-950 border border-indigo-900/30 rounded-lg text-left transition"
                  >
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Executive Admin</p>
                    <p className="text-[9px] text-slate-500 font-sans mt-0.5">Manager, set target, edit data</p>
                  </button>

                  <button
                    onClick={() => loginAsDemo("sarah@salescorp.com", "sarah123")}
                    className="p-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg text-left transition"
                  >
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider text-slate-200">Sarah Jenkins</p>
                    <p className="text-[9px] text-slate-500 font-sans mt-0.5">Team member privacy, view, copy</p>
                  </button>
                </div>
              </div>

            </div>

            <p className="text-center text-[10px] text-slate-550 mt-6 font-sans">
              Unauthorized access to system targets database is strictly audits audited.
            </p>
          </div>
        </div>
      ) : (
        
        // --- MAIN FULL STACK SALES DASHBOARD SCREEN ---
        <div className="flex-1 flex flex-col md:flex-row">
          
          {/* Vertical Navigation Side Rails */}
          <aside className="w-full md:w-64 bg-slate-950 text-slate-200 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-850/60 shrink-0">
            <div>
              {/* Header block with Logo */}
              <div className="p-5 border-b border-slate-850/60 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="h-8.5 w-8.5 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-md">
                    SLC
                  </div>
                  <div>
                    <h2 className="text-xs font-bold tracking-wider text-white uppercase">SalesCorp Live</h2>
                    <span className="text-[9px] text-indigo-400 font-sans -mt-1 block">Unified Performance portal</span>
                  </div>
                </div>

                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="System Live connected" />
              </div>

              {/* Active Identity Block */}
              <div className="p-4 bg-slate-900/40 border-b border-slate-850/40">
                <div className="flex items-center space-x-2.5">
                  <div className="h-7 w-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="truncate max-w-[150px]">
                    <p className="text-xs font-bold text-slate-200">{currentUser.name}</p>
                    <p className="text-[9px] text-slate-500 font-sans font-medium uppercase mt-0.5 flex items-center space-x-1">
                      <span>{currentUser.role === "admin" ? "🛡️ Administrator" : "Sales Representative"}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation lists */}
              <nav className="p-3 space-y-1 font-sans text-xs">
                
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 py-2">General Analytics</p>

                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition ${
                    activeTab === "overview" 
                      ? "bg-indigo-650 text-white" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Overview Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab("leaderboard")}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition ${
                    activeTab === "leaderboard" 
                      ? "bg-indigo-650 text-white" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Trophy className="h-4 w-4" />
                  <span>Leaderboard Ranking</span>
                </button>

                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 py-2 pt-3">Operational Workflow</p>

                <button
                  onClick={() => setActiveTab("calls")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition ${
                    activeTab === "calls" 
                      ? "bg-indigo-650 text-white" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <ClipboardList className="h-4 w-4" />
                    <span>Daily Call Logs</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("conversions")}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition ${
                    activeTab === "conversions" 
                      ? "bg-indigo-650 text-white" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Lead Acquisitions</span>
                </button>

                <button
                  onClick={() => setActiveTab("targets")}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition ${
                    activeTab === "targets" 
                      ? "bg-indigo-650 text-white" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Target className="h-4 w-4" />
                  <span>Quotas & Targets</span>
                </button>

                <button
                  onClick={() => setActiveTab("pitches")}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition ${
                    activeTab === "pitches" 
                      ? "bg-indigo-650 text-white" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Pitch Script Library</span>
                </button>

                <button
                  onClick={() => setActiveTab("reports")}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition ${
                    activeTab === "reports" 
                      ? "bg-indigo-650 text-white" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <FilePieChart className="h-4 w-4" />
                  <span>Reports Console</span>
                </button>

                {/* Admin Role Specific Tab Actions */}
                {currentUser.role === "admin" && (
                  <>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 py-2 pt-3">Administration</p>

                    <button
                      onClick={() => setActiveTab("personnel")}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition ${
                        activeTab === "personnel" 
                          ? "bg-indigo-650 text-white" 
                          : "text-slate-400 hover:text-white hover:bg-slate-900"
                      }`}
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Personnel Registry</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("audit")}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold transition ${
                        activeTab === "audit" 
                          ? "bg-indigo-650 text-white" 
                          : "text-slate-400 hover:text-white hover:bg-slate-900"
                      }`}
                    >
                      <History className="h-4 w-4" />
                      <span>Security Audit Logs</span>
                    </button>
                  </>
                )}

              </nav>
            </div>

            {/* Logout & configuration indicators */}
            <div className="p-4 border-t border-slate-850/50 space-y-2.5 font-sans">
              {/* Quick Admin instructions */}
              <div className="text-[9px] text-slate-500 p-2 border border-slate-850/60 rounded-lg dark:bg-slate-900/10 italic leading-relaxed">
                {currentUser.role === "admin" 
                  ? "Logged as Admin: Full permissions are enabled to log and manage records." 
                  : "Logged as Representative. Mutation records and corporate Excel/CSV exports are restricted."
                }
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-md transition"
                  title="Toggle Light/Dark Workspace"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-1.5 hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 rounded-lg text-xs font-semibold transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Exit Session</span>
                </button>
              </div>
            </div>

          </aside>

          {/* Core Content canvas */}
          <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
            
            {/* Horizontal Header bar */}
            <header className="h-16 border-b border-slate-100 dark:border-slate-805/65 px-6 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
              
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-bold text-slate-850 dark:text-white tracking-wide uppercase">
                  {activeTab === "overview" && "Executive Overview Dashboard"}
                  {activeTab === "calls" && "Daily Dialer Performance Logs"}
                  {activeTab === "leaderboard" && "Gamified Trophy Leaderboard"}
                  {activeTab === "conversions" && "Acquisition Opportunity Tracker"}
                  {activeTab === "targets" && "Targets milestones"}
                  {activeTab === "pitches" && "Corporate Script & pitch database"}
                  {activeTab === "reports" && "Analytic PDF/CSV Reports"}
                  {activeTab === "personnel" && "Personnel access dashboard"}
                  {activeTab === "audit" && "Security Trail database"}
                </h1>
              </div>

              {/* Top Right Notifications and Alert Center */}
              <div className="flex items-center space-x-4 relative">
                
                <div className="relative">
                  <button
                    onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
                    className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-505 hover:text-slate-750 dark:hover:text-white rounded-lg relative transition"
                    title="System Notifications Center"
                  >
                    <Bell className="h-4 w-4" />
                    {getUnreadNotificationsCount() > 0 && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </button>

                  {/* Dropdown Box for dynamic notifications calculated real-time */}
                  {showNotificationsMenu && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-808 rounded-xl shadow-lg shadow-black/10 z-40 p-4 space-y-3 mr-1 animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center justify-between border-b border-slate-55 dark:border-slate-808 pb-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Executive Alert Center</h4>
                        <span className="text-[10px] font-mono text-indigo-500 font-bold">{notifications.length} alerts calculated</span>
                      </div>

                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id}
                              className="p-2 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-808 rounded-lg space-y-1 font-sans text-xs"
                            >
                              <div className="flex items-center space-x-1.5 justify-between">
                                <span className={`h-2 w-2 rounded-full ${
                                  notif.type === "success" 
                                    ? "bg-emerald-500" 
                                    : notif.type === "alert" 
                                      ? "bg-rose-500"
                                      : "bg-amber-500"
                                }`} />
                                <span className="font-bold text-slate-900 dark:text-slate-100">{notif.title}</span>
                              </div>
                              <p className="text-[10.5px] text-slate-405 leading-relaxed">{notif.message}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 text-center py-4">No active pipeline warnings reported.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile short widget info */}
                <div className="flex items-center space-x-2 border-l border-slate-100 dark:border-slate-800 pl-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{currentUser.name}</p>
                    <p className="text-[9px] text-indigo-550 font-semibold uppercase">{currentUser.role}</p>
                  </div>
                </div>

              </div>
            </header>

            {/* Dynamic tabs mount */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-7xl mx-auto space-y-6">
                {renderActiveTabContent()}
              </div>
            </div>

          </main>
        </div>
      )}

    </div>
  );
}
