/**
 * Transactions Validation Schemas
 */

import { z } from 'zod';

export const createTransactionSchema = z.object({
    listingId: z.string().uuid(),
    amount: z.number().positive('Betrag muss positiv sein'),
});

export const completeTransactionSchema = z.object({
    transactionId: z.string().uuid(),
});

export const createRatingSchema = z.object({
    transactionId: z.string().uuid(),
    ratedUserId: z.string().uuid(),
    score: z.number().int().min(1).max(5),
    comment: z.string().max(500).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type CompleteTransactionInput = z.infer<typeof completeTransactionSchema>;
export type CreateRatingInput = z.infer<typeof createRatingSchema>;

