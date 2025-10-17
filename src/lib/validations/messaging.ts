/**
 * Messaging Validation Schemas
 */

import { z } from 'zod';

export const sendMessageSchema = z.object({
    conversationId: z.string().uuid().optional(),
    recipientId: z.string().uuid().optional(),
    listingId: z.string().uuid().optional(),
    content: z.string().min(1, 'Nachricht darf nicht leer sein').max(2000, 'Nachricht zu lang'),
});

export const markMessageReadSchema = z.object({
    messageId: z.string().uuid(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type MarkMessageReadInput = z.infer<typeof markMessageReadSchema>;

