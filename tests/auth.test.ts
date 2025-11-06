import request from 'supertest';

// ماک کردن سرویس سپیدار و مدل User برای جلوگیری از وابستگی I/O
jest.mock('../src/services/sepidarService', () => ({
  default: class SepidarService {
    async login(_tenantId: string, _integrationId: number, _u: string, _p: string) {
      return { Token: 'sepidar-jwt', UserID: 1, Title: 'Test User' };
    }
  }
}));

jest.mock('../src/models/User', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ _id: 'u1', role: 'customer', save: jest.fn() }),
    findById: jest.fn().mockResolvedValue({ _id: 'u1', role: 'customer', save: jest.fn() })
  }
}));

describe('Auth - /api/auth/login', () => {
  it('should login via sepidar and return app token', async () => {
    const { default: app } = await import('../src/app');
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'a', password: 'b', tenantId: 't1', integrationId: 1234 });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user).toMatchObject({ username: 'a' });
  });
});


