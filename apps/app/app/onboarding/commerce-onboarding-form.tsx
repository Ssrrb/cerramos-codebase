"use client";
import { CommerceOnboardingFormView } from "@repo/design-system/components/registration";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

interface CommerceOnboardingFormProps {
  email: string;
  name?: string | null;
}

type UploadedImageValue = {
  fileName: string;
  objectKey: string;
  src: string;
};

const EMPTY_LOGO_IMAGE: UploadedImageValue = {
  fileName: "",
  objectKey: "",
  src: "",
};

const CommerceOnboardingForm = ({
  email,
  name,
}: CommerceOnboardingFormProps) => {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [logoImage, setLogoImage] =
    useState<UploadedImageValue>(EMPTY_LOGO_IMAGE);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (logoImage.src.startsWith("blob:")) {
        URL.revokeObjectURL(logoImage.src);
      }
    };
  }, [logoImage.src]);

  const handleLogoFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setLogoUploadError("Solo puedes subir archivos de imagen.");
      setLogoImage(EMPTY_LOGO_IMAGE);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLogoUploadError("La imagen debe pesar menos de 5 MB.");
      setLogoImage(EMPTY_LOGO_IMAGE);
      return;
    }

    setLogoUploadError(null);
    setIsLogoUploading(true);

    const previousBlobUrl = logoImage.src.startsWith("blob:")
      ? logoImage.src
      : null;

    try {
      const previewUrl = URL.createObjectURL(file);
      const uploadResponse = await fetch("/api/auth/bootstrap/logo-upload", {
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

      const uploadPayload = (await uploadResponse.json().catch(() => null)) as
        | {
            error?: string;
          }
        | {
            headers: Record<string, string>;
            objectKey: string;
            url: string;
          }
        | null;

      if (!(uploadResponse.ok && uploadPayload && "url" in uploadPayload)) {
        URL.revokeObjectURL(previewUrl);
        throw new Error(
          uploadPayload && "error" in uploadPayload && uploadPayload.error
            ? uploadPayload.error
            : "No se pudo preparar la carga del logo."
        );
      }

      const directUploadResponse = await fetch(uploadPayload.url, {
        body: file,
        headers: uploadPayload.headers,
        method: "PUT",
      });

      if (!directUploadResponse.ok) {
        URL.revokeObjectURL(previewUrl);
        throw new Error("No se pudo subir el logo.");
      }

      if (previousBlobUrl) {
        URL.revokeObjectURL(previousBlobUrl);
      }

      setLogoImage({
        fileName: file.name,
        objectKey: uploadPayload.objectKey,
        src: previewUrl,
      });
    } catch (uploadError) {
      setLogoImage(EMPTY_LOGO_IMAGE);
      setLogoUploadError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo subir el logo."
      );
    } finally {
      setIsLogoUploading(false);
    }
  };

  const handleLogoRemove = () => {
    if (logoImage.src.startsWith("blob:")) {
      URL.revokeObjectURL(logoImage.src);
    }

    setLogoUploadError(null);
    setLogoImage(EMPTY_LOGO_IMAGE);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/bootstrap", {
          body: JSON.stringify({
            commerceName: businessName,
            logoImageObjectKey: logoImage.objectKey || undefined,
          }),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;

          setError(
            payload?.error ??
              "No se pudo configurar tu comercio. Intenta de nuevo."
          );
          return;
        }

        router.push("/");
        router.refresh();
      } catch {
        setError("No se pudo configurar tu comercio. Intenta de nuevo.");
      }
    });
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <CommerceOnboardingFormView
      businessName={businessName}
      email={email}
      error={error}
      isLogoUploading={isLogoUploading}
      isPending={isPending || isLogoUploading}
      logoImage={logoImage}
      logoUploadError={logoUploadError}
      name={name}
      onBusinessNameChange={setBusinessName}
      onLogoFileSelect={handleLogoFileSelect}
      onLogoRemove={handleLogoRemove}
      onSubmit={handleSubmit}
    />
  );
};

export default CommerceOnboardingForm;
