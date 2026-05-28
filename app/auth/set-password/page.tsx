"use client";

import { Suspense } from "react";

import SetPasswordForm from "./SetPasswordForm";

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="portalLoading">Loading...</div>}>
      <SetPasswordForm />
    </Suspense>
  );
}
