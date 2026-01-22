import React from 'react';
import { motion } from 'framer-motion';

const ReviewsTicker = () => {
  const reviews = [
    {
      id: 1,
      name: 'Sarah Mitchell · Fintech',
      review: 'Ask Sam helped us hire 4 engineers in 2 weeks — faster than any agency we’ve used.',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    {
      id: 2,
      name: 'James Chen · HealthTech',
      review: 'We filled two senior clinical roles with niche experience after Ask Sam rebuilt our sourcing strategy.',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    {
      id: 3,
      name: 'Emily Rodriguez · SaaS',
      review: 'Ask Sam coordinated interviews, screened candidates, and helped us close 3 critical roles.',
      avatar: 'https://i.pravatar.cc/150?img=9',
    },
    {
      id: 4,
      name: 'Michael Thompson · E-commerce',
      review: 'We scaled our HR team with offshore support from Ask Sam and cut costs by 60%.',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    {
      id: 5,
      name: 'Priya Patel · Logistics',
      review: 'Ask Sam now handles onboarding, exit management, and payroll — it’s like a full HR team.',
      avatar: 'https://i.pravatar.cc/150?img=15',
    },
    {
      id: 6,
      name: 'David Kim · AI Startup',
      review: 'Ask Sam’s virtual HR manager helped us set up policies, contracts, and compliance in 10 days.',
      avatar: 'https://i.pravatar.cc/150?img=20',
    },
    {
      id: 7,
      name: 'Lisa Anderson · Retail',
      review: 'Ask Sam supported seasonal hiring with onshore and offshore recruiters that doubled our pipeline.',
      avatar: 'https://i.pravatar.cc/150?img=24',
    },
    {
      id: 8,
      name: 'Robert Williams · Cybersecurity',
      review: 'We reduced time-to-hire by 45% with Ask Sam’s recruiting automation and screening.',
      avatar: 'https://i.pravatar.cc/150?img=33',
    },
    {
      id: 9,
      name: 'Maria Garcia · FinServ',
      review: 'Ask Sam improved HR operations and compliance without adding internal headcount.',
      avatar: 'https://i.pravatar.cc/150?img=47',
    },
    {
      id: 10,
      name: 'Alex Johnson · SaaS',
      review: 'We filled our hardest-to-hire data roles using Ask Sam’s niche talent network.',
      avatar: 'https://i.pravatar.cc/150?img=52',
    },
    {
      id: 11,
      name: 'Sophie Brown · Manufacturing',
      review: 'Ask Sam delivered pre-vetted HR ops support that scaled with our growth.',
      avatar: 'https://i.pravatar.cc/150?img=58',
    },
    {
      id: 12,
      name: 'Daniel Martinez · CleanTech',
      review: 'We closed five roles in three weeks with Ask Sam coordinating every interview.',
      avatar: 'https://i.pravatar.cc/150?img=63',
    },
    {
      id: 13,
      name: 'Rachel Taylor · Education',
      review: 'Ask Sam gave our founders an HR partner for compliance, offers, and onboarding.',
      avatar: 'https://i.pravatar.cc/150?img=68',
    },
    {
      id: 14,
      name: 'Kevin Lee · MedTech',
      review: 'Ask Sam’s recruiters sourced rare regulatory talent we couldn’t find in-house.',
      avatar: 'https://i.pravatar.cc/150?img=70',
    },
    {
      id: 15,
      name: 'Amanda White · Hospitality',
      review: 'Ask Sam’s staff augmentation model lowered hiring costs while improving candidate quality.',
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

