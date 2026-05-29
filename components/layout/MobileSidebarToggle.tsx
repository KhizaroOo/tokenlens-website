"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AppSidebar } from "./AppSidebar";

export function MobileSidebarToggle() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center justify-center h-8 w-8 rounded-md text-slate-500 hover:text-slate-200 hover:bg-[#1e2a3b] transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-4.5 w-4.5" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <div className="relative h-full">
              <button
                onClick={() => setOpen(false)}
                className="absolute right-3 top-4 z-10 rounded-md p-1 text-slate-500 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
              <AppSidebar />
            </div>
          </div>
        </>
      )}
    </>
  );
}
