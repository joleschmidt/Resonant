import { describe, it, expect } from 'vitest';
import { profileUpdateSchema } from '@/lib/validations/profile';

describe('profile username validation', () => {
    it('accepts valid lowercase usernames 3-20 with _ and -', () => {
        const ok = profileUpdateSchema.safeParse({ username: 'abc_123-xyz' });
        expect(ok.success).toBe(true);
        if (ok.success) expect(ok.data.username).toBe('abc_123-xyz');
    });

    it('rejects uppercase and too short/long', () => {
        expect(profileUpdateSchema.safeParse({ username: 'Abc' }).success).toBe(false);
        expect(profileUpdateSchema.safeParse({ username: 'ab' }).success).toBe(false);
        expect(profileUpdateSchema.safeParse({ username: 'a'.repeat(21) }).success).toBe(false);
    });
});


