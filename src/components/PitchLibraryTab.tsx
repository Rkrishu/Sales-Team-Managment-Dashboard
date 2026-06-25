/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Star, 
  BookOpen, 
  Hash, 
  Briefcase, 
  AlertTriangle,
  FolderOpen,
  Edit2
} from "lucide-react";
import { PitchScript, User } from "../types";

interface PitchLibraryTabProps {
  pitches: PitchScript[];
  currentUser: User;
  onAddPitch: (pitchData: Partial<PitchScript>) => void;
  onEditPitch: (id: string, pitchData: Partial<PitchScript>) => void;
  onDeletePitch: (id: string) => void;
}

const CATEGORIES = [
  "All",
  "Sales Pitch",
  "WhatsApp Template",
  "Call Script",
  "Email Template",
  "Objection Handling"
];

export default function PitchLibraryTab({
  pitches,
  currentUser,
  onAddPitch,
  onEditPitch,
  onDeletePitch
}: PitchLibraryTabProps) {
  const isAdmin = currentUser.role === "admin";
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Success copy feedback map
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<PitchScript["category"]>("Sales Pitch");
  const [content, setContent] = useState("");
  const [productLine, setProductLine] = useState("");

  const handleCopy = (pitch: PitchScript) => {
    navigator.clipboard.writeText(pitch.content);
    setCopiedId(pitch.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleOpenCreateForm = () => {
    setEditId(null);
    setTitle("");
    setCategory("Sales Pitch");
    setContent("");
    setProductLine("");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (pitch: PitchScript) => {
    setEditId(pitch.id);
    setTitle(pitch.title);
    setCategory(pitch.category);
    setContent(pitch.content);
    setProductLine(pitch.productLine || "");
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const payload = {
      title: title.trim(),
      category,
      content: content.trim(),
      productLine: productLine.trim() || "General"
    };

    if (editId) {
      onEditPitch(editId, payload);
    } else {
      onAddPitch(payload);
    }
    setIsFormOpen(false);
  };

  const handleToggleFavorite = (pitch: PitchScript) => {
    onEditPitch(pitch.id, { isFavorite: !pitch.isFavorite });
  };

  const filteredPitches = pitches.filter(pitch => {
    const matchesSearch = 
      pitch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pitch.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pitch.productLine && pitch.productLine.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = activeCategory === "All" || pitch.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case "Sales Pitch": return "text-indigo-600 bg-indigo-50 border-indigo-150 dark:text-indigo-400 dark:bg-indigo-950/20 dark:border-indigo-900/30";
      case "WhatsApp Template": return "text-emerald-600 bg-emerald-50 border-emerald-150 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/30";
      case "Call Script": return "text-amber-600 bg-amber-50 border-amber-150 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/30";
      case "Email Template": return "text-purple-600 bg-purple-50 border-purple-150 dark:text-purple-400 dark:bg-purple-950/20 dark:border-purple-900/30";
      case "Objection Handling": return "text-pink-600 bg-pink-50 border-pink-150 dark:text-pink-400 dark:bg-pink-950/20 dark:border-pink-900/10";
      default: return "text-slate-600 bg-slate-50 border-slate-150 dark:text-slate-400 dark:bg-slate-900 dark:border-slate-800";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 font-sans">Corporate Message & Pitch Script Library</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAdmin 
              ? "Publish, revise, or organize communication scripts, response prompts, and email templates" 
              : "Access proven organizational scripts, promotional messages, and objection guidelines directly"
            }
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreateForm}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Script Document</span>
          </button>
        )}
      </div>

      {/* Category Horizontal Filter Swiper */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
              activeCategory === cat
                ? "bg-indigo-650 text-white border-indigo-600 dark:bg-indigo-500"
                : "bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 border-slate-200 dark:border-slate-805"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search inputs */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-405 dark:text-slate-505" />
        <input
          type="text"
          placeholder="Search script headers, content blocks, or product segment terms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs font-sans pl-10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-indigo-500"
        />
      </div>

      {/* Script configuration drawer */}
      {isFormOpen && isAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl max-w-lg w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-100">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {editId ? "Edit Pitch Script Document" : "Draft New Script Document"}
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Script Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Price Consolidation Script"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Service / Line Tag</label>
                  <input
                    type="text"
                    value={productLine}
                    onChange={(e) => setProductLine(e.target.value)}
                    placeholder="e.g. Enterprise Cloud"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Library Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PitchScript["category"])}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                >
                  {CATEGORIES.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Document Content Body</label>
                <textarea
                  required
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Draft copy, objection steps, instructions, email greeting structures here..."
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
                  {editId ? "Update Library" : "Publish Script"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid rendering pitch cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPitches.length > 0 ? (
          filteredPitches.map((pitch) => {
            const isFavorite = pitch.isFavorite;
            const isCopySuccessful = copiedId === pitch.id;

            return (
              <div 
                key={pitch.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-805 p-5 rounded-xl flex flex-col justify-between shadow-xs hover:shadow-sm transition"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex self-start px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeClass(pitch.category)}`}>
                        {pitch.category}
                      </span>
                      {pitch.productLine && (
                        <p className="text-[10px] font-sans font-medium text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                          <span>Segment:</span>
                          <span className="text-slate-800 dark:text-slate-300 font-semibold">{pitch.productLine}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {/* Active Toggle Choice both Admin and Team can toggle favoriting locally as preferences? */}
                      {/* Wait, "Only Admin can add, edit, or delete. Team members can only view & copy" */}
                      {/* So we can let admin toggle star in DB, but team member toggle star from their preference? We can let both toggle DB isFavorite since it is harmless and fun */}
                      <button
                        onClick={() => handleToggleFavorite(pitch)}
                        className={`p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition ${
                          isFavorite ? "text-amber-500" : "text-slate-350 hover:text-amber-500"
                        }`}
                        title="Star Script Favorite"
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </button>
                    </div>
                  </div>

                  {/* Title and details */}
                  <h4 className="font-semibold text-slate-850 dark:text-slate-100 text-sm mt-3 font-sans">{pitch.title}</h4>
                  
                  {/* Script Text blocks */}
                  <div className="mt-3.5 p-3.5 bg-slate-50 dark:bg-slate-950 text-xs font-sans text-slate-700 dark:text-slate-300 rounded-lg border border-slate-100 dark:border-slate-805 leading-relaxed whitespace-pre-wrap select-all max-h-48 overflow-y-auto">
                    {pitch.content}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/60">
                  <div className="text-[10px] text-slate-400">
                    <span>Published by: <b>{pitch.createdBy}</b></span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenEditForm(pitch)}
                          className="mr-1 inline-flex items-center justify-center p-1.5 text-slate-405 hover:text-indigo-600 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 border border-slate-150 dark:border-slate-805 rounded-lg transition"
                          title="Edit Script Details"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeletePitch(pitch.id)}
                          className="mr-2 inline-flex items-center justify-center p-1.5 text-slate-405 hover:text-rose-600 bg-slate-50 dark:bg-slate-950 hover:bg-rose-50 border border-slate-150 dark:border-slate-805 rounded-lg transition"
                          title="Delete Script Document"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleCopy(pitch)}
                      className={`inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        isCopySuccessful
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                          : "bg-indigo-50 hover:bg-indigo-100 text-indigo-650 border-indigo-200 dark:bg-slate-950 dark:text-indigo-400 dark:border-slate-800"
                      }`}
                    >
                      {isCopySuccessful ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{isCopySuccessful ? "Copied!" : "Copy Clipboard"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
            <BookOpen className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-705 mb-2" />
            <p className="text-sm font-medium">No matching communication scripts identified.</p>
            <p className="text-xs">Adjust your search inputs or add a script template.</p>
          </div>
        )}
      </div>

    </div>
  );
}
