// Extend Express Request type to include auth property
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        tenantId: string;
        integrationId: number;
      };
    }
  }
}

export {};
