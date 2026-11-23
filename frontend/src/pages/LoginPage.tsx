import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { loginSchema } from "../lib/quest-schema";
import { signIn, useSession } from "../lib/auth-client";
import { FieldError } from "../components/ui";
import { SocialButtons } from "../components/SocialButtons";

type LoginValues = z.infer<typeof loginSchema>;

/** Evita redirecciones a otros sitios: solo rutas internas. */
export function safeRedirect(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/quests";
}

export function LoginPage() {
  const [params] = useSearchParams();
  const redirect = safeRedirect(params.get("redirect"));
  const navigate = useNavigate();
  const { data: session } = useSession();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  if (session) return <Navigate to={redirect} replace />;

  async function onSubmit(values: LoginValues) {
    setServerError("");
    const { error } = await signIn.email({ email: values.email, password: values.password });
    if (error) {
      setServerError(error.status === 401 ? "Email o contraseña incorrectos" : (error.message ?? "No se pudo iniciar sesión"));
      return;
    }
    navigate(redirect, { replace: true });
  }

  return (
    <div className="auth-card">
      <h1>Entrar</h1>
      <p className="muted">Retomá tu partida y seguí sumando XP.</p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="form">
        <label>
          Email
          <input type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} />
          <FieldError message={errors.email?.message} />
        </label>
        <label>
          Contraseña
          <input type="password" autoComplete="current-password" {...register("password")} aria-invalid={!!errors.password} />
          <FieldError message={errors.password?.message} />
        </label>
        {serverError && <div className="alert">{serverError}</div>}
        <button className="btn btn-lg btn-block" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <div className="divider">o</div>
      <SocialButtons redirect={redirect} />
      <p className="muted center">
        ¿No tenés personaje? <Link to="/register">Creá uno</Link>
      </p>
    </div>
  );
}
