import React from 'react';
import { motion } from 'framer-motion';

const ReviewsTicker = () => {
  const reviews = [
    {
      id: 1,
      name: 'Sarah Mitchell · Retail',
      review: 'Ask Sam delivered a full category deep dive with competitor pricing in under three weeks.',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    {
      id: 2,
      name: 'James Chen · HealthTech',
      review: 'The MR 360 team ran phone interviews and turned transcripts into clear insights fast.',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    {
      id: 3,
      name: 'Emily Rodriguez · SaaS',
      review: 'Ask Sam’s researchers tracked competitor moves and delivered quarterly intelligence updates.',
      avatar: 'https://i.pravatar.cc/150?img=9',
    },
    {
      id: 4,
      name: 'Michael Thompson · CPG',
      review: 'We launched a new product with confidence after consumer and shopper research.',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    {
      id: 5,
      name: 'Priya Patel · Logistics',
      review: 'Ask Sam handled panels, surveys, and analysis end-to-end for our market entry study.',
      avatar: 'https://i.pravatar.cc/150?img=15',
    },
    {
      id: 6,
      name: 'David Kim · Fintech',
      review: 'Fast desk research plus analyst support turned a complex brief into a board-ready report.',
      avatar: 'https://i.pravatar.cc/150?img=20',
    },
    {
      id: 7,
      name: 'Lisa Anderson · Beauty',
      review: 'Mystery shopping and retail audits uncovered key gaps in our in-store experience.',
      avatar: 'https://i.pravatar.cc/150?img=24',
    },
    {
      id: 8,
      name: 'Robert Williams · Cybersecurity',
      review: 'Competitor benchmarking and category insights helped sharpen our positioning.',
      avatar: 'https://i.pravatar.cc/150?img=33',
    },
    {
      id: 9,
      name: 'Maria Garcia · FinServ',
      review: 'Ask Sam combined survey data with trend analysis to create a clean executive summary.',
      avatar: 'https://i.pravatar.cc/150?img=47',
    },
    {
      id: 10,
      name: 'Alex Johnson · SaaS',
      review: 'We now get quarterly reports with category shifts and competitive changes.',
      avatar: 'https://i.pravatar.cc/150?img=52',
    },
    {
      id: 11,
      name: 'Sophie Brown · Manufacturing',
      review: 'Ask Sam handled fieldwork logistics and gave us a reliable dataset for decisions.',
      avatar: 'https://i.pravatar.cc/150?img=58',
    },
    {
      id: 12,
      name: 'Daniel Martinez · CleanTech',
      review: 'The team delivered rapid insight briefs for investor updates and board reviews.',
      avatar: 'https://i.pravatar.cc/150?img=63',
    },
    {
      id: 13,
      name: 'Rachel Taylor · Education',
      review: 'Consumer sentiment tracking helped us refine product messaging in weeks.',
      avatar: 'https://i.pravatar.cc/150?img=68',
    },
    {
      id: 14,
      name: 'Kevin Lee · MedTech',
      review: 'Ask Sam’s researcher kept our market intelligence current with live updates.',
      avatar: 'https://i.pravatar.cc/150?img=70',
    },
    {
      id: 15,
      name: 'Amanda White · Hospitality',
      review: 'From surveys to SWOTs, Ask Sam delivered the full market research stack.',
      avatar: 'https://i.pravatar.cc/150?img=65',
    },
  ];

  // Duplicate reviews for seamless loop
  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <div className="relative w-full bg-gradient-to-r from-gray-50 via-white to-gray-50 border-t border-gray-200 py-6 overflow-hidden">
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent z-20 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent z-20 pointer-events-none"></div>
      
      <div className="flex items-center gap-6 whitespace-nowrap" style={{
        animation: 'scroll 120s linear infinite',
        width: 'fit-content'
      }}>
        {duplicatedReviews.map((review, index) => (
          <motion.div
            key={`${review.id}-${index}`}
            className="flex items-center gap-4 flex-shrink-0 px-5 py-2.5 bg-white rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 mx-2"
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <img
              src={review.avatar}
              alt={review.name}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-blue-100 flex-shrink-0"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=3b82f6&color=fff&size=128`;
              }}
            />
            <div className="flex flex-col min-w-0">
              <div className="font-semibold text-gray-900 text-xs md:text-sm whitespace-nowrap">
                {review.name}
              </div>
              <div className="text-xs text-gray-600 max-w-xs md:max-w-md truncate">
                "{review.review}"
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 768px) {
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        }
      `}</style>
    </div>
  );
};

export default ReviewsTicker;

