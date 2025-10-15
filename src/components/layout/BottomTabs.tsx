'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, Heart, User } from 'lucide-react';

type Tab = {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
};

const TABS: Tab[] = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/listings', label: 'Anzeigen', icon: Search },
    { href: '/listings/create', label: 'Erstellen', icon: PlusCircle },
    { href: '/favorites', label: 'Favoriten', icon: Heart },
    { href: '/profile', label: 'Profil', icon: User },
];

export function BottomTabs() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
            <ul className="grid grid-cols-5 h-14 items-center w-full">
                {TABS.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || (href !== '/' && pathname.startsWith(href));
                    return (
                        <li key={href} className="h-full">
                            <Link
                                href={href}
                                className={`flex h-full flex-col items-center justify-center gap-0.5 text-xs transition-colors ${active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                aria-current={active ? 'page' : undefined}
                            >
                                <Icon className={`h-5 w-5 ${active ? '' : ''}`} />
                                <span>{label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
            {/* iOS safe-area inset */}
            <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
    );
}


