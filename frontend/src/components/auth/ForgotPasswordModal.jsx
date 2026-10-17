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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-zinc-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 text-sm font-bold cursor-pointer"
        >
          ✕
        </button>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg mb-3 border border-amber-500/20">
          🔑
        </div>
        <h3 className="text-base font-bold text-zinc-100">Reset your password</h3>
        <p className="text-xs text-zinc-400 mt-1">
          Enter your registered email to receive recovery instructions.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@codequest.com"
            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3 py-2 text-xs transition"
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-bold text-zinc-950 bg-amber-500 hover:bg-amber-600 rounded-lg shadow-xs transition cursor-pointer"
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
