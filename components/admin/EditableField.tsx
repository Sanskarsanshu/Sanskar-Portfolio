"use client";

import React, { useState } from "react";
import { Check, X, Pencil, Lock, Unlock } from "lucide-react";

interface EditableFieldProps {
  label: string;
  initialValue: string;
  multiline?: boolean;
  maxLength?: number;
  onSave?: (value: string) => void;
}

export default function EditableField({
  label,
  initialValue,
  multiline = false,
  maxLength,
  onSave,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  const handleSave = () => {
    setIsEditing(false);
    if (onSave) onSave(value);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValue(initialValue);
  };

  return (
    <div className="flex flex-col mb-8 w-full group/field">
      <div className="flex justify-between items-end mb-3 px-1">
        <label className="text-xs font-bold uppercase tracking-widest text-ice-400">
          {label}
        </label>
        {maxLength && (
          <span className={`text-xs font-medium transition-colors ${
            value.length >= maxLength ? "text-red-400" : "text-ice-500/50"
          }`}>
            {value.length} / {maxLength}
          </span>
        )}
      </div>

      <div className="flex gap-4 items-start">
        <div className="relative flex-1 group/input">
          {multiline ? (
            <textarea
              value={value}
              onChange={(e) => {
                if (maxLength && e.target.value.length > maxLength) return;
                setValue(e.target.value);
              }}
              disabled={!isEditing}
              className={`w-full rounded-2xl p-5 text-[15px] leading-relaxed text-ice-50 placeholder:text-ice-500/40 focus:outline-none transition-all duration-300 resize-none min-h-[120px] shadow-sm
                ${isEditing 
                  ? "bg-ink-1/80 border-ice-500/50 ring-2 ring-ice-500/20" 
                  : "bg-ink-1/30 border-ink-3/40 group-hover/field:border-ice-500/20 group-hover/field:bg-ink-1/40"}
                border
              `}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => {
                if (maxLength && e.target.value.length > maxLength) return;
                setValue(e.target.value);
              }}
              disabled={!isEditing}
              className={`w-full rounded-2xl px-5 py-4 text-[15px] font-medium text-ice-50 placeholder:text-ice-500/40 focus:outline-none transition-all duration-300 shadow-sm
                ${isEditing 
                  ? "bg-ink-1/80 border-ice-500/50 ring-2 ring-ice-500/20" 
                  : "bg-ink-1/30 border-ink-3/40 group-hover/field:border-ice-500/20 group-hover/field:bg-ink-1/40"}
                border
              `}
            />
          )}

          {/* Lock Icon */}
          <div className={`absolute right-5 top-1/2 -translate-y-1/2 transition-all duration-300 ${
            multiline ? "top-8" : ""
          } ${isEditing ? "opacity-0 scale-75" : "opacity-100 scale-100 text-ice-500/40 group-hover/field:text-ice-400"}`}>
            <Lock size={16} />
          </div>
        </div>

        <div className="flex gap-2 h-14 items-center">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="size-11 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500 hover:text-white hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                title="Save"
              >
                <Check size={20} />
              </button>
              <button
                onClick={handleCancel}
                className="size-11 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all cursor-pointer"
                title="Cancel"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 h-11 rounded-full bg-ice-500/5 text-ice-300 border border-ice-500/10 hover:bg-ice-500/15 hover:text-ice-100 hover:border-ice-500/30 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300 cursor-pointer"
            >
              <Pencil size={15} className="text-emerald-400" />
              <span className="text-sm font-semibold tracking-wide">Edit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
