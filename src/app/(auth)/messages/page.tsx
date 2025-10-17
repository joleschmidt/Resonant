import { ConversationList } from '@/components/features/messaging/ConversationList';

export const dynamic = 'force-dynamic';

export default function MessagesPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Nachrichten</h1>
                <ConversationList />
            </div>
        </div>
    );
}

