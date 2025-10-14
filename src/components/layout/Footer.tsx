/**
 * Footer Component
 * Site footer with links
 */

import Link from 'next/link';
import { Music } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              <span className="font-bold">RESONANT</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Die vertrauenswürdige Plattform für Gitarren, Amps und Zubehör in Deutschland.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Marketplace</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/listings" className="hover:text-foreground">
                  Alle Anzeigen
                </Link>
              </li>
              <li>
                <Link href="/listings/create" className="hover:text-foreground">
                  Anzeige erstellen
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-foreground">
                  So funktioniert&apos;s
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Unternehmen</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  Über uns
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-foreground">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Rechtliches</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  AGB
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/imprint" className="hover:text-foreground">
                  Impressum
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} RESONANT. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
}

