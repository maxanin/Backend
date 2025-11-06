import request from 'supertest';

// ماک JWT و مدل‌ها
jest.mock('../src/middlewares/auth', () => ({
  auth: (_req: any, _res: any, next: any) => { (_req as any).auth = { tenantId: 't1', integrationId: 1234, userId: 'u1' }; next(); }
}));

jest.mock('../src/middlewares/deviceLimit', () => ({
  deviceLimit: (_req: any, _res: any, next: any) => next()
}));

jest.mock('../src/models/Item', () => ({
  __esModule: true,
  default: {
    find: jest.fn().mockReturnValue({ skip: () => ({ limit: () => ({ lean: () => Promise.resolve([]) }) }) }),
    countDocuments: jest.fn().mockResolvedValue(0)
  }
}));

describe('Items - /api/items', () => {
  it('should list items from cache', async () => {
    const { default: app } = await import('../src/app');
    const res = await request(app).get('/api/items')
      .set('Authorization', 'Bearer x')
      .set('x-device-id', 'dev1');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ items: [], page: 1, limit: 20, total: 0 });
  });
});


