import { MessageThread } from '@/components/features/messaging/MessageThread';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MessageThreadPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-4">
                    <Link href="/messages">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Zurück zu Nachrichten
                        </Button>
                    </Link>
                </div>
                <div className="border rounded-lg h-[600px]">
                    <MessageThread conversationId={id} />
                </div>
            </div>
        </div>
    );
}

