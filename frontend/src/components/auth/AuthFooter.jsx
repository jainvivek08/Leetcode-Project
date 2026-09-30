import React from 'react';

function AuthFooter() {
  return (
    <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white/50 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between flex-wrap gap-2">
        <span className="text-[11px]">&copy; 2026 CodeQuest Inc. All rights reserved.</span>
        <div className="flex items-center space-x-4 text-[11px]">
          <a href="#" className="hover:text-slate-700 transition">Terms</a>
          <a href="#" className="hover:text-slate-700 transition">Privacy</a>
          <a href="#" className="hover:text-slate-700 transition">Security</a>
        </div>
      </div>
    </footer>
  );
}

export default AuthFooter;
