"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { cn } from "@repo/design-system/lib/utils";

export type AuthInlineType = "sign-in" | "sign-up";

interface AuthInlineFormProps {
  type: AuthInlineType;
  onSwitch: (type: AuthInlineType) => void;
  onDismiss: () => void;
  onSubmit: (email: string) => void;
}

export const AuthInlineForm = ({ 
  type, 
  onSwitch, 
  onDismiss, 
  onSubmit 
}: AuthInlineFormProps) => {
  const [email, setEmail] = useState("");

  const isSignUp = type === "sign-up";

  return (
    <div className={cn(
      "relative w-full max-w-md p-6 rounded-2xl border border-border/80 bg-background shadow-sm",
      "transition-all duration-200"
    )}>
      {/* Dismiss Button */}
      <button 
        onClick={onDismiss}
        className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>

      <div className="space-y-4">
        {/* Small prompt above email field */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {isSignUp 
              ? "Already have an account?" 
              : "Don't have an account?"}
            {" "}
            <button 
              onClick={() => onSwitch(isSignUp ? "sign-in" : "sign-up")}
              className="font-medium text-foreground underline underline-offset-2 hover:text-primary transition-colors"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
            {isSignUp ? "Work email" : "Email address"}
          </Label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-xl"
            />
            <Button 
              onClick={() => onSubmit(email)}
              className="h-10 px-4 rounded-xl bg-foreground text-background hover:bg-foreground/90"
            >
              {isSignUp ? "Start" : "Enter"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
