"use client";

import { CameraIcon, ImagePlusIcon, LoaderCircleIcon, Trash2Icon } from "lucide-react";
import { useId, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/design-system/components/ui/avatar";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";

type UploadedImageValue = {
  fileName: string;
  objectKey: string;
  src: string;
};

export interface CommerceOnboardingFormViewProps {
  businessName: string;
  email: string;
  error?: string | null;
  isLogoUploading?: boolean;
  isPending?: boolean;
  logoImage?: UploadedImageValue;
  logoUploadError?: string | null;
  name?: string | null;
  onBusinessNameChange: (value: string) => void;
  onLogoFileSelect: (file: File) => void | Promise<void>;
  onLogoRemove: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const CommerceOnboardingFormView = ({
  businessName,
  email,
  error,
  isLogoUploading = false,
  isPending = false,
  logoImage,
  logoUploadError,
  name,
  onBusinessNameChange,
  onLogoFileSelect,
  onLogoRemove,
  onSubmit,
}: CommerceOnboardingFormViewProps) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const commerceInitial = businessName.trim().charAt(0).toUpperCase() || "C";
  const displayName = name?.trim() || email;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16">
      <div className="grid w-full gap-6 rounded-[2rem] border border-border/70 bg-background p-6 shadow-sm lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:p-8">
        <section className="rounded-[1.5rem] border border-border/70 bg-muted/30 p-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background px-3 py-1 text-muted-foreground text-xs">
            <CameraIcon className="size-3.5" />
            Configuracion inicial
          </div>
          <div className="mt-5 space-y-3">
            <h1 className="font-semibold text-3xl tracking-[-0.04em]">
              Dale cara a tu comercio desde el primer minuto
            </h1>
            <p className="max-w-md text-muted-foreground text-sm leading-6">
              {displayName}, agrega el nombre de tu negocio y, si ya tienes un
              logo, subelo ahora para que aparezca en tu panel y en el checkout.
            </p>
          </div>
          <div className="mt-8 rounded-[1.5rem] border border-border/80 bg-background p-5">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 rounded-2xl border border-border/70">
                <AvatarImage
                  alt={businessName || "Logo del comercio"}
                  src={logoImage?.src || undefined}
                />
                <AvatarFallback className="rounded-2xl text-base">
                  {commerceInitial}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="font-medium text-sm">
                  {businessName.trim() || "Tu logo todavia no esta cargado"}
                </p>
                <p className="text-muted-foreground text-sm">
                  Tu marca acompana cada enlace de compra y el panel interno.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4 text-sm">
              <div className="space-y-1">
                <p className="font-medium">Logo opcional</p>
                <p className="text-muted-foreground leading-6">
                  Usa un PNG, JPG o WEBP cuadrado de hasta 5 MB. Si no lo tienes
                  listo, puedes seguir y agregarlo despues.
                </p>
              </div>
              <input
                accept="image/png,image/jpeg,image/webp,image/jpg"
                aria-label="Cargar logo"
                className="sr-only"
                disabled={isPending}
                id={inputId}
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    return;
                  }

                  void onLogoFileSelect(file);
                  event.target.value = "";
                }}
                ref={inputRef}
                type="file"
              />
              {logoImage?.src ? (
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="overflow-hidden rounded-2xl border border-border/70 bg-background">
                      <img
                        alt={logoImage.fileName || "Vista previa del logo"}
                        className="size-16 object-cover"
                        src={logoImage.src}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{logoImage.fileName}</p>
                      <p className="text-muted-foreground text-sm">
                        Listo para mostrarse en tu checkout.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      disabled={isPending}
                      onClick={() => inputRef.current?.click()}
                      type="button"
                      variant="outline"
                    >
                      <ImagePlusIcon className="size-4" />
                      Reemplazar
                    </Button>
                    <Button
                      disabled={isPending}
                      onClick={() => {
                        if (inputRef.current) {
                          inputRef.current.value = "";
                        }

                        onLogoRemove();
                      }}
                      type="button"
                      variant="ghost"
                    >
                      <Trash2Icon className="size-4" />
                      Quitar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  className="justify-self-start"
                  disabled={isPending}
                  onClick={() => inputRef.current?.click()}
                  type="button"
                  variant="outline"
                >
                  {isLogoUploading ? (
                    <>
                      <LoaderCircleIcon className="size-4 animate-spin" />
                      Subiendo logo...
                    </>
                  ) : (
                    <>
                      <ImagePlusIcon className="size-4" />
                      Cargar logo
                    </>
                  )}
                </Button>
              )}
              {logoUploadError ? (
                <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-destructive text-sm">
                  {logoUploadError}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-border/70 bg-background p-6">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">Paso 1 de 1</p>
            <h2 className="font-semibold text-2xl tracking-[-0.04em]">
              Crea tu espacio operativo
            </h2>
            <p className="text-muted-foreground text-sm leading-6">
              Solo pedimos lo minimo para abrir tu panel. El resto lo puedes
              completar despues.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="font-medium text-sm" htmlFor="businessName">
                Nombre del comercio
              </label>
              <Input
                autoComplete="organization"
                id="businessName"
                name="businessName"
                onChange={(event) => onBusinessNameChange(event.target.value)}
                placeholder="Ej. Tienda Centro"
                required
                value={businessName}
              />
            </div>

            {error ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-destructive text-sm">
                {error}
              </p>
            ) : null}

            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="font-medium text-sm">Lo que quedara listo ahora</p>
              <ul className="mt-2 space-y-2 text-muted-foreground text-sm leading-6">
                <li>Tu comercio quedara creado y vinculado a tu cuenta.</li>
                <li>El logo aparecera en el panel y en la experiencia de compra.</li>
                <li>Luego podras cargar productos y compartir tu primer checkout.</li>
              </ul>
            </div>

            <Button className="w-full" disabled={isPending} type="submit">
              {isPending ? "Configurando..." : "Entrar al panel"}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
};
