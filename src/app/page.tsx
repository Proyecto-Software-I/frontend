import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const featureCards = [
    {
        number: "01",
        title: "Interfaz consistente",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
    },
    {
        number: "02",
        title: "Componentes reutilizables",
        description:
            "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
    },
    {
        number: "03",
        title: "Base preparada",
        description:
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    },
];

export default function Home() {
    return (
        <main className="min-h-svh bg-background text-foreground">
            <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center px-6 py-16 lg:px-8">
                <section className="max-w-3xl">
                    <Badge variant="secondary">Proyecto Software I</Badge>

                    <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                        Una base visual para construir el proyecto.
                    </h1>

                    <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
                        vitae justo eget magna fermentum iaculis. Esta página es
                        provisional y será reemplazada cuando se defina el alcance de la
                        aplicación.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button asChild size="lg">
                            <Link href="/health">Comprobar backend</Link>
                        </Button>

                        <Button asChild size="lg" variant="outline">
                            <a href="#muestra">Ver componentes</a>
                        </Button>
                    </div>
                </section>

                <Separator className="my-12" />

                <section
                    id="muestra"
                    aria-labelledby="sample-title"
                    className="scroll-mt-8"
                >
                    <div className="max-w-2xl">
                        <Badge variant="outline">Interfaz provisional</Badge>

                        <h2
                            id="sample-title"
                            className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl"
                        >
                            Componentes sobre una misma convención
                        </h2>

                        <p className="mt-3 text-muted-foreground">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. El
                            contenido actual solamente demuestra la base visual compartida.
                        </p>
                    </div>

                    <div className="mt-8 grid gap-5 md:grid-cols-3">
                        {featureCards.map((feature) => (
                            <Card key={feature.number}>
                                <CardHeader>
                                    <Badge
                                        variant="secondary"
                                        className="w-fit"
                                    >
                                        {feature.number}
                                    </Badge>

                                    <CardTitle className="mt-3">
                                        {feature.title}
                                    </CardTitle>

                                    <CardDescription>
                                        Elemento provisional de la landing page.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}