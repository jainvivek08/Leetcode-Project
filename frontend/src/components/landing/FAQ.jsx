import React, { useState } from 'react';

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0); // first open by default

  const faqItems = [
    {
      id: 'faq1',
      question: 'How do I get started with CodeQuest?',
      answer:
        "Simply click 'Sign Up' to create your account, choose your primary programming language (C++, Python, Java, or JavaScript), and begin practicing our curated beginner-friendly problem sets!",
    },
    {
      id: 'faq2',
      question: "What's the difference between free and premium courses?",
      answer:
        'All core problem sets, the in-browser compiler, and community discussions are 100% free. Premium tracks include unlimited AI Mentor hints and guided full-stack portfolio projects.',
    },
    {
      id: 'faq3',
      question: 'How do I track my progress on CodeQuest?',
      answer:
        'Your profile dashboard automatically logs your problem-solving streak, completed topics (Arrays, Trees, DP, Graphs), submission runtimes, and skill badges.',
    },
    {
      id: 'faq4',
      question: 'What does the AI Mentor do?',
      answer:
        'Our AI Mentor pinpoints why your code fails edge cases, explains time complexity bottlenecks, and gives algorithmic hints without spoiling the final answer.',
    },
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="py-20 lg:py-24 bg-white border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.id}
                className="bg-[#f4f8fe] border border-blue-100 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left flex items-center justify-between font-semibold text-slate-800 text-sm sm:text-base hover:text-blue-600 transition cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`text-blue-600 font-bold inline-block transition-transform duration-200 ${
                        isOpen ? 'rotate-0' : '-rotate-90'
                      }`}
                    >
                      ▾
                    </span>
                    {item.question}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-blue-50/50 pt-2">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
