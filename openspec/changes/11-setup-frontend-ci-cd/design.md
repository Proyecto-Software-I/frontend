## Context

El repositorio frontend necesita validacion automatica y reproducible para Pull Requests dirigidos a `main`.

El CI ya implementado utiliza GitHub Actions con Node.js 24, `npm ci`, OpenSpec CLI, `npm run spec:validate`, `npm run lint` y `npm run build`.

Durante el cambio se estudiaron opciones de Continuous Deployment, pero se decidio no configurar CD en este momento. Mantener una estrategia de deploy especificada pero no implementada generaria documentacion engañosa y deuda innecesaria.

## Goals / Non-Goals

**Goals:**

- Validar Pull Requests dirigidos a `main`.
- Instalar dependencias de forma reproducible con `npm ci`.
- Validar OpenSpec.
- Ejecutar lint.
- Ejecutar el build de produccion.
- Mantener los pasos separados para diagnosticar fallos.
- Mantener CI independiente de credenciales o plataformas de deployment.
- Documentar explicitamente que CD esta diferido.

**Non-Goals:**

- No Preview Deployments.
- No Production Deployments.
- No Vercel CLI ni integracion Git de Vercel.
- No Firebase ni otra plataforma de hosting.
- No GitHub repository secrets para deployment.
- No cambios al backend ni CORS.
- No branch protection ni rulesets.
- No custom domains.
- No cambios de producto o UI.
- No agregar infraestructura de testing dentro de esta issue si todavia no existe una suite aplicable.

## Decisions

### GitHub Actions para CI

El CI se ejecuta cuando un Pull Request tiene como target `main`.

```text
Pull Request -> main
  -> GitHub Actions
     -> checkout
     -> setup Node.js 24 with npm cache
     -> npm ci
     -> install OpenSpec CLI
     -> npm run spec:validate
     -> npm run lint
     -> npm run build
```

Cada validacion permanece como un step independiente.

### Actions oficiales actuales

El workflow usa versiones actuales de las actions oficiales de checkout y setup de Node para evitar mantener actions basadas en runtimes deprecados.

### Tests cuando exista una suite aplicable

El repositorio no debe inventar un comando de tests que todavia no exista. Cuando el frontend incorpore una suite automatizada y un script aplicable, la issue responsable de testing debera integrar esa validacion en CI.

### CD diferido

Continuous Deployment no forma parte de este cambio.

No se selecciona ni configura actualmente una plataforma de hosting. Tampoco se configuran deploy tokens, project identifiers, environment configuration de Preview/Production, Preview URLs, Production deployments ni workflows `push -> main` para deploy.

La estrategia de CD se definira mediante una nueva issue y un nuevo cambio OpenSpec cuando el proyecto tenga una necesidad real de despliegue.

## Risks / Trade-offs

- [Risk] El proyecto no dispone todavia de deployments automaticos. -> Mitigation: es una decision intencional; CI protege integraciones mientras CD se implementa cuando sea necesario.
- [Risk] Una futura suite de tests podria no ejecutarse en CI si nadie actualiza el workflow. -> Mitigation: la issue que introduzca testing debe incluir su integracion en CI.
- [Trade-off] Se evita preparar infraestructura de deployment anticipadamente. -> Benefit: menos secrets, dependencias externas y configuracion que mantener antes de necesitarla.

## Migration Plan

1. Mantener el workflow CI existente.
2. Actualizar las actions oficiales a versiones actuales.
3. Alinear README y OpenSpec con el comportamiento real: solo CI.
4. Validar OpenSpec, lint y build.
5. Revisar el diff y mergear mediante el flujo normal de Pull Request.

Rollback: revertir este cambio mediante Pull Request. No hay secrets, recursos de hosting ni deployments externos que deban limpiarse.

## Open Questions

- None for this change.