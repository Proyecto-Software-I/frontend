import Link from "next/link";

import { Button } from "@/components/ui/button";
import { HealthCard } from "@/features/health/components/health-card";

export default function HealthPage() {
    return (
        <main className="min-h-svh bg-background px-6 py-12 text-foreground">
            <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
                <div>
                    <Button asChild variant="ghost">
                        <Link href="/">Volver a la página principal</Link>
                    </Button>
                </div>

                <HealthCard />
            </div>
        </main>
    );
}