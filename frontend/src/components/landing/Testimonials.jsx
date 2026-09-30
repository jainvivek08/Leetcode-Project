import React from 'react';

function Testimonials() {
  const testimonials = [
    {
      quote:
        'CodeQuest transformed my thinking. It improved my problem-solving, introduced new algorithms, and taught me to optimize. The discussions and editorials broadened my approach, enhancing both coding and logical thinking.',
      name: 'Ishu Rajora',
      role: 'IET Lucknow',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
    },
    {
      quote:
        'CodeQuest has influenced my programming experience by improving problem solving, coding efficiency, and algorithmic thinking. It has served as both a mentor and practice ground, preparing me for real-world software development.',
      name: 'Satyam Kumar',
      role: 'BMS Institute of Tech, Bangalore',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
    },
    {
      quote:
        'CodeQuest turned my early coding struggles into strengths. Its structured problem sets, clean editorials, and community sharpened my skills, boosted my confidence, and made programming fun.',
      name: 'Ritik Kumar Sahoo',
      role: 'C.V. Raman Global University',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
    },
    {
      quote:
        'I got very good in problem solving as well as DSA and it helped me prepare for tech screenings. The in-browser compiler and instant AI suggestions kept me consistent and motivated every day.',
      name: 'Devyansh Singh',
      role: 'Videonetics',
      avatar:
        'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <section
      id="testimonials"
      className="py-20 lg:py-28 bg-gradient-to-b from-white via-[#f3f7ff] to-white border-t border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Laurel Wreaths */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Testimonials
          </span>
          <div className="mt-4 flex items-center justify-center gap-4">
            <svg
              className="w-8 h-12 text-slate-400/80 -scale-x-100"
              viewBox="0 0 40 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M20 55 C12 45, 8 30, 20 10 M14 42 C6 38, 4 28, 12 20 M18 30 C12 25, 10 16, 18 12 M20 20 C18 15, 18 10, 24 5"
                strokeLinecap="round"
              />
            </svg>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              What Our Students And
              <br />
              Experts Say About Us
            </h2>
            <svg
              className="w-8 h-12 text-slate-400/80"
              viewBox="0 0 40 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M20 55 C12 45, 8 30, 20 10 M14 42 C6 38, 4 28, 12 20 M18 30 C12 25, 10 16, 18 12 M20 20 C18 15, 18 10, 24 5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition"
            >
              <div className="text-blue-600 text-3xl font-serif leading-none mb-3">&ldquo;</div>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">{item.quote}</p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border border-blue-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                  <p className="text-[11px] text-slate-500">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
