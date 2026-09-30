import React, { useState } from 'react';

function ForgotPasswordModal({ isOpen, onClose, onSubmit }) {
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email);
    setEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
        >
          ✕
        </button>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center text-lg mb-3 border border-blue-100">
          🔑
        </div>
        <h3 className="text-base font-bold text-slate-900">Reset your password</h3>
        <p className="text-xs text-slate-500 mt-1">
          Enter your registered email to receive recovery instructions.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@codequest.com"
            className="custom-input w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#2563eb] hover:bg-blue-700 rounded-lg shadow-xs transition cursor-pointer"
            >
              Send link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
