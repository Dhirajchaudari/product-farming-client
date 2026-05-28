"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { gqlRequest } from "@/lib/graphql";

type RegisterStep = "email" | "otp" | "password";

interface AuthOperationResult {
  success: boolean;
  message?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleRequestOtp(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const data = await gqlRequest<{ requestRegistrationOtp: AuthOperationResult }>(
        `mutation RequestOtp($email: String!) {
          requestRegistrationOtp(email: $email) { success message }
        }`,
        { email }
      );
      if (!data.requestRegistrationOtp.success) {
        throw new Error(data.requestRegistrationOtp.message ?? "Failed to send OTP");
      }
      setInfo("Verification code sent to your email.");
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const data = await gqlRequest<{ verifyRegistrationOtp: AuthOperationResult }>(
        `mutation VerifyOtp($email: String!, $otp: String!) {
          verifyRegistrationOtp(email: $email, otp: $otp) { success message }
        }`,
        { email, otp }
      );
      if (!data.verifyRegistrationOtp.success) {
        throw new Error("Invalid or expired OTP.");
      }
      setInfo("Email verified. Set your password to finish.");
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSetupPassword(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const data = await gqlRequest<{ setupPassword: AuthOperationResult }>(
        `mutation SetupPassword($email: String!, $otp: String!, $password: String!) {
          setupPassword(email: $email, otp: $otp, password: $password) { success message }
        }`,
        { email, otp, password }
      );
      if (!data.setupPassword.success) {
        const msg = data.setupPassword.message === "PASSWORD_TOO_SHORT"
          ? "Password is too short."
          : "Could not set password. OTP may have expired.";
        throw new Error(msg);
      }
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password setup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authPage">
      <section className="authHero">
        <p className="badge">HR Onboarding</p>
        <h1>Create your PayrollPilot account</h1>
        <p className="subtitle">Verify your email with OTP, then set a secure password.</p>
        <div className="stepper">
          <span className={step === "email" ? "step active" : "step"}>1. Email</span>
          <span className={step === "otp" ? "step active" : "step"}>2. OTP</span>
          <span className={step === "password" ? "step active" : "step"}>3. Password</span>
        </div>
      </section>
      <section className="authPanel card">
        {step === "email" ? (
          <form onSubmit={handleRequestOtp}>
            <h2>Register as HR</h2>
            <p className="muted">We will email a one-time verification code.</p>
            <label htmlFor="email">Work email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hr@company.com"
              required
            />
            <button type="submit" className="fullWidth" disabled={loading}>
              {loading ? "Sending..." : "Send verification code"}
            </button>
          </form>
        ) : null}

        {step === "otp" ? (
          <form onSubmit={handleVerifyOtp}>
            <h2>Verify email</h2>
            <p className="muted">Enter the 6-digit code sent to {email}</p>
            <label htmlFor="otp">OTP code</label>
            <input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              required
            />
            <button type="submit" className="fullWidth" disabled={loading}>
              {loading ? "Verifying..." : "Verify code"}
            </button>
          </form>
        ) : null}

        {step === "password" ? (
          <form onSubmit={handleSetupPassword}>
            <h2>Set password</h2>
            <p className="muted">Minimum 8 characters recommended.</p>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" className="fullWidth" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        ) : null}

        {error ? <p className="error">{error}</p> : null}
        {info ? <p className="info">{info}</p> : null}
        <p className="authFooterText">
          Already registered? <Link href="/login">Sign in</Link>
        </p>
      </section>
    </div>
  );
}
