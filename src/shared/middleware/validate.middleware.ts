import { type Request, type Response, type NextFunction } from "express";
import { type AnyZodObject, ZodError } from "zod";

import { ValidationError } from "../types/error";

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body as unknown,
        query: req.query as unknown,
        params: req.params as unknown,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(error);
      } else {
        next(new ValidationError("Validation failed"));
      }
    }
  };
};
