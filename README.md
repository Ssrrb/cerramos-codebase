# Cerramos en next-forge

Bienvenido. Este repositorio es el monorepo de trabajo para **Cerramos**, construido sobre **next-forge**.

Cerramos no se está construyendo como un sistema de ecommerce genérico. El objetivo del producto es más acotado y útil: convertir un clic de WhatsApp o Instagram en un pedido estructurado con datos claros del comprador, estado de pago y control operativo por parte del comerciante.

Esta base de código se encuentra actualmente **en refactorización**. El starter de next-forge nos da una base sólida de monorepo, pero la estructura de carpetas y los límites de los paquetes se están adaptando progresivamente para coincidir con el MVP de Cerramos.

## Por qué este repo se ve así

next-forge es un starter basado en Turborepo con múltiples aplicaciones desplegables en `apps/` y capacidades compartidas en `packages/`.

Eso es importante para Cerramos porque necesitamos evolucionar en capas:

- flujos orientados al comprador
- operaciones del comerciante
- orquestación de pagos
- capacidades de plataforma compartidas

En lugar de colapsar todo en una sola carpeta de aplicación, este repo mantiene separadas las superficies desplegables y los módulos reutilizables para que el producto pueda crecer sin perder claridad.

## Contexto de producto de Cerramos

Antes de cambiar la arquitectura o mover carpetas, lee estos documentos fuente:

- [overview.mdx](/Users/sebastian/Desktop/cerramos-codebase/docs/content/docs/product/overview.mdx)
- [requirements.mdx](/Users/sebastian/Desktop/cerramos-codebase/docs/content/docs/product/requirements.mdx)
- [architecture.mdx](/Users/sebastian/Desktop/cerramos-codebase/docs/content/docs/product/architecture.mdx)

Esos documentos definen la intención actual del MVP:

- un enlace de producto se resuelve en un comercio y una oferta vendible
- un checkout crea un pedido con un `order_item`
- se requiere inicio de sesión antes de cerrar el pedido
- el estado del pedido y el estado del pago están separados
- el panel del comerciante es la fuente de verdad operativa
- el sistema debe mantenerse como un monolito modular, sin desviarse hacia microservicios prematuros

## Estructura del monorepo

En el nivel superior, el repo sigue la división estándar de next-forge:

```text
.
├── apps/
├── packages/
├── docs/
├── turbo.json
└── package.json
```

### `apps/`

Estas son las superficies desplegables del sistema.

- `apps/app`: la principal superficie de producto autenticada. Este es el hogar más probable para las operaciones de comerciantes y flujos de trabajo internos a medida que Cerramos evolucione.
- `apps/web`: el sitio web de marketing público y presencia web localizada.
- `apps/api`: rutas de API, webhooks, pruebas de salud (health checks) y puntos de entrada del backend que se benefician de estar aislados.
- `apps/email`: aplicación de vista previa de React Email.
- `apps/docs`: aplicación de documentación.
- `apps/storybook`: desarrollo de componentes de interfaz de usuario aislados.
- `apps/studio`: wrapper de Prisma Studio para inspección de base de datos.

### `packages/`

Estas son capacidades compartidas importadas como `@repo/*`.

- `packages/auth`: autenticación e integración de identidad.
- `packages/database`: esquema de Prisma, cliente generado y acceso a base de datos.
- `packages/payments`: superficie de integración del proveedor de pagos.
- `packages/webhooks`: utilidades y temas compartidos de webhooks.
- `packages/design-system`: primitivas y estilos de UI compartidos.
- `packages/notifications`: primitivas de notificación.
- `packages/observability`: registro (logging), seguimiento de errores e instrumentación.
- `packages/security`: protección de solicitudes y ayudantes de seguridad.
- `packages/analytics`: integraciones de analítica.
- `packages/storage`: ayudantes de almacenamiento de archivos.
- `packages/email`: plantillas de correo electrónico y utilidades de envío.
- `packages/internationalization`: soporte de localización.
- `packages/feature-flags`: herramientas para feature flags.
- `packages/collaboration`: soporte de colaboración en tiempo real heredado del starter.
- `packages/cms`, `packages/seo`, `packages/next-config`, `packages/rate-limit`, `packages/typescript-config`, `packages/ai`: infraestructura y utilidades de plataforma compartidas heredadas de next-forge y adaptadas según sea necesario.

## Cómo leer el repo durante la refactorización

Algunas carpetas reflejan la plantilla original de next-forge más que el modelo de dominio final de Cerramos. Eso es de esperarse por ahora.

Al navegar por la base de código, trátala en este orden:

1. `docs/content/docs/product/`
   Esta es la intención del producto canónico.
2. `apps/`
   Esto muestra las superficies operativas en tiempo real (runtime).
3. `packages/`
   Esto muestra las capacidades técnicas actuales y los límites de integración.

Si la intención del producto y la estructura actual del código divergen, prefiere los documentos del producto como dirección y trata el código como trabajo en progreso.

## Dirección de la refactorización

La refactorización actual está moviendo el repo hacia módulos de Cerramos más claros, especialmente en torno a:

- `auth`
- `merchant`
- `catalog`
- `link`
- `checkout`
- `payment`
- `webhook`
- `delivery`
- `audit`

No todos esos módulos existen todavía como carpetas de primera clase. Algunas responsabilidades todavía están distribuidas en las aplicaciones y paquetes de la era del starter. La refactorización es el proceso de hacer explícitos esos límites sin romper el sistema en funcionamiento.

## Suposiciones de trabajo para contribuidores

- Mantén las convenciones de next-forge a menos que haya una razón clara específica de Cerramos para cambiarlas.
- Prefiere refactorizaciones incrementales dentro de los límites de las aplicaciones y paquetes existentes.
- No introduzcas lógica de carrito de múltiples productos en las rutas del MVP.
- No fusiones el estado de pago y el estado de pedido en un único modelo de estado.
- No trates las notificaciones de WhatsApp o correo electrónico como la fuente de verdad; las superficies de los productos internos deben poseer el estado operativo.

## Comandos comunes

Desde la raíz del repo:

```bash
bun run dev
bun run build
bun run test
bun run check
bun run fix
bun run migrate
```

También puedes delimitar el trabajo a un único objetivo con los filtros de Turbo, por ejemplo:

```bash
bun dev --filter app
bun dev --filter web
bun build --filter @repo/database
```

## Nota final

Este repositorio debe leerse como **Cerramos siendo moldeado sobre next-forge**, no como un clon prístino de una plantilla.

Si no estás seguro de dónde pertenece una nueva función, comienza desde los documentos del producto de Cerramos, identifica si es flujo de comprador, operaciones comerciales o infraestructura de plataforma, y luego elige el límite de aplicación o paquete más pequeño que mantenga clara esa responsabilidad.
