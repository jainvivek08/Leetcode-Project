import React from 'react';
import {
  Camera,
  Edit3,
  MapPin,
  GraduationCap,
  Link2,
  Github,
  Linkedin,
  Twitter,
} from 'lucide-react';

function ProfileSidebar({ profile, onEditClick, onPhotoClick, onToast }) {
  const {
    name = 'Vivek Jain',
    username = 'vivekjain_dev',
    avatar = '',
    avatarInitial = 'VJ',
    rank = '24,180',
    rankPercentile = 'Top 4.2% Global',
    followers = 3,
    following = 4,
    bio = 'CS undergraduate building intuition for Data Structures, algorithmic optimization, and system design.',
    location = 'Jabalpur, Madhya Pradesh, India',
    college = 'Jabalpur Engineering College (JEC)',
    graduationDetails = 'Class of 2028 • B.Tech CSE',
    website = 'vivekjain.dev',
    socials = {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      x: 'https://x.com',
    },
    skills = {
      advanced: [
        { name: 'C++', count: 112 },
        { name: 'Arrays & Vectors', count: 98 },
        { name: 'Two Pointers', count: 45 },
      ],
      intermediate: [
        { name: 'Python 3', count: 34 },
        { name: 'Binary Trees', count: 28 },
        { name: 'Hash Table', count: 32 },
        { name: 'Stack', count: 19 },
      ],
      fundamental: [
        { name: 'Dynamic Programming', count: 14 },
        { name: 'Graphs & BFS', count: 8 },
        { name: 'SQL', count: 12 },
      ],
    },
  } = profile;

  return (
    <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
      {/* Primary User Identity Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs relative">
        {/* Avatar + Rank Pill */}
        <div className="flex items-start justify-between gap-3">
          <div
            className="relative group cursor-pointer"
            onClick={onPhotoClick}
            title="Click to update avatar"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-950 to-slate-800 text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-white ring-2 ring-slate-100 overflow-hidden group-hover:ring-blue-400 transition-all">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{avatarInitial}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center text-slate-600 hover:text-blue-600 transition">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Global Rank Pill */}
          <div className="text-right">
            <span
              className={`inline-block border text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                rank === 'Unranked'
                  ? 'bg-slate-100 border-slate-200 text-slate-500'
                  : 'bg-blue-50 border-blue-200/80 text-blue-700'
              }`}
            >
              {rank === 'Unranked' ? 'Unranked' : String(rank).startsWith('#') ? `Rank ${rank}` : `Rank #${rank}`}
            </span>
            <span className="block text-[10px] text-slate-400 font-mono mt-1 font-semibold">
              {rankPercentile}
            </span>
          </div>
        </div>

        {/* Name & Handle */}
        <div className="mt-3.5">
          <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
            {name}
          </h1>
          <p className="text-xs font-mono text-slate-500 font-semibold">@{username}</p>
        </div>

        {/* Followers / Following Metrics */}
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 mt-2.5 pb-3 border-b border-slate-100">
          <span
            onClick={() => onToast && onToast(`${followers} Developers following Vivek`, '👥')}
            className="hover:text-blue-600 cursor-pointer"
          >
            <strong className="text-slate-800 font-mono">{followers}</strong> Followers
          </span>
          <span>•</span>
          <span
            onClick={() => onToast && onToast(`Following ${following} Developers`, '👥')}
            className="hover:text-blue-600 cursor-pointer"
          >
            <strong className="text-slate-800 font-mono">{following}</strong> Following
          </span>
        </div>

        {/* Action CTA: Edit Profile Button */}
        <button
          type="button"
          onClick={onEditClick}
          className="w-full mt-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.99]"
        >
          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
          <span>Edit Profile</span>
        </button>

        {/* Bio / Summary */}
        <p className="text-xs text-slate-600 leading-relaxed mt-3.5 pt-3 border-t border-slate-100">
          {bio}
        </p>

        {/* Academic & Professional Info */}
        <div className="mt-3.5 space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>{location}</span>
          </div>
          <div className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-slate-800">{college}</span>
              <span className="block text-[10px] text-slate-400 font-mono">
                {graduationDetails}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Link2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <a
              href={`https://${website}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline truncate font-medium"
            >
              {website}
            </a>
          </div>
        </div>

        {/* Social Links Row */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          {socials.github && (
            <a
              href={socials.github}
              target="_blank"
              rel="noreferrer"
              title="GitHub"
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {socials.linkedin && (
            <a
              href={socials.linkedin}
              target="_blank"
              rel="noreferrer"
              title="LinkedIn"
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-[#0077b5] border border-slate-200/80 transition"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {socials.x && (
            <a
              href={socials.x}
              target="_blank"
              rel="noreferrer"
              title="X / Twitter"
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/80 transition"
            >
              <Twitter className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Skills & Topic Proficiencies Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Skills &amp; Topics
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            {(skills?.advanced?.length || 0) + (skills?.intermediate?.length || 0) + (skills?.fundamental?.length || 0)} tags
          </span>
        </div>

        {(!skills || (!skills.advanced?.length && !skills.intermediate?.length && !skills.fundamental?.length)) ? (
          <div className="py-4 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              No topic skills unlocked yet. Solve problems to build your topic proficiency! 🚀
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            {/* Advanced */}
            {skills.advanced?.length > 0 && (
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1.5">
                  Advanced
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.advanced.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold text-[11px] flex items-center gap-1"
                    >
                      {s.name}
                      {s.count > 0 && (
                        <span className="text-[9px] font-mono opacity-80">({s.count})</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Intermediate */}
            {skills.intermediate?.length > 0 && (
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1.5">
                  Intermediate
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.intermediate.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] flex items-center gap-1"
                    >
                      {s.name}
                      {s.count > 0 && (
                        <span className="text-[9px] font-mono opacity-70">({s.count})</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Fundamental */}
            {skills.fundamental?.length > 0 && (
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1.5">
                  Fundamental
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.fundamental.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px] flex items-center gap-1"
                    >
                      {s.name}
                      {s.count > 0 && (
                        <span className="text-[9px] font-mono opacity-70">({s.count})</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

export default ProfileSidebar;
