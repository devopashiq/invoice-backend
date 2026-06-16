import { z } from 'zod';

export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Primary color must be a valid hex code'),
  secondaryColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Secondary color must be a valid hex code'),
  logoUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  companyName: z.string().min(1, 'Company name is required'),
  companyAddress: z.string().min(1, 'Company address is required'),
  companyPhone: z.string().min(1, 'Company phone is required'),
  companyEmail: z.string().email('Invalid company email address'),
  customCss: z.string().optional().nullable(),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export type CreateTemplateDTO = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateDTO = z.infer<typeof updateTemplateSchema>;
