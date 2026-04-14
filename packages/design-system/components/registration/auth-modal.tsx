"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@repo/design-system/components/ui/dialog";
import { SignUpFormView } from "./sign-up/sign-up-form";
import { SignInFormView } from "./sign-in/sign-in-form";

export type AuthModalType = "sign-in" | "sign-up";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: AuthModalType;
}

export const AuthModal = ({ isOpen, onClose, type }: AuthModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[32.5rem] p-0 overflow-hidden border-border/80 bg-background">
        <DialogHeader className="px-6 py-4 border-b border-border/50 bg-muted/30">
          <DialogTitle className="text-xl">
            {type === "sign-up" ? "Create an account" : "Welcome back"}
          </DialogTitle>
          <DialogDescription>
            {type === "sign-up" 
              ? "Join Cerramos and start managing your business." 
              : "Sign in to access your dashboard."}
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          {type === "sign-up" ? (
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
              onUsageChange={() => {}}
              onSubmit={(e) => e.preventDefault()}
              onGoogleClick={() => {}}
            />
          ) : (
            <SignInFormView
              callbackHref="#"
              email=""
              googleEnabled
              password=""
              step="email"
              onEmailChange={() => {}}
              onPasswordChange={() => {}}
              onSubmit={(e) => e.preventDefault()}
              onGoogleClick={() => {}}
              onUseDifferentEmail={() => {}}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
