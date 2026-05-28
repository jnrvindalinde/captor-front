import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in · Captor",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(["admin", "super_admin"].includes(user.role) ? "/admin" : "/");
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <header className="auth-card__head">
          <span className="kicker">Captor</span>
          <h1 className="h2 auth-card__title">
            Sign <span className="serif">in</span>
          </h1>
          <p className="auth-card__lede">
            Admin and client sign-in. We&apos;ll route you to the right place
            once you&apos;re in.
          </p>
        </header>
        <LoginForm />
      </section>
    </main>
  );
}
