import Link from "next/link";

export const SignUp = () => (
  <div className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm">
    <div className="space-y-1">
      <h1 className="text-xl font-semibold">Crear cuenta</h1>
      <p className="text-sm text-muted-foreground">
        El alta de usuarios quedara soportada por la capa de auth propia de
        Cerramos.
      </p>
    </div>
    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
      Pendiente de implementar: registro con email y contrasena, consentimiento
      y vinculacion opcional con Google.
    </div>
    <Link className="text-sm underline" href="/sign-in">
      Ya tengo cuenta
    </Link>
  </div>
);
