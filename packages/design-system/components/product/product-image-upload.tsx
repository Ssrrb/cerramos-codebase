"use client";

import type {
  ProductFieldProps,
  ProductImageValue,
} from "@repo/design-system/components/product/types";
import { Button } from "@repo/design-system/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/design-system/components/ui/form";
import { cn } from "@repo/design-system/lib/utils";
import { ImagePlusIcon, RefreshCcwIcon, Trash2Icon } from "lucide-react";
import { useId, useRef, useState } from "react";
import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";

type ProductImageUploadProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = ProductFieldProps<TFieldValues, TName> & {
  accept?: string;
  maxSizeInMb?: number;
  uploadUrl: string;
};

function ProductImageUpload<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  accept = "image/png,image/jpeg,image/webp,image/jpg",
  control,
  description = "Sube una imagen clara del producto. PNG, JPG o WEBP hasta 5 MB.",
  disabled,
  label = "Imagen principal",
  maxSizeInMb = 5,
  name,
  uploadUrl,
}: ProductImageUploadProps<TFieldValues, TName>) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <ImageUploadControl
          accept={accept}
          description={description}
          disabled={disabled}
          field={field}
          inputId={inputId}
          inputRef={inputRef}
          label={label}
          maxSizeInMb={maxSizeInMb}
          uploadUrl={uploadUrl}
        />
      )}
    />
  );
}

type ImageUploadControlProps = {
  accept: string;
  description: string;
  disabled?: boolean;
  field: ControllerRenderProps<any, any>;
  inputId: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  label: string;
  maxSizeInMb: number;
  uploadUrl: string;
};

type UploadRouteResponse = {
  expiresAt: string;
  headers: Record<string, string>;
  maxBytes?: number;
  objectKey: string;
  url: string;
};

function ImageUploadControl({
  accept,
  description,
  disabled,
  field,
  inputId,
  inputRef,
  label,
  maxSizeInMb,
  uploadUrl,
}: ImageUploadControlProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const value = (field.value ?? {
    fileName: "",
    objectKey: "",
    src: "",
  }) as ProductImageValue;

  const openPicker = () => {
    inputRef.current?.click();
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="space-y-3">
          <input
            accept={accept}
            aria-label={label}
            className="sr-only"
            disabled={disabled}
            id={inputId}
            onBlur={field.onBlur}
            onChange={async (event) => {
              const file = event.target.files?.[0];

              if (!file) {
                return;
              }

              if (!file.type.startsWith("image/")) {
                setUploadError("Solo puedes subir archivos de imagen.");
                field.onChange({
                  fileName: "",
                  objectKey: "",
                  src: "",
                });

                return;
              }

              if (file.size > maxSizeInMb * 1024 * 1024) {
                setUploadError(
                  `La imagen debe pesar menos de ${maxSizeInMb} MB.`
                );
                field.onChange({
                  fileName: "",
                  objectKey: "",
                  src: "",
                });

                return;
              }

              setIsUploading(true);

              try {
                const previewUrl = URL.createObjectURL(file);
                const uploadResponse = await fetch(uploadUrl, {
                  body: JSON.stringify({
                    contentType: file.type,
                    fileName: file.name,
                    size: file.size,
                  }),
                  headers: {
                    "content-type": "application/json",
                  },
                  method: "POST",
                });

                const uploadPayload = (await uploadResponse
                  .json()
                  .catch(() => null)) as
                  | { error?: string }
                  | UploadRouteResponse
                  | null;

                if (
                  !(
                    uploadResponse.ok &&
                    uploadPayload &&
                    "url" in uploadPayload
                  )
                ) {
                  throw new Error(
                    uploadPayload &&
                      "error" in uploadPayload &&
                      uploadPayload.error
                      ? uploadPayload.error
                      : "No se pudo preparar la carga de la imagen."
                  );
                }

                const uploadResult = uploadPayload as UploadRouteResponse;
                const directUploadResponse = await fetch(uploadResult.url, {
                  body: file,
                  headers: uploadResult.headers,
                  method: "PUT",
                });

                if (!directUploadResponse.ok) {
                  throw new Error("No se pudo subir la imagen.");
                }

                setUploadError(null);
                field.onChange({
                  fileName: file.name,
                  objectKey: uploadResult.objectKey,
                  src: previewUrl,
                });
              } catch (error) {
                setUploadError(
                  error instanceof Error
                    ? error.message
                    : "No se pudo subir la imagen."
                );
                field.onChange({
                  fileName: "",
                  objectKey: "",
                  src: "",
                });
              } finally {
                setIsUploading(false);
              }
            }}
            ref={inputRef}
            type="file"
          />
          <div
            className={cn(
              "rounded-2xl border border-dashed px-4 py-4 transition-colors",
              value.src
                ? "border-border/80 bg-muted/20"
                : "border-border/70 bg-muted/35"
            )}
          >
            {value.src ? (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-border/70 bg-background">
                  <img
                    alt={value.fileName || "Vista previa del producto"}
                    className="aspect-[16/10] w-full object-cover"
                    src={value.src}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm">
                      {value.fileName}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Imagen lista para publicar
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={openPicker}
                      type="button"
                      variant="outline"
                    >
                      <RefreshCcwIcon className="size-4" />
                      Reemplazar
                    </Button>
                    <Button
                      onClick={() => {
                        setUploadError(null);
                        field.onChange({
                          fileName: "",
                          objectKey: "",
                          src: "",
                        });

                        if (inputRef.current) {
                          inputRef.current.value = "";
                        }
                      }}
                      type="button"
                      variant="ghost"
                    >
                      <Trash2Icon className="size-4" />
                      Quitar
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-transparent px-4 py-10 text-center transition-colors hover:border-border/70 hover:bg-background"
                disabled={disabled}
                onClick={openPicker}
                type="button"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-background shadow-xs">
                  <ImagePlusIcon className="size-5" />
                </span>
                <div className="space-y-1">
                  <p className="font-medium text-sm">
                    {isUploading
                      ? "Subiendo imagen del producto"
                      : "Cargar imagen del producto"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {isUploading
                      ? "Espera mientras preparamos la imagen."
                      : "Haz clic para seleccionar una imagen"}
                  </p>
                </div>
              </button>
            )}
          </div>
          {uploadError ? (
            <p className="text-destructive text-sm">{uploadError}</p>
          ) : null}
        </div>
      </FormControl>
      <FormDescription>{description}</FormDescription>
      <FormMessage />
    </FormItem>
  );
}

export { ProductImageUpload };
