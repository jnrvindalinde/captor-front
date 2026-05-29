"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";

const initial: LoginState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="auth-form" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <label className="contact-field">
        <span className="contact-field__label">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(state.fieldErrors?.email)}
        />
        {state.fieldErrors?.email?.[0] && (
          <span className="auth-form__error">{state.fieldErrors.email[0]}</span>
        )}
      </label>

      <label className="contact-field">
        <span className="contact-field__label">Password</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </label>

      {state.error && !state.fieldErrors && (
        <p className="auth-form__error auth-form__error--top">{state.error}</p>
      )}

      <div className="auth-form__footer">
        <Button type="submit" variant="primary" size="md" withArrow disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </div>
    </form>
  );
}
