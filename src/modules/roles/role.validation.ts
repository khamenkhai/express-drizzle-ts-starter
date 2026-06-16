import { z } from "zod";

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Role name must be at least 2 characters"),
    permissionIds: z.array(z.string().uuid()).optional(),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    permissionIds: z.array(z.string().uuid()).optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid role ID format"),
  }),
});

export const getRoleByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid role ID format"),
  }),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>["body"];
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>["body"];
