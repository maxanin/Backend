import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

type Parts = { body?: ZodSchema<any>; query?: ZodSchema<any>; params?: ZodSchema<any> };

export function validate(parts: Parts) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (parts.body) req.body = parts.body.parse(req.body);
      if (parts.query) req.query = parts.query.parse(req.query) as any;
      if (parts.params) req.params = parts.params.parse(req.params) as any;
      next();
    } catch (e: any) {
      return res.status(400).json({ message: "Validation failed", errors: e?.errors ?? e?.message });
    }
  };
}
