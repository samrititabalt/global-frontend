export const normalizePlanSlug = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export const enhancePlanWithSlug = (plan) => {
  if (!plan) return null;
  const slug = plan.slug || normalizePlanSlug(plan.name || plan._id || '');
  return { ...plan, slug };
};
