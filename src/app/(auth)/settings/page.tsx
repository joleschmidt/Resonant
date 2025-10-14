/**
 * Settings Page
 * User account settings
 */

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    return (
        <div className="container py-12">
            <div className="mx-auto max-w-4xl space-y-6">
                <h1 className="text-3xl font-bold">Einstellungen</h1>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account</CardTitle>
                            <CardDescription>Verwalte deine Account-Einstellungen</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">E-Mail</label>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sicherheit</CardTitle>
                            <CardDescription>Passwort und Sicherheitseinstellungen</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Passwort-Änderung wird in Kürze verfügbar sein.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Präferenzen</CardTitle>
                            <CardDescription>Deine Suchpräferenzen und Favoriten</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Präferenz-Einstellungen werden in Kürze verfügbar sein.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

