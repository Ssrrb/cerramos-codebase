import Link from "next/link";

interface AuthLegalLinksProps {
  privacyUrl?: string;
  termsUrl?: string;
}

export const AuthLegalLinks = ({
  privacyUrl,
  termsUrl,
}: AuthLegalLinksProps) => (
  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground/80">
    {termsUrl ? (
      <Link
        className="transition-colors hover:text-foreground"
        href={termsUrl}
        rel="noreferrer"
        target="_blank"
      >
        Terms
      </Link>
    ) : (
      <span>Terms</span>
    )}
    {privacyUrl ? (
      <Link
        className="transition-colors hover:text-foreground"
        href={privacyUrl}
        rel="noreferrer"
        target="_blank"
      >
        Privacy Policy
      </Link>
    ) : (
      <span>Privacy Policy</span>
    )}
  </div>
);
