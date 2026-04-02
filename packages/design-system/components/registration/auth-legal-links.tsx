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
      <a
        className="transition-colors hover:text-foreground"
        href={termsUrl}
        rel="noreferrer"
        target="_blank"
      >
        Terms
      </a>
    ) : (
      <span>Terms</span>
    )}
    {privacyUrl ? (
      <a
        className="transition-colors hover:text-foreground"
        href={privacyUrl}
        rel="noreferrer"
        target="_blank"
      >
        Privacy Policy
      </a>
    ) : (
      <span>Privacy Policy</span>
    )}
  </div>
);
