import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import {
  AtSign,
  Mail,
  Sparkles,
  Bell,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Check,
  Shield,
  Info,
  ExternalLink,
  Palette,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import ProfileDropdown from '../components/profile/ProfileDropdown';
import { logoutUser } from '../authSlice';
import { useTheme } from '../utils/theme';

/**
 * SettingsPage Component
 * Clean, modern settings dashboard for CodeQuest adhering to the Blueprint aesthetic
 * with Light & Dark mode theme toggling.
 *
 * Tabs:
 * 1. Change Userhandle
 * 2. User Emails
 * 3. Appearance (Light / Dark mode, editor theme)
 * 4. Personalized Ads
 * 5. Notifications
 */
function SettingsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Theme Hook (Light / Dark)
  const { theme, isDark, setTheme } = useTheme();
  const [editorTheme, setEditorTheme] = useState(
    () => localStorage.getItem('codequest_editor_theme') || 'vs-dark'
  );

  // Tab State: 'handle' | 'emails' | 'appearance' | 'ads' | 'notifications'
  const initialTab = searchParams.get('tab') || 'handle';
  const validTabs = ['handle', 'emails', 'appearance', 'ads', 'notifications'];
  const [activeTab, setActiveTab] = useState(
    validTabs.includes(initialTab) ? initialTab : 'handle'
  );

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const switchTab = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  // Tab 1: Userhandle states
  const defaultHandle = user?.emailId ? user.emailId.split('@')[0] : 'jainvivkyw1';
  const [userHandle, setUserHandle] = useState(defaultHandle);
  const [handleLimit, setHandleLimit] = useState(1);
  const [handleError, setHandleError] = useState('');
  const [isUpdatingHandle, setIsUpdatingHandle] = useState(false);

  // Tab 2: User Emails states
  const primaryEmail = user?.emailId || 'vivek.jain@example.com';
  const [backupEmailInput, setBackupEmailInput] = useState('');
  const [backupEmails, setBackupEmails] = useState([]);
  const [emailSecurityAlerts, setEmailSecurityAlerts] = useState(true);
  const [emailError, setEmailError] = useState('');

  // Tab 3: Personalized Ads & Recommendations states
  const [personalizedRecs, setPersonalizedRecs] = useState(true);
  const [anonymousTelemetry, setAnonymousTelemetry] = useState(false);

  // Tab 4: Notifications states
  const [dailyStreakReminder, setDailyStreakReminder] = useState(true);
  const [discussionReplies, setDiscussionReplies] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Toast Notification state
  const [toast, setToast] = useState({ show: false, message: '', icon: '✔' });

  const triggerToast = (message, icon = '✔') => {
    setToast({ show: true, message, icon });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  // --- Handlers ---
  const handleUserhandleUpdate = (e) => {
    e.preventDefault();

    if (handleLimit <= 0) {
      setHandleError('You have 0 updates remaining.');
      triggerToast('Update limit reached!', '⚠');
      return;
    }

    const trimmed = userHandle.trim();

    // Validation: Max 40 chars, alphanumeric only
    if (!trimmed) {
      setHandleError('Userhandle cannot be empty.');
      return;
    }
    if (trimmed.length > 40) {
      setHandleError('Userhandle must not exceed 40 characters.');
      return;
    }
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(trimmed)) {
      setHandleError('Only alphanumeric characters (letters and numbers) are allowed.');
      return;
    }

    setHandleError('');
    setIsUpdatingHandle(true);

    setTimeout(() => {
      setIsUpdatingHandle(false);
      setHandleLimit((prev) => Math.max(0, prev - 1));
      triggerToast('Userhandle updated successfully!', '✔');
    }, 600);
  };

  const handleAddBackupEmail = (e) => {
    e.preventDefault();
    const email = backupEmailInput.trim();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (email === primaryEmail || backupEmails.includes(email)) {
      setEmailError('This email is already associated with your account.');
      return;
    }

    setEmailError('');
    setBackupEmails((prev) => [...prev, email]);
    setBackupEmailInput('');
    triggerToast('Backup email added!', '✔');
  };

  const handleRemoveBackupEmail = (emailToRemove) => {
    setBackupEmails((prev) => prev.filter((em) => em !== emailToRemove));
    triggerToast('Backup email removed.', 'ℹ');
  };

  return (
    <div className="hero-grid min-h-screen flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900 text-slate-800 dark:text-slate-100">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-bold"
              title="Back to Profile"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>

            <span className="text-slate-300 dark:text-slate-700">|</span>

            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white flex items-center justify-center font-extrabold text-xs shadow-xs group-hover:scale-105 transition-transform">
                &lt;/&gt;
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                Code<span className="text-blue-600 dark:text-blue-400">Quest</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <ProfileDropdown
              user={user}
              onNavigate={(path) => navigate(path)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      {/* 2. MAIN SETTINGS CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Page Title Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage your account credentials, preferences, appearance, and developer notifications.
          </p>
        </div>

        {/* Outer Card */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Top Horizontal Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 bg-slate-50/50 dark:bg-slate-950/40 flex overflow-x-auto no-scrollbar gap-1 sm:gap-4">
            <button
              type="button"
              onClick={() => switchTab('handle')}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'handle'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <AtSign className="w-4 h-4" />
              <span>Change Userhandle</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('emails')}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'emails'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>User Emails</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('appearance')}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'appearance'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Appearance</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('ads')}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'ads'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Personalized Ads</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('notifications')}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'notifications'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>
          </div>

          {/* TAB CONTENTS */}
          <div className="p-6 sm:p-10">
            {/* ============================================================ */}
            {/* TAB 1: CHANGE USERHANDLE                                    */}
            {/* ============================================================ */}
            {activeTab === 'handle' && (
              <div className="max-w-xl mx-auto space-y-6">
                {/* 1. Limit Warning Banner (Orange text exactly matching reference) */}
                <div className="text-center sm:text-left">
                  <p className="text-[#f97316] font-semibold text-sm sm:text-base">
                    Userhandle update limit remaining: {handleLimit}
                  </p>
                </div>

                {/* 2. Form Section */}
                <form onSubmit={handleUserhandleUpdate} className="space-y-2">
                  <label
                    htmlFor="userhandle-input"
                    className="block italic text-xs text-slate-500 font-medium"
                  >
                    (Max 40 character, only alphanumeric allowed)
                  </label>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        id="userhandle-input"
                        type="text"
                        maxLength={40}
                        value={userHandle}
                        onChange={(e) => {
                          setUserHandle(e.target.value);
                          if (handleError) setHandleError('');
                        }}
                        disabled={handleLimit <= 0 || isUpdatingHandle}
                        placeholder="Enter userhandle"
                        className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-slate-800 font-mono focus:outline-none transition ${
                          handleError
                            ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200'
                            : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500/20'
                        } disabled:bg-slate-100 disabled:text-slate-400`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={handleLimit <= 0 || isUpdatingHandle}
                      className="px-6 py-2.5 bg-[#00875a] hover:bg-[#00704a] text-white font-bold text-sm rounded-xl transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-98"
                    >
                      {isUpdatingHandle ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          <span>Updating...</span>
                        </>
                      ) : (
                        'Update'
                      )}
                    </button>
                  </div>

                  {handleError && (
                    <p className="text-xs text-rose-600 flex items-center gap-1.5 mt-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {handleError}
                    </p>
                  )}
                </form>

                {/* 3. Caching Notice Note */}
                <div className="pt-4">
                  <p className="italic text-xs text-slate-500 leading-relaxed">
                    Note: We use caching at many places and the changes to your handle may take upto 48 hours to reflect everywhere.
                  </p>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 2: USER EMAILS                                          */}
            {/* ============================================================ */}
            {activeTab === 'emails' && (
              <div className="max-w-xl mx-auto space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Email Addresses</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Primary and backup emails used for signing in, security, and verification.
                  </p>
                </div>

                {/* Primary Email Card */}
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 font-mono">{primaryEmail}</p>
                      <p className="text-[11px] text-slate-500">Registered primary email</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Primary
                  </span>
                </div>

                {/* Backup Emails List */}
                {backupEmails.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Backup Emails</label>
                    {backupEmails.map((email) => (
                      <div
                        key={email}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <span className="font-mono text-slate-800">{email}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBackupEmail(email)}
                          className="text-rose-600 hover:text-rose-800 text-[11px] font-bold cursor-pointer hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Backup Email Form */}
                <form onSubmit={handleAddBackupEmail} className="space-y-2 pt-2 border-t border-slate-100">
                  <label htmlFor="backup-email-input" className="text-xs font-bold text-slate-700 block">
                    Add Backup Email
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="backup-email-input"
                      type="email"
                      value={backupEmailInput}
                      onChange={(e) => {
                        setBackupEmailInput(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      placeholder="backup.email@example.com"
                      className="flex-1 bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500/20 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none transition"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-2xs"
                    >
                      Add
                    </button>
                  </div>
                  {emailError && (
                    <p className="text-xs text-rose-600 flex items-center gap-1.5 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {emailError}
                    </p>
                  )}
                </form>

                {/* Security Alert Toggle */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <label htmlFor="security-alerts-toggle" className="text-xs font-bold text-slate-800 block cursor-pointer">
                      Security &amp; Recovery Alerts
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Receive critical login notifications and security alerts on your backup email.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      id="security-alerts-toggle"
                      type="checkbox"
                      checked={emailSecurityAlerts}
                      onChange={(e) => {
                        setEmailSecurityAlerts(e.target.checked);
                        triggerToast('Email alert preferences saved!');
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 3: PERSONALIZED ADS & RECOMMENDATIONS                    */}
            {/* ============================================================ */}
            {activeTab === 'ads' && (
              <div className="max-w-xl mx-auto space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Personalized Learning &amp; Privacy</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize your recommendations and telemetry preferences on CodeQuest.
                  </p>
                </div>

                <div className="p-4 bg-blue-50/50 border border-blue-200/80 rounded-2xl flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800 block font-bold mb-0.5">Privacy First</strong>
                    CodeQuest never sells your data to third-party ad networks. All suggestions are purely tailored to help your problem-solving roadmap and interview preparation.
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Toggle 1: Learning recommendations */}
                  <div className="flex items-center justify-between gap-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Personalized Recommendations
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Allow personalized learning recommendations &amp; developer tool suggestions based on your solved problem tags.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={personalizedRecs}
                        onChange={(e) => {
                          setPersonalizedRecs(e.target.checked);
                          triggerToast('Recommendation preference updated!');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Toggle 2: Anonymous IDE telemetry */}
                  <div className="flex items-center justify-between gap-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Anonymous IDE Telemetry
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Share anonymized IDE compiler latency and crash logs to help improve CodeQuest execution speed.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={anonymousTelemetry}
                        onChange={(e) => {
                          setAnonymousTelemetry(e.target.checked);
                          triggerToast('Telemetry preference updated!');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 4: NOTIFICATIONS                                        */}
            {/* ============================================================ */}
            {activeTab === 'notifications' && (
              <div className="max-w-xl mx-auto space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Notification Preferences</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose what updates you want to receive about your DSA practice and discussions.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {/* Notification 1: Daily streak */}
                  <div className="flex items-center justify-between gap-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Daily Streak &amp; Practice Reminders
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Get an email reminder before your daily streak expires.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={dailyStreakReminder}
                        onChange={(e) => {
                          setDailyStreakReminder(e.target.checked);
                          triggerToast('Streak notification updated!');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Notification 2: Discussion replies */}
                  <div className="flex items-center justify-between gap-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Discussion Replies &amp; Mentor Feedback
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Notify you when someone answers your problem solution query or provides code feedback.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={discussionReplies}
                        onChange={(e) => {
                          setDiscussionReplies(e.target.checked);
                          triggerToast('Discussion alert preference updated!');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Notification 3: Weekly progress */}
                  <div className="flex items-center justify-between gap-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Weekly DSA Progress Digest
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        A weekly summary of problems solved, topics mastered, and current platform rank.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={weeklyDigest}
                        onChange={(e) => {
                          setWeeklyDigest(e.target.checked);
                          triggerToast('Weekly digest preference updated!');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 3: APPEARANCE & THEMES (LIGHT / DARK / SYSTEM)           */}
            {/* ============================================================ */}
            {activeTab === 'appearance' && (
              <div className="max-w-2xl mx-auto space-y-8">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    Platform Theme &amp; Display
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Customize the interface appearance across CodeQuest. Switch between Light Blueprint and Dark Slate themes.
                  </p>
                </div>

                {/* Theme Selector Cards */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Select Theme
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Card 1: Light Blueprint */}
                    <button
                      type="button"
                      onClick={() => {
                        setTheme('light');
                        triggerToast('Light Blueprint Theme active!', '☀️');
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between group ${
                        !isDark && theme === 'light'
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/30 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Mini Visual Preview */}
                        <div className="w-full h-20 rounded-xl bg-[#fbfcff] border border-slate-200 p-2.5 flex flex-col justify-between overflow-hidden shadow-2xs mb-3 group-hover:scale-[1.02] transition-transform">
                          <div className="flex items-center justify-between">
                            <div className="w-3.5 h-3.5 rounded-md bg-[#ea580c] flex items-center justify-center text-[7px] text-white font-mono font-bold">&lt;&gt;</div>
                            <div className="w-12 h-2 rounded bg-slate-200"></div>
                          </div>
                          <div className="space-y-1">
                            <div className="w-20 h-2 bg-blue-600 rounded"></div>
                            <div className="w-14 h-1.5 bg-slate-200 rounded"></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Sun className={`w-4 h-4 ${!isDark && theme === 'light' ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            Light Blueprint
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Clean white architectural grid for daylight problem solving.
                        </p>
                      </div>

                      {!isDark && theme === 'light' && (
                        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active Theme</span>
                        </div>
                      )}
                    </button>

                    {/* Card 2: Dark Slate */}
                    <button
                      type="button"
                      onClick={() => {
                        setTheme('dark');
                        triggerToast('Dark Slate Theme active!', '🌙');
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between group ${
                        isDark && theme === 'dark'
                          ? 'border-blue-500 bg-blue-950/30 ring-2 ring-blue-500/30 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Mini Visual Preview */}
                        <div className="w-full h-20 rounded-xl bg-[#0b0f19] border border-slate-700 p-2.5 flex flex-col justify-between overflow-hidden shadow-2xs mb-3 group-hover:scale-[1.02] transition-transform">
                          <div className="flex items-center justify-between">
                            <div className="w-3.5 h-3.5 rounded-md bg-[#ea580c] flex items-center justify-center text-[7px] text-white font-mono font-bold">&lt;&gt;</div>
                            <div className="w-12 h-2 rounded bg-slate-700"></div>
                          </div>
                          <div className="space-y-1">
                            <div className="w-20 h-2 bg-blue-500 rounded"></div>
                            <div className="w-14 h-1.5 bg-slate-700 rounded"></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Moon className={`w-4 h-4 ${isDark && theme === 'dark' ? 'text-blue-400' : 'text-slate-400'}`} />
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            Dark Slate
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Deep night dark mode designed to reduce eye strain.
                        </p>
                      </div>

                      {isDark && theme === 'dark' && (
                        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-blue-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active Theme</span>
                        </div>
                      )}
                    </button>

                    {/* Card 3: System Match */}
                    <button
                      type="button"
                      onClick={() => {
                        setTheme('system');
                        triggerToast('System Theme Synchronized!', '💻');
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between group ${
                        theme === 'system'
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/30 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Mini Visual Preview */}
                        <div className="w-full h-20 rounded-xl bg-gradient-to-r from-[#fbfcff] to-[#0b0f19] border border-slate-200 dark:border-slate-700 p-2.5 flex items-center justify-center shadow-2xs mb-3 group-hover:scale-[1.02] transition-transform">
                          <Laptop className="w-8 h-8 text-slate-400" />
                        </div>

                        <div className="flex items-center gap-2">
                          <Laptop className={`w-4 h-4 ${theme === 'system' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            System Default
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Automatically match your device's daylight or dark mode.
                        </p>
                      </div>

                      {theme === 'system' && (
                        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active Theme</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Code Editor Theme Option */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Code Editor (Monaco IDE) Theme
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Preferred syntax color palette inside the problem coding arena.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'vs-dark', label: 'VS Code Dark+' },
                      { id: 'vs-light', label: 'VS Code Light' },
                      { id: 'hc-black', label: 'High Contrast' },
                    ].map((ed) => (
                      <button
                        key={ed.id}
                        type="button"
                        onClick={() => {
                          setEditorTheme(ed.id);
                          localStorage.setItem('codequest_editor_theme', ed.id);
                          triggerToast(`Editor theme set to ${ed.label}`);
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5 ${
                          editorTheme === ed.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {editorTheme === ed.id && <Check className="w-3.5 h-3.5" />}
                        <span>{ed.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live UI Preview Card */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Live UI Preview
                  </span>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100">
                          Solution.cpp
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        {isDark ? 'Dark Slate Active' : 'Light Blueprint Active'}
                      </span>
                    </div>
                    <pre className="font-mono text-xs text-slate-700 dark:text-slate-300 pt-3 leading-relaxed overflow-x-auto">
                      <code>
                        <span className="text-blue-600 dark:text-blue-400">int</span> <span className="text-amber-600 dark:text-amber-300">maxSubArray</span>(vector&lt;<span className="text-blue-600 dark:text-blue-400">int</span>&gt;&amp; nums) &#123;{'\n'}
                        {'    '}<span className="text-slate-400 dark:text-slate-500 italic">// Kadane\'s Algorithm (O(N) Time)</span>{'\n'}
                        {'    '}<span className="text-blue-600 dark:text-blue-400">int</span> currMax = nums[0], maxSoFar = nums[0];{'\n'}
                        {'    '}<span className="text-purple-600 dark:text-purple-400">for</span> (<span className="text-blue-600 dark:text-blue-400">int</span> i = 1; i &lt; nums.size(); i++) &#123;{'\n'}
                        {'        '}currMax = max(nums[i], currMax + nums[i]);{'\n'}
                        {'        '}maxSoFar = max(maxSoFar, currMax);{'\n'}
                        {'    '}&#125;{'\n'}
                        {'    '}<span className="text-rose-600 dark:text-rose-400">return</span> maxSoFar;{'\n'}
                        &#125;
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 3. TOAST NOTIFICATION */}
      <div
        className={`fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center space-x-2.5 transform transition-all duration-300 border border-slate-700 ${
          toast.show
            ? 'translate-y-0 opacity-100'
            : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <span className="text-emerald-400 font-bold">{toast.icon}</span>
        <span className="font-semibold">{toast.message}</span>
      </div>
    </div>
  );
}

export default SettingsPage;
