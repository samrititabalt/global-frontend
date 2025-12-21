import React from 'react';
import { motion } from 'framer-motion';

const ReviewsTicker = () => {
  const reviews = [
    {
      id: 1,
      name: 'Sarah Mitchell',
      review: 'I was skeptical at first, but Ask Sam has completely transformed how I manage my business. What I thought would be complicated turned out to be incredibly simple and effective.',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    {
      id: 2,
      name: 'James Chen',
      review: 'Ask Sam handles everything from my calendar to travel bookings. It\'s like having a personal assistant who never sleeps.',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      review: 'I wasn\'t sure about outsourcing tasks, but Ask Sam proved me wrong. The quality and attention to detail exceeded all my expectations.',
      avatar: 'https://i.pravatar.cc/150?img=9',
    },
    {
      id: 4,
      name: 'Michael Thompson',
      review: 'Best investment I\'ve made for my business. Ask Sam saves me at least 10 hours every week.',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    {
      id: 5,
      name: 'Priya Patel',
      review: 'Initially hesitant, but Ask Sam has become indispensable. They handle everything from invoices to event planning flawlessly.',
      avatar: 'https://i.pravatar.cc/150?img=15',
    },
    {
      id: 6,
      name: 'David Kim',
      review: 'The team at Ask Sam is professional, responsive, and incredibly efficient. They\'ve streamlined my entire workflow.',
      avatar: 'https://i.pravatar.cc/150?img=20',
    },
    {
      id: 7,
      name: 'Lisa Anderson',
      review: 'I had doubts about virtual assistance, but Ask Sam changed my mind completely. They understand my needs perfectly.',
      avatar: 'https://i.pravatar.cc/150?img=24',
    },
    {
      id: 8,
      name: 'Robert Williams',
      review: 'Ask Sam manages my travel, shopping, and business admin. It\'s like having a superpower that handles all the details.',
      avatar: 'https://i.pravatar.cc/150?img=33',
    },
    {
      id: 9,
      name: 'Maria Garcia',
      review: 'From spreadsheets to holiday planning, Ask Sam does it all. I can\'t imagine running my business without them.',
      avatar: 'https://i.pravatar.cc/150?img=47',
    },
    {
      id: 10,
      name: 'Alex Johnson',
      review: 'I was uncertain at first, but Ask Sam has exceeded every expectation. The service quality is outstanding.',
      avatar: 'https://i.pravatar.cc/150?img=52',
    },
    {
      id: 11,
      name: 'Sophie Brown',
      review: 'Ask Sam handles customer support, finance tasks, and personal errands seamlessly. Truly a game-changer.',
      avatar: 'https://i.pravatar.cc/150?img=58',
    },
    {
      id: 12,
      name: 'Daniel Martinez',
      review: 'Initially skeptical, but Ask Sam proved to be exactly what I needed. Professional, reliable, and incredibly helpful.',
      avatar: 'https://i.pravatar.cc/150?img=63',
    },
    {
      id: 13,
      name: 'Rachel Taylor',
      review: 'Ask Sam manages everything from invoices to itineraries. The peace of mind is priceless.',
      avatar: 'https://i.pravatar.cc/150?img=68',
    },
    {
      id: 14,
      name: 'Kevin Lee',
      review: 'I wasn\'t sure about delegating tasks, but Ask Sam made it easy. Now I focus on what matters most.',
      avatar: 'https://i.pravatar.cc/150?img=70',
    },
    {
      id: 15,
      name: 'Amanda White',
      review: 'Ask Sam transformed my work-life balance. They handle the details so I can focus on growth.',
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

