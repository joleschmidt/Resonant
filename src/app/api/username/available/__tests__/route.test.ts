import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as server from '@/lib/supabase/server';
import { GET } from '../route';

vi.mock('@/lib/supabase/server');

function makeReq(u: string) {
    return new Request(`https://example.com/api/username/available?u=${encodeURIComponent(u)}`);
}

describe('GET /api/username/available', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('returns invalid for bad pattern', async () => {
        const res = await GET(makeReq('A'));
        const json = await res.json();
        expect(json).toEqual({ available: false, reason: 'invalid' });
    });

    it('reports available when none found', async () => {
        (server as any).createClient = vi.fn(async () => ({
            from: () => ({ select: () => ({ ilike: () => ({ limit: () => ({ data: [], error: null }) }) }) })
        }));
        const res = await GET(makeReq('good_name'));
        const json = await res.json();
        expect(json).toEqual({ available: true });
    });
});


