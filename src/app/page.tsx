'use client';

import { Button } from '@/components/ui/button';
import { Music, Shield, Users, Search, Package } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/auth/useUser';

export default function Home() {
    const { isAuthenticated, isLoading } = useUser();

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="container flex flex-col items-center justify-center gap-6 py-24 md:py-32">
                <div className="flex max-w-[64rem] flex-col items-center gap-4 text-center">
                    <Music className="h-16 w-16" />
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                        Willkommen bei <span className="text-primary">RESONANT</span>
                    </h1>
                    <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                        Die vertrauenswürdige Plattform für Gitarren, Amps und Zubehör in Deutschland.
                        Sicher kaufen und verkaufen in der größten deutschen Gitarren-Community.
                    </p>
                    <div className="flex gap-4">
                        <Button size="lg" asChild>
                            <Link href="/listings">
                                <Search className="mr-2 h-5 w-5" />
                                Anzeigen durchsuchen
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/about">Mehr erfahren</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container py-16 md:py-24">
                <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Sicher & Vertrauenswürdig</h3>
                        <p className="text-sm text-muted-foreground">
                            Verifizierte Nutzer, sichere Zahlungen und Käuferschutz für sorgenfreie Transaktionen.
                        </p>
                    </div>

                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Music className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Guitar-Spezifisch</h3>
                        <p className="text-sm text-muted-foreground">
                            Erweiterte Suchfilter, detaillierte Specs und eine Community die sich auskennt.
                        </p>
                    </div>

                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Users className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Community</h3>
                        <p className="text-sm text-muted-foreground">
                            Tausche dich mit Gleichgesinnten aus und finde die perfekte Gitarre für dich.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {!isLoading && (
                <section className="container py-16 md:py-24">
                    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-lg border bg-muted/50 p-8 text-center md:p-12">
                        {isAuthenticated ? (
                            <>
                                <h2 className="text-3xl font-bold">Bereit zu verkaufen?</h2>
                                <p className="text-muted-foreground">
                                    Erstelle deine erste Anzeige und erreiche tausende Gitarren-Enthusiasten.
                                </p>
                                <Button size="lg" asChild>
                                    <Link href="/listings/create">
                                        <Package className="mr-2 h-5 w-5" />
                                        Anzeige erstellen
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold">Bereit loszulegen?</h2>
                                <p className="text-muted-foreground">
                                    Erstelle jetzt dein kostenloses Konto und werde Teil der RESONANT Community.
                                </p>
                                <Button size="lg">Jetzt registrieren</Button>
                            </>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}

