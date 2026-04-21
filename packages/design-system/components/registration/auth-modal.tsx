"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/design-system/components/ui/dialog";
import type { ReactNode } from "react";
import { SignInFormView } from "./sign-in/sign-in-form";
import { SignUpFormView } from "./sign-up/sign-up-form";

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
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent className="max-w-[32.5rem] overflow-hidden border-border/80 bg-background p-0">
        <DialogHeader className="border-border/50 border-b bg-muted/30 px-6 py-4">
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
                onBack={() => {}}
                onEmailChange={() => {}}
                onGoogleClick={() => {}}
                onNameChange={() => {}}
                onPasswordChange={() => {}}
                onSubmit={(event) => event.preventDefault()}
                onUsageChange={() => {}}
                password=""
                step="account"
                usage="explore"
              />
            ) : (
              <SignInFormView
                callbackHref="#"
                email=""
                googleEnabled
                onEmailChange={() => {}}
                onGoogleClick={() => {}}
                onPasswordChange={() => {}}
                onSubmit={(event) => event.preventDefault()}
                onUseDifferentEmail={() => {}}
                password=""
                step="email"
              />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
