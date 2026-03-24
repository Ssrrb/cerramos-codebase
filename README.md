# ▲ / next-forge

**Plantilla Turborepo de grado de producción para aplicaciones Next.js.**

<div>
  <img src="https://img.shields.io/npm/dy/next-forge" alt="" />
  <img src="https://img.shields.io/npm/v/next-forge" alt="" />
  <img src="https://img.shields.io/github/license/vercel/next-forge" alt="" />
</div>

## Descripción general

[next-forge](https://github.com/vercel/next-forge) es una plantilla [Turborepo](https://turborepo.com) de grado de producción para aplicaciones [Next.js](https://nextjs.org/). Está diseñada para ser un punto de partida completo para construir aplicaciones SaaS, proporcionando una base sólida y con opiniones establecidas que requiere una configuración mínima.

Construido sobre una década de experiencia creando aplicaciones web, next-forge equilibra velocidad y calidad para ayudarte a lanzar productos completamente terminados más rápido.

### Filosofía

next-forge se construye alrededor de cinco principios básicos:

- **Rápido** — Rápido para construir, ejecutar, desplegar e iterar.
- **Económico** — Gratis para empezar con servicios que escalan contigo.
- **Con opiniones** — Herramientas integradas diseñadas para trabajar en conjunto.
- **Moderno** — Las últimas características estables con un soporte comunitario saludable.
- **Seguro** — Seguridad de tipos de extremo a extremo y una postura de seguridad robusta.

## Demostración

Experimenta next-forge en acción:

- [Web](https://demo.next-forge.com) — Sitio web de marketing
- [App](https://app.demo.next-forge.com) — Aplicación principal
- [Storybook](https://storybook.demo.next-forge.com) — Biblioteca de componentes
- [API](https://api.demo.next-forge.com/health) — Verificación de estado de la API

## Características

next-forge viene con las baterías incluidas:

### Aplicaciones

- **Web** — Sitio de marketing construido con Tailwind CSS y TWBlocks
- **App** — Aplicación principal con autenticación e integración de base de datos
- **API** — API RESTful con verificaciones de estado y monitoreo
- **Docs** — Sitio de documentación impulsado por Mintlify
- **Email** — Plantillas de correo electrónico con React Email
- **Storybook** — Entorno de desarrollo de componentes

### Paquetes

- **Autenticación** — Impulsada por [Clerk](https://clerk.com)
- **Base de datos** — ORM con seguridad de tipos y migraciones
- **Sistema de diseño** — Biblioteca completa de componentes con modo oscuro
- **Pagos** — Gestión de suscripciones a través de [Stripe](https://stripe.com)
- **Correo electrónico** — Correos transaccionales a través de [Resend](https://resend.com)
- **Analíticas** — Web ([Google Analytics](https://developers.google.com/analytics)) y de producto ([Posthog](https://posthog.com))
- **Observabilidad** — Seguimiento de errores ([Sentry](https://sentry.io)), registros y monitoreo de tiempo de actividad ([BetterStack](https://betterstack.com))
- **Seguridad** — Seguridad de la aplicación ([Arcjet](https://arcjet.com)), limitación de tasa y encabezados seguros
- **CMS** — Gestión de contenido con seguridad de tipos para blogs y documentación
- **SEO** — Gestión de metadatos, mapas de sitio y JSON-LD
- **IA** — Utilidades de integración de IA
- **Webhooks** — Manejo de webhooks entrantes y salientes
- **Colaboración** — Funciones en tiempo real con avatares y cursores en vivo
- **Feature Flags** — Gestión de banderas de características
- **Cron** — Gestión de trabajos programados
- **Almacenamiento** — Subida y gestión de archivos
- **Internacionalización** — Soporte multilingüe
- **Notificaciones** — Sistema de notificaciones en la aplicación

## Empezando

### Requisitos previos

- Node.js 20+
- [Bun](https://bun.sh) (o npm/yarn/pnpm)
- [Stripe CLI](https://docs.stripe.com/stripe-cli) para pruebas locales de webhooks

### Instalación

Crea un nuevo proyecto next-forge:

```sh
npx next-forge@latest init
```

### Configuración

1. Configura tus variables de entorno
2. Configura las cuentas de servicio requeridas (Clerk, Stripe, Resend, etc.)
3. Ejecuta el servidor de desarrollo

Para instrucciones de configuración detalladas, lee la [documentación](https://www.next-forge.com/docs).

## Estructura

next-forge utiliza una estructura monorepo gestionada por Turborepo:

```
next-forge/
├── apps/           # Aplicaciones desplegables
│   ├── web/        # Sitio web de marketing (puerto 3001)
│   ├── app/        # Aplicación principal (puerto 3000)
│   ├── api/        # Servidor API
│   ├── docs/       # Documentación
│   ├── email/      # Plantillas de correo
│   └── storybook/  # Biblioteca de componentes
└── packages/       # Paquetes compartidos
    ├── design-system/
    ├── database/
    ├── auth/
    └── ...
```

Cada aplicación es independiente y se puede desplegar por separado. Los paquetes se comparten entre las aplicaciones para mantener la consistencia y la facilidad de mantenimiento.

## Documentación

La documentación completa está disponible en [next-forge.com/docs](https://www.next-forge.com/docs), incluyendo:

- Guías de configuración detalladas
- Documentación de los paquetes
- Guías de migración para cambiar de proveedores
- Instrucciones de despliegue
- Ejemplos y recetas

## Contribuyendo

¡Agradecemos las contribuciones! Consulta la [guía de contribución](https://github.com/vercel/next-forge/blob/main/.github/CONTRIBUTING.md) para más detalles.

## Colaboradores

<a href="https://github.com/vercel/next-forge/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=vercel/next-forge" />
</a>

Hecho con [contrib.rocks](https://contrib.rocks).

## Licencia

MIT
