"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogHeader,
} from "@repo/design-system/components/ui/dialog";
import { SignUpFormView } from "./sign-up/sign-up-form";
import { SignInFormView } from "./sign-in/sign-in-form";

export type AuthModalType = "sign-in" | "sign-up";

interface AuthModalProps {
  children?: ReactNode;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  type: AuthModalType;
}

export const AuthModal = ({
  children,
  description,
  isOpen,
  onClose,
  title,
  type,
}: AuthModalProps) => {
  const resolvedTitle =
    title ?? (type === "sign-up" ? "Create an account" : "Welcome back");
  const resolvedDescription =
    description ??
    (type === "sign-up"
      ? "Join Cerramos and start managing your business."
      : "Sign in to access your dashboard.");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[32.5rem] p-0 overflow-hidden border-border/80 bg-background">
        <DialogHeader className="px-6 py-4 border-b border-border/50 bg-muted/30">
          <DialogTitle className="text-xl">{resolvedTitle}</DialogTitle>
          <DialogDescription>{resolvedDescription}</DialogDescription>
        </DialogHeader>
        <div className="p-6">
          {children ??
            (type === "sign-up" ? (
              <SignUpFormView
                accountHref="#"
                email=""
                name=""
                password=""
                step="account"
                usage="explore"
                onBack={() => {}}
                onEmailChange={() => {}}
                onNameChange={() => {}}
                onPasswordChange={() => {}}
                onSubmit={(event) => event.preventDefault()}
                onGoogleClick={() => {}}
                onUsageChange={() => {}}
              />
            ) : (
              <SignInFormView
                callbackHref="#"
                email=""
                googleEnabled
                password=""
                step="email"
                onEmailChange={() => {}}
                onGoogleClick={() => {}}
                onPasswordChange={() => {}}
                onSubmit={(event) => event.preventDefault()}
                onUseDifferentEmail={() => {}}
              />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
