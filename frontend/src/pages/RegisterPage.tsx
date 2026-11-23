import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Link, Navigate, useNavigate } from "react-router";
import { registerSchema } from "../lib/quest-schema";
import { signUp, useSession } from "../lib/auth-client";
import { FieldError } from "../components/ui";
import { SocialButtons } from "../components/SocialButtons";

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  if (session) return <Navigate to="/quests" replace />;

  async function onSubmit(values: RegisterValues) {
    setServerError("");
    const { error } = await signUp.email({ name: values.name, email: values.email, password: values.password });
    if (error) {
      setServerError(
        error.code === "USER_ALREADY_EXISTS" || error.status === 422
          ? "Ya existe una cuenta con ese email"
          : (error.message ?? "No se pudo crear la cuenta"),
      );
      return;
    }
    navigate("/quests", { replace: true });
  }

  return (
    <div className="auth-card">
      <h1>Crear personaje</h1>
      <p className="muted">Arrancás como Novato. El resto depende de vos.</p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="form">
        <label>
          Nombre
          <input autoComplete="name" {...register("name")} aria-invalid={!!errors.name} />
          <FieldError message={errors.name?.message} />
        </label>
        <label>
          Email
          <input type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} />
          <FieldError message={errors.email?.message} />
        </label>
        <label>
          Contraseña
          <input type="password" autoComplete="new-password" {...register("password")} aria-invalid={!!errors.password} />
          <FieldError message={errors.password?.message} />
        </label>
        <label>
          Confirmar contraseña
          <input
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </label>
        {serverError && <div className="alert">{serverError}</div>}
        <button className="btn btn-lg btn-block" disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear cuenta"}
        </button>
      </form>
      <div className="divider">o</div>
      <SocialButtons redirect="/quests" />
      <p className="muted center">
        ¿Ya tenés cuenta? <Link to="/login">Entrá</Link>
      </p>
    </div>
  );
}
