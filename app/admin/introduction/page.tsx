import React from "react";
import EditableField from "@/components/admin/EditableField";
import { UploadCloud } from "lucide-react";

export default function IntroductionAdminPage() {
  return (
    <div className="max-w-4xl mx-auto py-4">
      <h2 className="text-3xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-ice-50 to-ice-300 tracking-tight">
        Introduction Setup
      </h2>
      
      <div className="p-10 rounded-[2rem] bg-ink-0/40 border border-ink-3/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-ice-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <EditableField
            label="Name"
            initialValue="Sanskar Singh"
          />

          <EditableField
            label="Professional Title"
            initialValue="Full Stack Developer | Web Applications & Systems"
            maxLength={100}
          />

          <EditableField
            label="Introduction"
            initialValue="I build full-stack systems, AI-powered applications, and reliable web products from architecture to deployment."
            multiline={true}
            maxLength={200}
          />

          <div className="flex flex-col mb-4 w-full">
            <div className="flex justify-between items-end mb-3 px-1">
              <label className="text-xs font-bold uppercase tracking-widest text-ice-400">Resume File</label>
            </div>
            
            <div className="w-full flex items-center justify-center">
              {/* We subtract 72px width to match the exact alignment in the mockup (where the right buttons take up space) */}
              <div className="w-[calc(100%-72px)] mr-auto">
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-ink-3 hover:border-ice-500/40 rounded-2xl cursor-pointer bg-ink-1/30 hover:bg-ink-1/50 transition-all duration-300 group shadow-inner">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="size-12 rounded-full bg-ice-500/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-ice-500/20 transition-all duration-300">
                      <UploadCloud className="w-6 h-6 text-ice-400 group-hover:text-ice-300 transition-colors" />
                    </div>
                    <p className="text-[15px] font-medium text-ice-300 group-hover:text-ice-100 transition-colors">
                      Upload your latest resume
                    </p>
                    <p className="text-xs text-ice-500/70 mt-1">
                      PDF up to 5MB
                    </p>
                  </div>
                  <input type="file" className="hidden" accept=".pdf" />
                </label>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
