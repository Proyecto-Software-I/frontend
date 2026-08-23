## Why

Proyecto-Software-I/frontend necesita validacion automatica y reproducible para los Pull Requests antes de integrarlos en `main`. Continuous Deployment se evaluo durante este cambio, pero se decidio diferirlo hasta que exista una necesidad concreta de despliegue.

Este cambio formaliza unicamente el CI que ya se encuentra implementado y probado.

## What Changes

- Configurar GitHub Actions CI para Pull Requests dirigidos a `main`.
- Ejecutar `npm ci`, instalacion de OpenSpec CLI, `npm run spec:validate`, `npm run lint` y `npm run build` como pasos explicitos.
- Mantener cada validacion separada para que los fallos sean diagnosticables.
- Mantener el workflow limitado a validacion, sin tokens, secrets, comandos de deploy ni triggers de produccion.
- Diferir explicitamente Continuous Deployment, hosting, Preview Deployments y Production Deployments a una issue/OpenSpec futuros.
- Preservar codigo de producto, contratos backend, rulesets, branch protections y configuracion de entornos fuera del alcance de CI.

## Capabilities

### New Capabilities

- `frontend-ci-cd`: validacion CI de Pull Requests del frontend y decision explicita de diferir CD.

### Modified Capabilities

- None.

## Impact

- Areas afectadas: `.github/workflows/ci.yml`, `README.md` y `openspec/changes/11-setup-frontend-ci-cd/`.
- El workflow se ejecuta para Pull Requests cuyo target es `main`.
- No hay cambios en `src/**`, rutas, componentes, contratos HTTP o comportamiento visible del producto.
- No se requieren secrets de deployment.
- No se configura Vercel, Firebase ni otra plataforma de hosting.
- No se realizan deployments de Preview ni Production.
- CD requerira una nueva issue y un nuevo cambio OpenSpec cuando se decida implementarlo.