export const MARKETING_PLANS = [
  {
    slug: 'trial',
    name: 'Basic Trial Pack',
    label: 'BASIC TRIAL PACK',
    price: 49.99,
    hours: '5 hours / month',
    features: [],
    isPopular: false,
  },
  {
    slug: 'starter',
    name: 'Starter Pack',
    label: 'STARTER PACK',
    price: 99.99,
    hours: '20 hours / month',
    features: [],
    isPopular: false,
  },
  {
    slug: 'fulltime',
    name: 'Full Time',
    label: 'FULL TIME',
    price: 3000,
    hours: '160 hours / month',
    features: ['Weekend Support'],
    isPopular: true,
  },
  {
    slug: 'loadcash',
    name: 'Load Cash Minimum',
    label: 'LOAD CASH MINIMUM',
    price: 50,
    hours: 'Minimum load (2 hours)',
    features: [],
    isPopular: false,
  },
];

export const normalizePlanName = (name = '') =>
  name.toLowerCase().replace(/[^a-z0-9]/g, '');

export const PLAN_SLUG_TO_NAME = MARKETING_PLANS.reduce((acc, plan) => {
  acc[plan.slug] = plan.name;
  return acc;
}, {});

export const PLAN_NAME_TO_SLUG = MARKETING_PLANS.reduce((acc, plan) => {
  acc[normalizePlanName(plan.name)] = plan.slug;
  acc[normalizePlanName(plan.label)] = plan.slug;
  return acc;
}, {});

export const getMarketingPlanBySlug = (slug) =>
  MARKETING_PLANS.find((plan) => plan.slug === slug);
