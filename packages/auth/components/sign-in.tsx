import Link from "next/link";

export const SignIn = () => (
  <div className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm">
    <div className="space-y-1">
      <h1 className="text-xl font-semibold">Iniciar sesion</h1>
      <p className="text-sm text-muted-foreground">
        Cerramos usara autenticacion propia con email, contrasena y Google.
      </p>
    </div>
    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
      Pendiente de implementar: formulario real, validacion de sesion y callback
      OAuth de Google.
    </div>
    <Link className="text-sm underline" href="/sign-up">
      Crear cuenta
    </Link>
  </div>
);
