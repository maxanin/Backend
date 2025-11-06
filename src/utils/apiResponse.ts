export type ApiListResponse<T> = { items: T[]; page: number; limit: number; total: number };
export type ApiOk = { ok: true } & Record<string, unknown>;

export function ok(extra: Record<string, unknown> = {}): ApiOk {
  return { ok: true, ...extra };
}
