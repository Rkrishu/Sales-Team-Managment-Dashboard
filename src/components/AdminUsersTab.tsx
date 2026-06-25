/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Mail, 
  Lock, 
  AlertTriangle, 
  Search,
  CheckCircle2,
  XCircle,
  Plus
} from "lucide-react";
import { User, UserRole } from "../types";

interface AdminUsersTabProps {
  users: User[];
  currentUser: User;
  onAddUser: (userData: any) => void;
  onEditUser: (id: string, userData: Partial<User>) => void;
}

export default function AdminUsersTab({ users, currentUser, onAddUser, onEditUser }: AdminUsersTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Create Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("team_member");
  const [formError, setFormError] = useState("");

  const handleOpenForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("team_member");
    setFormError("");
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError("All inputs must be populated.");
      return;
    }

    if (password.length < 5) {
      setFormError("Password must encompass at least 5 character elements.");
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role
    };

    onAddUser(payload);
    setIsFormOpen(false);
  };

  const handleToggleActive = (user: User) => {
    if (user.id === currentUser.id) return;
    onEditUser(user.id, { isActive: !user.isActive });
  };

  const handleRoleChange = (user: User, newRole: UserRole) => {
    if (user.id === currentUser.id) return;
    onEditUser(user.id, { role: newRole });
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 font-sans">Role Based Personnel Controls</h2>
          <p className="text-xs text-slate-405 mt-0.5 font-sans">Create and register corporate profiles, assign operational roles, and deploy active suspensions</p>
        </div>

        <button
          onClick={handleOpenForm}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Plus className="h-4 w-4" />
          <span>Provision New Profile</span>
        </button>
      </div>

      {/* Creation Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-100">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Provision User Profile</h3>
            <p className="text-xs text-slate-400 mt-1">Configures secure hashed credentials for internal login access</p>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/15 border border-rose-150 dark:border-rose-900/20 text-rose-600 dark:text-rose-450 text-xs rounded-lg flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 font-sans text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Human Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. David Kim"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Email Endpoint</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. david@salescorp.com"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Secure Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 5 characters"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">System Role Access</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg"
                >
                  <option value="team_member">Team Member Quota Owner</option>
                  <option value="admin">Executive Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-750 bg-transparent rounded-lg border border-slate-200 dark:border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-605 bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Deploy User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-405 dark:text-slate-510" />
        <input
          type="text"
          placeholder="Filter personnel by keyword patterns, email, names, role levels..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full text-xs font-sans pl-10 bg-white dark:bg-slate-900 text-slate-805 dark:text-slate-100 p-2.5 rounded-lg border border-slate-202 dark:border-slate-800 focus:outline-hidden focus:border-indigo-500"
        />
      </div>

      {/* Listings details */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-808 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-105 dark:border-slate-800 text-[10px] font-semibold text-slate-405 uppercase tracking-wider">
                <th className="p-4">Personnel Profile</th>
                <th className="p-4">Operational Role</th>
                <th className="p-4">Direct User Id</th>
                <th className="p-4">Account Access State</th>
                <th className="p-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/25 dark:hover:bg-slate-95%/10 transition font-sans">
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-950/45 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-[10px] text-slate-400 flex items-center space-x-0.5 mt-0.5">
                            <Mail className="h-2.5 w-2.5 mr-1" />
                            <span>{user.email}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Operational Role Selectors */}
                    <td className="p-4 whitespace-nowrap align-middle">
                      <select
                        value={user.role}
                        disabled={user.id === currentUser.id}
                        onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                        className={`text-[11px] font-semibold p-1 border rounded-md focus:outline-hidden transition-all ${
                          user.id === currentUser.id
                            ? "bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-80"
                            : "bg-transparent text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                        title={user.id === currentUser.id ? "An administrator cannot change their own admin role." : undefined}
                      >
                        <option value="team_member">Team Member</option>
                        <option value="admin">Administrator</option>
                      </select>
                      {user.id === currentUser.id && (
                        <span className="ml-2 text-[10px] text-slate-400 font-normal italic">
                          (Logged In / Self)
                        </span>
                      )}
                    </td>

                    <td className="p-4 whitespace-nowrap font-mono text-[11.5px] text-slate-400">{user.id}</td>

                    <td className="p-4 whitespace-nowrap font-semibold">
                      {user.isActive ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Active System Pass</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          <XCircle className="h-3 w-3" />
                          <span>Suspended Access</span>
                        </span>
                      )}
                    </td>

                    {/* Suspended Toggles */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(user)}
                        disabled={user.id === currentUser.id}
                        className={`inline-flex items-center space-x-1 px-4 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          user.id === currentUser.id
                            ? "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-60"
                            : user.isActive
                              ? "bg-rose-50/50 hover:bg-rose-100/50 text-rose-600 border-rose-200 dark:bg-transparent dark:border-rose-900/40"
                              : "bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-600 border-emerald-200 dark:bg-transparent dark:border-emerald-900/40"
                        }`}
                        title={user.id === currentUser.id ? "An administrator cannot suspend their own active credentials." : undefined}
                      >
                        <span>{user.isActive ? "Suspend Access" : "Restore Access"}</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                    No corporate personnel profiles matched your criteria.
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
