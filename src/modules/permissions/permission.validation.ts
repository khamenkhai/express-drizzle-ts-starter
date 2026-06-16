import { z } from "zod";

export const createPermissionSchema = z.object({
  body: z.object({
    permissionName: z.string().min(2, "Permission name must be at least 2 characters"),
    description: z.string().optional(),
  }),
});

export const updatePermissionSchema = z.object({
  body: z.object({
    permissionName: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid permission ID format"),
  }),
});

export const getPermissionByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid permission ID format"),
  }),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>["body"];
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>["body"];
