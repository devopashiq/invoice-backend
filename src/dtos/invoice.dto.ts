import { z } from 'zod';

export const updateInvoiceSchema = z.object({
  passengerName: z.string().nullable().optional(),
  pnr: z.string().nullable().optional(),
  airline: z.string().nullable().optional(),
  flightNumber: z.string().nullable().optional(),
  departure: z.string().nullable().optional(),
  destination: z.string().nullable().optional(),
  travelDate: z.string().nullable().optional(),
  amount: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  templateId: z.string().nullable().optional(),
});

export type UpdateInvoiceDTO = z.infer<typeof updateInvoiceSchema>;
