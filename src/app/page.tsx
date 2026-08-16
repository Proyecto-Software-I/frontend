import Link from "next/link";
import type { ReactNode } from "react";
import {
    Boxes,
    BrainCircuit,
    Building2,
    CheckCircle2,
    Code2,
    Database,
    FileSearch,
    GitBranch,
    Layers3,
    LockKeyhole,
    Network,
    Route,
    ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface IconItem {
    title: string;
    description: string;
    icon: LucideIcon;
}

const navItems = [
    { label: "Producto", href: "#producto" },
    { label: "Cómo funciona", href: "#como-funciona" },
    { label: "Tecnologías", href: "#tecnologias" },
    { label: "Seguridad", href: "#seguridad" },
    { label: "Precios", href: "#precios" },
];

const workflowSteps = [
    {
        step: "DISCOVER",
        title: "Descubrir el sistema",
        description:
            "Tecnologías, estructura, dependencias, componentes e inventario técnico para partir de evidencia.",
        icon: FileSearch,
    },
    {
        step: "UNDERSTAND",
        title: "Construir conocimiento",
        description:
            "Arquitectura, relaciones, procesos, reglas de negocio y dependencias entre componentes.",
        icon: Network,
    },
    {
        step: "PLAN",
        title: "Planificar por riesgo",
        description:
            "Estrategia, prioridades, riesgos, migration waves y roadmap antes de ejecutar cambios.",
        icon: Route,
    },
    {
        step: "MODERNIZE",
        title: "Modernizar progresivamente",
        description:
            "Transformaciones graduales con estrategias y Migration Packs adecuados al contexto.",
        icon: GitBranch,
    },
    {
        step: "VERIFY",
        title: "Verificar comportamiento",
        description:
            "Pruebas, comparación y evidencia para conservar el comportamiento esperado.",
        icon: CheckCircle2,
    },
];

const problemPoints: IconItem[] = [
    {
        title: "Documentación incompleta",
        description: "La información crítica suele estar desactualizada o dispersa.",
        icon: FileSearch,
    },
    {
        title: "Arquitectura opaca",
        description: "Comprender dependencias y límites del sistema toma demasiado tiempo.",
        icon: Network,
    },
    {
        title: "Dependencias antiguas",
        description: "Stacks obsoletos bloquean cambios seguros y progresivos.",
        icon: Layers3,
    },
    {
        title: "Reglas ocultas",
        description: "El comportamiento de negocio vive dentro de caminos de código frágiles.",
        icon: Code2,
    },
    {
        title: "Riesgo operativo alto",
        description: "Cada cambio puede afectar sistemas críticos difíciles de validar.",
        icon: ShieldCheck,
    },
    {
        title: "Conocimiento concentrado",
        description: "La modernización depende de pocas personas y mucha memoria tribal.",
        icon: BrainCircuit,
    },
];

const capabilities: IconItem[] = [
    {
        title: "Legacy Discovery",
        description:
            "Inventario técnico y descubrimiento automatizado para entender qué existe antes de decidir qué cambiar.",
        icon: FileSearch,
    },
    {
        title: "System Knowledge",
        description:
            "Representación de arquitectura, dependencias y conocimiento operativo del sistema.",
        icon: Network,
    },
    {
        title: "Technical Debt Assessment",
        description:
            "Identificación de deuda técnica, riesgos y oportunidades de modernización.",
        icon: Layers3,
    },
    {
        title: "Modernization Planning",
        description:
            "Estrategias, prioridades y planes progresivos para reducir el riesgo de migración.",
        icon: Route,
    },
    {
        title: "AI-Assisted Modernization",
        description:
            "IA como apoyo para analizar, comprender y transformar software, no como una conversión ciega de código.",
        icon: BrainCircuit,
    },
    {
        title: "Behavior Verification",
        description:
            "Validación del sistema modernizado contra el comportamiento esperado mediante evidencia y comparación.",
        icon: CheckCircle2,
    },
];

const strategies = [
    "Keep",
    "Stabilize",
    "Encapsulate",
    "Rehost",
    "Replatform",
    "Refactor",
    "Rearchitect",
    "Rewrite",
    "Replace",
    "Retire",
];

const technologies = [
    "COBOL",
    "Java",
    ".NET",
    "Node.js",
    "JavaScript / TypeScript",
];

const securityPoints: IconItem[] = [
    {
        title: "Organización aislada",
        description: "Separación entre organizaciones y entornos de trabajo.",
        icon: Building2,
    },
    {
        title: "Código protegido",
        description: "Procesamiento privado orientado a sistemas con código fuente sensible.",
        icon: LockKeyhole,
    },
    {
        title: "Modelos privados",
        description: "Posibilidad de usar modelos locales o privados según el escenario.",
        icon: BrainCircuit,
    },
    {
        title: "Despliegues controlados",
        description: "Posibilidad futura de entornos controlados u on-premise.",
        icon: Database,
    },
];

const targetCustomers = [
    "Banca",
    "Seguros",
    "Gobierno",
    "Telecomunicaciones",
    "Industria",
    "Retail / Logística",
    "Consultoras y System Integrators",
    "Empresas con aplicaciones legacy",
];

const plans = [
    {
        name: "Developer",
        description:
            "Para explorar inventario, conocimiento del sistema y planificación inicial de modernización.",
    },
    {
        name: "Team",
        description:
            "Para equipos que necesitan coordinar análisis, prioridades y evidencias de modernización.",
    },
    {
        name: "Enterprise",
        description:
            "Para organizaciones con código sensible, necesidades de aislamiento y escenarios controlados.",
    },
];

const darkPanel =
    "border-background/10 bg-background/5 text-background ring-background/10";
const darkPanelSoft = "border-background/10 bg-background/3 text-background";
const darkMuted = "text-background/68";
const darkIcon =
    "flex size-9 shrink-0 items-center justify-center rounded-lg border border-background/10 bg-background/8 text-background";
const focusRing = "focus-visible:ring-3 focus-visible:ring-background/30";

function SectionIntro({
    id,
    eyebrow,
    title,
    description,
}: Readonly<{
    id: string;
    eyebrow: string;
    title: string;
    description: string;
}>) {
    return (
        <div className="mx-auto max-w-3xl text-center">
            <TechnicalBadge>{eyebrow}</TechnicalBadge>

            <h2
                id={id}
                className="mt-5 font-mono text-3xl font-semibold tracking-tight text-background sm:text-4xl lg:text-5xl"
            >
                {title}
            </h2>

            <p className={`mt-4 text-base leading-7 sm:text-lg ${darkMuted}`}>
                {description}
            </p>
        </div>
    );
}

function TechnicalBadge({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <Badge
            variant="outline"
            className="h-6 border-background/15 bg-background/5 px-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-background"
        >
            {children}
        </Badge>
    );
}

function TechnicalLabel({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-background/58">
            {children}
        </p>
    );
}

function IconFrame({ icon: Icon }: Readonly<{ icon: LucideIcon }>) {
    return (
        <span className={darkIcon}>
            <Icon className="size-4" aria-hidden="true" />
        </span>
    );
}

function PrimaryButton({
    href,
    children,
    className = "",
}: Readonly<{
    href: string;
    children: ReactNode;
    className?: string;
}>) {
    return (
        <Button
            asChild
            size="lg"
            className={`bg-background text-foreground hover:bg-background/90 ${focusRing} ${className}`}
        >
            <Link href={href}>{children}</Link>
        </Button>
    );
}

function SecondaryAnchor({
    href,
    children,
    className = "",
}: Readonly<{
    href: string;
    children: ReactNode;
    className?: string;
}>) {
    return (
        <Button
            asChild
            size="lg"
            variant="outline"
            className={`border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background ${focusRing} ${className}`}
        >
            <a href={href}>{children}</a>
        </Button>
    );
}

function SecondaryLink({
    href,
    children,
    className = "",
}: Readonly<{
    href: string;
    children: ReactNode;
    className?: string;
}>) {
    return (
        <Button
            asChild
            variant="outline"
            className={`border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background ${focusRing} ${className}`}
        >
            <Link href={href}>{children}</Link>
        </Button>
    );
}

export default function Home() {
    return (
        <div className="min-h-svh bg-foreground font-mono text-background">
            <header className="sticky top-0 z-10 border-b border-background/10 bg-foreground">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                    <div className="flex items-center justify-between gap-3">
                        <Link
                            href="/"
                            className={`flex items-center gap-2 font-mono text-lg font-semibold tracking-tight text-background outline-none transition-colors ${focusRing}`}
                        >
                            <span className="flex size-6 items-center justify-center rounded-md border border-background/15 bg-background text-xs font-bold text-foreground">
                                L
                            </span>
                            LegacyLift
                        </Link>

                        <div className="flex items-center gap-2 lg:hidden">
                            <SecondaryLink href="/auth/login" className="h-8 px-2.5 text-xs">
                                Iniciar sesión
                            </SecondaryLink>
                            <PrimaryButton href="/auth/register" className="h-8 px-2.5 text-xs">
                                Comenzar
                            </PrimaryButton>
                        </div>
                    </div>

                    <nav
                        aria-label="Secciones de la Landing"
                        className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-sm font-medium text-background/72"
                    >
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className={`rounded-md outline-none transition-colors hover:text-background focus-visible:text-background ${focusRing}`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-2 lg:flex">
                        <SecondaryLink href="/auth/login">Iniciar sesión</SecondaryLink>
                        <PrimaryButton href="/auth/register">Comenzar</PrimaryButton>
                    </div>
                </div>
            </header>

            <main>
                <section
                    id="producto"
                    aria-labelledby="hero-title"
                    className="relative isolate scroll-mt-24 overflow-hidden border-b border-background/10"
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -z-10 opacity-5 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:48px_48px]"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-background/10 blur-3xl"
                    />
                    <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
                        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-background/15 bg-background/5 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-background">
                                <span className="size-1.5 rounded-full bg-background" />
                                AI-assisted legacy modernization
                            </div>

                            <h1
                                id="hero-title"
                                className="mt-6 max-w-5xl font-mono text-5xl font-bold tracking-tight text-background sm:text-6xl lg:text-7xl"
                            >
                                Understand first.
                                <span className="block text-background/88">
                                    Modernize safely.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-3xl text-lg leading-8 text-background/72">
                                LegacyLift ayuda a organizaciones con sistemas existentes a
                                entender su software, planificar cambios progresivos,
                                modernizar con menor riesgo y verificar que el comportamiento
                                esperado se conserve.
                            </p>

                            <p className="mt-3 max-w-3xl leading-7 text-background/62">
                                No se trata de convertir código a ciegas. La plataforma pone
                                conocimiento, estrategia y evidencia antes de cada paso de
                                modernización.
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <PrimaryButton href="/auth/register">Comenzar</PrimaryButton>
                                <SecondaryAnchor href="#como-funciona">
                                    Ver cómo funciona
                                </SecondaryAnchor>
                            </div>
                        </div>

                        <div className="mt-12 grid gap-3 lg:grid-cols-12">
                            <Card className={`${darkPanel} lg:col-span-7`}>
                                <CardHeader className="border-b border-background/10">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <TechnicalBadge>01 / Modernization Pipeline</TechnicalBadge>
                                        <TechnicalBadge>Evidence-driven</TechnicalBadge>
                                    </div>
                                    <CardTitle className="font-mono text-2xl text-background">
                                        Pipeline de modernización
                                    </CardTitle>
                                    <CardDescription className={darkMuted}>
                                        Discover, Understand, Plan, Modernize y Verify como
                                        una secuencia técnica de reducción de riesgo.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <ol
                                        className="grid gap-2 md:grid-cols-5"
                                        aria-label="Flujo principal de LegacyLift"
                                    >
                                        {workflowSteps.map((item, index) => {
                                            const Icon = item.icon;

                                            return (
                                                <li
                                                    key={item.step}
                                                    className="rounded-xl border border-background/10 bg-background/5 p-3"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="font-mono text-[0.7rem] text-background/58">
                                                            0{index + 1}
                                                        </span>
                                                        <Icon
                                                            className="size-4 text-background/68"
                                                            aria-hidden="true"
                                                        />
                                                    </div>
                                                    <p className="mt-4 font-mono text-[0.72rem] font-semibold tracking-[0.14em] text-background">
                                                        {item.step}
                                                    </p>
                                                    <p className="mt-1 font-mono text-xs leading-5 text-background/62">
                                                        {item.title}
                                                    </p>
                                                </li>
                                            );
                                        })}
                                    </ol>
                                </CardContent>
                            </Card>

                            <Card className={`${darkPanel} lg:col-span-5`}>
                                <CardHeader>
                                    <TechnicalBadge>02 / System Knowledge</TechnicalBadge>
                                    <CardTitle className="font-mono text-2xl text-background">
                                        Arquitectura, dependencias y reglas
                                    </CardTitle>
                                    <CardDescription className={darkMuted}>
                                        Un mapa técnico antes de decidir qué conservar,
                                        encapsular, transformar o retirar.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-2">
                                    {[
                                        "architecture.graph",
                                        "dependencies.map",
                                        "business-rules.index",
                                    ].map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-center justify-between rounded-lg border border-background/10 bg-background/5 px-3 py-2"
                                        >
                                            <span className="font-mono text-xs text-background/72">
                                                {item}
                                            </span>
                                            <CheckCircle2
                                                className="size-4 text-background"
                                                aria-hidden="true"
                                            />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className={`${darkPanelSoft} lg:col-span-3`}>
                                <CardHeader>
                                    <TechnicalLabel>03 / Tech Stack</TechnicalLabel>
                                    <CardTitle className="font-mono text-base text-background">
                                        Technologies
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-wrap gap-2">
                                    {technologies.slice(0, 4).map((technology) => (
                                        <Badge
                                            key={technology}
                                            variant="outline"
                                            className="border-background/15 bg-background/5 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-background"
                                        >
                                            {technology}
                                        </Badge>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className={`${darkPanelSoft} lg:col-span-4`}>
                                <CardHeader>
                                    <TechnicalLabel>04 / Private AI</TechnicalLabel>
                                    <CardTitle className="font-mono text-base text-background">
                                        Private AI
                                    </CardTitle>
                                    <CardDescription className={darkMuted}>
                                        Procesamiento privado y posibilidad de modelos locales o
                                        privados para código sensible.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className={`${darkPanelSoft} lg:col-span-5`}>
                                <CardHeader>
                                    <TechnicalLabel>05 / Risk Control</TechnicalLabel>
                                    <CardTitle className="font-mono text-base text-background">
                                        Risk & Evidence
                                    </CardTitle>
                                    <CardDescription className={darkMuted}>
                                        Planes progresivos, verificación y evidencia antes de
                                        avanzar con cambios críticos.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                </section>

                <div className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
                    <section aria-labelledby="problem-title" className="scroll-mt-24">
                        <SectionIntro
                            id="problem-title"
                            eyebrow="Problema"
                            title="El mayor riesgo aparece antes de cambiar código."
                            description="La modernización falla cuando el equipo no entiende completamente el sistema que intenta cambiar: conocimiento incompleto, dependencias antiguas y reglas críticas escondidas en código que nadie quiere romper."
                        />

                        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {problemPoints.map((point) => (
                                <div
                                    key={point.title}
                                    className="rounded-xl border border-background/10 bg-background/5 p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <IconFrame icon={point.icon} />
                                        <div>
                                            <TechnicalLabel>Risk Vector</TechnicalLabel>
                                            <h3 className="mt-2 font-mono font-medium text-background">
                                                {point.title}
                                            </h3>
                                            <p className="mt-2 font-mono text-sm leading-6 text-background/64">
                                                {point.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section
                        id="como-funciona"
                        aria-labelledby="workflow-title"
                        className="scroll-mt-24"
                    >
                        <SectionIntro
                            id="workflow-title"
                            eyebrow="Cómo funciona"
                            title="Un pipeline de software para entender, planificar y verificar."
                            description="LegacyLift representa la modernización como una secuencia de decisiones informadas. Cada etapa reduce incertidumbre antes de avanzar a la siguiente."
                        />

                        <div className="mt-8 overflow-hidden rounded-xl border border-background/10 bg-background/5">
                            <ol className="divide-y divide-background/10 lg:grid lg:grid-cols-5 lg:divide-x lg:divide-y-0">
                                {workflowSteps.map((item, index) => {
                                    const Icon = item.icon;

                                    return (
                                        <li key={item.step} className="p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-mono text-xs text-background/58">
                                                    0{index + 1}
                                                </span>
                                                <Icon
                                                    className="size-4 text-background/68"
                                                    aria-hidden="true"
                                                />
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="mt-5 border-background/15 bg-background/5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-background"
                                            >
                                                {item.step}
                                            </Badge>
                                            <h3 className="mt-3 font-mono font-medium text-background">
                                                {item.title}
                                            </h3>
                                            <p className="mt-2 font-mono text-sm leading-6 text-background/64">
                                                {item.description}
                                            </p>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                    </section>

                    <section aria-labelledby="capabilities-title" className="scroll-mt-24">
                        <SectionIntro
                            id="capabilities-title"
                            eyebrow="Capacidades principales"
                            title="Módulos de plataforma para reducir riesgo de modernización."
                            description="La Landing presenta las capacidades previstas de LegacyLift como áreas del producto. Esta página no implementa análisis real, IA funcional ni transformaciones de código."
                        />

                        <div className="mt-8 grid gap-3 lg:grid-cols-6">
                            {capabilities.map((capability, index) => (
                                <div
                                    key={capability.title}
                                    className={`rounded-xl border border-background/10 bg-background/5 p-5 ${
                                        index < 2 ? "lg:col-span-3" : "lg:col-span-2"
                                    }`}
                                >
                                    <IconFrame icon={capability.icon} />
                                    <TechnicalLabel>
                                        {String(index + 1).padStart(2, "0")} / Capability
                                    </TechnicalLabel>
                                    <h3 className="mt-2 font-mono font-medium text-background">
                                        {capability.title}
                                    </h3>
                                    <p className="mt-2 font-mono text-sm leading-6 text-background/64">
                                        {capability.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section aria-labelledby="strategies-title" className="scroll-mt-24">
                        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
                            <div>
                                <TechnicalLabel>04 / Modernization Strategy</TechnicalLabel>
                                <h2
                                    id="strategies-title"
                                    className="mt-3 font-mono text-3xl font-semibold tracking-tight text-background sm:text-4xl lg:text-5xl"
                                >
                                    Múltiples caminos, no una reescritura por defecto.
                                </h2>
                                <p className="mt-4 text-base leading-7 text-background/68 sm:text-lg">
                                    La estrategia puede variar por módulo, riesgo y objetivo:
                                    conservar, estabilizar, encapsular, migrar o retirar partes
                                    del sistema según evidencia.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                                {strategies.map((strategy, index) => (
                                    <div
                                        key={strategy}
                                        className="rounded-lg border border-background/10 bg-background/5 px-3 py-3 text-center font-mono text-[0.7rem] font-medium uppercase tracking-[0.12em] text-background"
                                    >
                                        {String(index + 1).padStart(2, "0")} {strategy}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section
                        id="tecnologias"
                        aria-labelledby="technologies-title"
                        className="scroll-mt-24"
                    >
                        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                            <div>
                                <TechnicalLabel>05 / Tech Stack</TechnicalLabel>
                                <h2
                                    id="technologies-title"
                                    className="mt-3 font-mono text-3xl font-semibold tracking-tight text-background sm:text-4xl lg:text-5xl"
                                >
                                    Stack extensible para equipos de ingeniería.
                                </h2>
                                <p className="mt-4 text-base leading-7 text-background/68 sm:text-lg">
                                    LegacyLift está diseñado alrededor de capacidades
                                    especializadas para analizar o transformar tecnologías y
                                    escenarios concretos.
                                </p>
                            </div>

                            <Card className={darkPanel}>
                                <CardHeader className="border-b border-background/10">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge className="bg-background font-mono text-[0.68rem] uppercase tracking-[0.12em] text-foreground">
                                            Platform capability / roadmap
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="border-background/15 bg-background/5 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-background"
                                        >
                                            No implica disponibilidad actual
                                        </Badge>
                                    </div>
                                    <CardTitle className="font-mono text-background">
                                        Ejemplos de tecnologías objetivo
                                    </CardTitle>
                                    <CardDescription className={darkMuted}>
                                        Los ejemplos comunican capacidad de plataforma; no
                                        significan que todos los packs estén disponibles
                                        actualmente.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-5">
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {technologies.map((technology) => (
                                            <div
                                                key={technology}
                                                className="flex items-center gap-3 rounded-lg border border-background/10 bg-background/5 px-3 py-3"
                                            >
                                                <Boxes
                                                    className="size-4 text-background/68"
                                                    aria-hidden="true"
                                                />
                                                <span className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-background">
                                                    {technology === "JavaScript / TypeScript"
                                                        ? "TS / JS"
                                                        : technology}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <p className="font-mono text-sm leading-6 text-background/68">
                                        Los Migration Packs se presentan como capacidades
                                        especializadas para escenarios de análisis o
                                        transformación. Esta issue no implementa packs
                                        funcionales.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    <section
                        id="seguridad"
                        aria-labelledby="security-title"
                        className="scroll-mt-24"
                    >
                        <div className="rounded-xl border border-background/10 bg-background/5 p-5 sm:p-7">
                            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                                <div>
                                    <TechnicalLabel>06 / Private AI + Security</TechnicalLabel>
                                    <h2
                                        id="security-title"
                                        className="mt-3 font-mono text-3xl font-semibold tracking-tight text-background sm:text-4xl lg:text-5xl"
                                    >
                                        Enterprise por diseño, sin claims inventados.
                                    </h2>
                                    <p className="mt-4 font-mono text-base leading-7 text-background/68 sm:text-lg">
                                        La comunicación se centra en aislamiento, protección del
                                        código y procesamiento privado. No se afirman
                                        certificaciones, cumplimiento regulatorio ni garantías no
                                        definidas.
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {securityPoints.map((point) => (
                                        <div
                                            key={point.title}
                                            className="rounded-xl border border-background/10 bg-foreground p-4"
                                        >
                                            <IconFrame icon={point.icon} />
                                            <h3 className="mt-4 font-mono font-medium text-background">
                                                {point.title}
                                            </h3>
                                            <p className="mt-2 font-mono text-sm leading-6 text-background/64">
                                                {point.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section aria-labelledby="customers-title" className="scroll-mt-24">
                        <div className="rounded-xl border border-background/10 bg-background/5 p-5 sm:p-7">
                            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
                                <div>
                                    <TechnicalLabel>07 / Use Cases</TechnicalLabel>
                                    <h2
                                        id="customers-title"
                                        className="mt-3 font-mono text-3xl font-semibold tracking-tight text-background sm:text-4xl"
                                    >
                                        Para organizaciones que dependen de software existente.
                                    </h2>
                                    <p className="mt-4 font-mono leading-7 text-background/68">
                                        LegacyLift se orienta a equipos que necesitan entender y
                                        modernizar aplicaciones críticas sin perder el control del
                                        comportamiento esperado.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {targetCustomers.map((customer) => (
                                        <Badge
                                            key={customer}
                                            variant="outline"
                                            className="h-8 border-background/15 bg-background/5 px-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-background"
                                        >
                                            {customer}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        id="precios"
                        aria-labelledby="plans-title"
                        className="scroll-mt-24"
                    >
                        <SectionIntro
                            id="plans-title"
                            eyebrow="Planes"
                            title="Tiers de producto, sin precios ni billing."
                            description="Developer, Team y Enterprise se presentan de forma informativa. Esta issue no implementa billing, suscripciones, checkout ni integración de pagos."
                        />

                        <div className="mt-8 grid gap-3 md:grid-cols-3">
                            {plans.map((plan) => (
                                <Card key={plan.name} className={darkPanel}>
                                    <CardHeader>
                                        <Badge
                                            variant="outline"
                                            className="w-fit border-background/15 bg-background/5 text-background"
                                        >
                                            Plan previsto
                                        </Badge>
                                        <CardTitle className="font-mono text-2xl text-background">
                                            {plan.name}
                                        </CardTitle>
                                        <CardDescription className={darkMuted}>
                                            {plan.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <PrimaryButton href="/auth/register" className="w-full">
                                            Comenzar
                                        </PrimaryButton>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <section aria-labelledby="final-cta-title" className="scroll-mt-24">
                        <div className="rounded-xl border border-background/10 bg-background/5 p-6 text-center sm:p-8">
                            <TechnicalLabel>08 / Start Modernization</TechnicalLabel>
                            <h2
                                id="final-cta-title"
                                className="mt-3 font-mono text-3xl font-semibold tracking-tight text-background sm:text-4xl"
                            >
                                Moderniza con contexto, no a ciegas.
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl font-mono leading-7 text-background/68">
                                Empieza por entender arquitectura, dependencias, reglas y riesgo
                                antes de mover sistemas críticos.
                            </p>
                            <div className="mt-6">
                                <PrimaryButton href="/auth/register">Comenzar</PrimaryButton>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="border-t border-background/10 bg-foreground">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <div>
                        <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-background/58">
                            Legacy Modernization Platform
                        </p>
                        <p className="mt-2 font-mono text-lg font-semibold tracking-tight text-background">
                            LegacyLift
                        </p>
                        <p className="mt-2 max-w-xl font-mono text-sm leading-6 text-background/66">
                            Plataforma de modernización de software legado asistida por IA,
                            enfocada en entender primero y modernizar con seguridad.
                        </p>
                    </div>

                    <nav
                        aria-label="Enlaces del footer"
                        className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-sm font-medium text-background/68"
                    >
                        <a
                            href="#producto"
                            className={`rounded-md outline-none transition-colors hover:text-background ${focusRing}`}
                        >
                            Producto
                        </a>
                        <a
                            href="#seguridad"
                            className={`rounded-md outline-none transition-colors hover:text-background ${focusRing}`}
                        >
                            Seguridad
                        </a>
                        <span>Documentación</span>
                        <a
                            href="https://github.com/Proyecto-Software-I/frontend"
                            className={`rounded-md outline-none transition-colors hover:text-background ${focusRing}`}
                        >
                            GitHub
                        </a>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
