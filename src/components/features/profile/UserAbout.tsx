/**
 * UserAbout
 * Truncated bio with read-more
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';

type Props = { bio: string | null | undefined };

export function UserAbout({ bio }: Props) {
    const [expanded, setExpanded] = useState(false);
    if (!bio) return null;
    const MAX = 220;
    const needsClamp = bio.length > MAX;
    const text = !needsClamp || expanded ? bio : bio.slice(0, MAX) + '…';
    return (
        <Card className="p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
                {text}
                {needsClamp && !expanded && (
                    <button className="ml-2 text-xs font-medium underline" onClick={() => setExpanded(true)}>mehr</button>
                )}
            </p>
        </Card>
    );
}


