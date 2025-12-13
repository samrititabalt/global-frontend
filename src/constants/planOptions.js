export const MARKETING_PLANS = [
  {
    slug: 'trial',
    label: 'BASIC TRIAL PACK',
    name: 'Basic Trial Pack',
    description: 'Perfect for trying out our services with minimal commitment.',
    price: 49.99,
    hours: '5 hours / month',
    features: [
      'Limited hours ideal for testing',
      'Includes standard support',
      'Cancel anytime',
    ],
    highlight: 'Great for quick pilots and proof of concepts.',
    isPopular: false,
  },
  {
    slug: 'starter',
    label: 'STARTER PACK',
    name: 'Starter Pack',
    description: 'Best for teams that are ready to scale with confidence.',
    price: 99.99,
    hours: '20 hours / month',
    features: [
      'Dedicated account specialist',
      'Faster response times',
      'Weekly reporting',
    ],
    highlight: 'Reliable capacity for growing operations.',
    isPopular: false,
  },
  {
    slug: 'fulltime',
    label: 'FULL TIME',
    name: 'Full Time',
    description: 'Premium capacity with weekend coverage and premium SLAs.',
    price: 3000,
    hours: '160 hours / month',
    features: [
      'Weekend support included',
      'Premium success manager',
      'Custom workflows and QA',
    ],
    highlight: 'Complete coverage for mission-critical workloads.',
    isPopular: true,
  },
  {
    slug: 'loadcash',
    label: 'LOAD CASH MINIMUM',
    name: 'Load Cash Minimum',
    description: 'Flexible minimum load with on-demand access.',
    price: 50,
    hours: 'Minimum load (2 hours)',
    features: [
      'Use balance anytime',
      'Perfect for ad-hoc tasks',
      'No expiration for unused hours',
    ],
    highlight: 'Pay-as-you-go flexibility.',
    isPopular: false,
  },
];

export const normalizePlanName = (name = '') =>
  name.toLowerCase().replace(/[^a-z0-9]/g, '');
