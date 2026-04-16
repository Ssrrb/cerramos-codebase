"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { cn } from "@repo/design-system/lib/utils";
import { X } from "lucide-react";
import { useState } from "react";

export type AuthInlineType = "sign-in" | "sign-up";

interface AuthInlineFormProps {
  onDismiss: () => void;
  onSubmit: (email: string) => void;
  onSwitch: (type: AuthInlineType) => void;
  type: AuthInlineType;
}

export const AuthInlineForm = ({
  type,
  onSwitch,
  onDismiss,
  onSubmit,
}: AuthInlineFormProps) => {
  const [email, setEmail] = useState("");

  const isSignUp = type === "sign-up";

  return (
    <div
      className={cn(
        "relative w-full max-w-md rounded-2xl border border-border/80 bg-background p-6 shadow-sm",
        "transition-all duration-200"
      )}
    >
      {/* Dismiss Button */}
      <button
        aria-label="Dismiss"
        className="absolute top-4 right-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={onDismiss}
      >
        <X className="size-4" />
      </button>

      <div className="space-y-4">
        {/* Small prompt above email field */}
        <div className="text-center">
          <p className="text-muted-foreground text-xs">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              className="font-medium text-foreground underline underline-offset-2 transition-colors hover:text-primary"
              onClick={() => onSwitch(isSignUp ? "sign-in" : "sign-up")}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>

        <div className="space-y-2">
          <Label
            className="font-medium text-muted-foreground text-xs"
            htmlFor="email"
          >
            {isSignUp ? "Work email" : "Email address"}
          </Label>
          <div className="flex gap-2">
            <Input
              className="h-10 rounded-xl"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              type="email"
              value={email}
            />
            <Button
              className="h-10 rounded-xl bg-foreground px-4 text-background hover:bg-foreground/90"
              onClick={() => onSubmit(email)}
            >
              {isSignUp ? "Start" : "Enter"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
