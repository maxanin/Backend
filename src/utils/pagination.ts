export function getPagination(query: any, defaults = { page: 1, limit: 20 }, max = 100) {
  const p = Math.max(parseInt(String(query.page ?? defaults.page)), 1);
  const l = Math.min(Math.max(parseInt(String(query.limit ?? defaults.limit)), 1), max);
  return { page: p, limit: l, skip: (p - 1) * l };
}
