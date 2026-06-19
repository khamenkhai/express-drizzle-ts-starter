import { z } from "zod";

export const getAllProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
  }),
  params: z.object({
    id: z.coerce.number({
      invalid_type_error: "ID must be a valid number",
    }),
  }),
});

export const getProductByIdSchema = z.object({
  params: z.object({
    id: z.coerce.number({
      invalid_type_error: "ID must be a valid number",
    }),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];
