import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams } from "react-router";
import { api, ApiError } from "../../lib/api";
import { CATEGORIES, CATEGORY_INFO, makeQuestFormSchema, type QuestFormValues } from "../../lib/quest-schema";
import { FieldError, Spinner } from "../../components/ui";

const EMPTY: QuestFormValues = {
  title: "",
  description: "",
  category: "gastronomia",
  neighborhood: "",
  difficulty: 1,
  xp: 100,
  estimatedMinutes: 60,
  deadline: "",
  isNight: false,
  isActive: true,
  imageUrl: "",
};

export function QuestFormPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [serverError, setServerError] = useState("");
  const schema = useMemo(() => makeQuestFormSchema(isNew), [isNew]);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<QuestFormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (!id) return;
    api
      .getQuest(id)
      .then((q) => {
        reset({
          title: q.title,
          description: q.description,
          category: q.category,
          neighborhood: q.neighborhood,
          difficulty: q.difficulty,
          xp: q.xp,
          estimatedMinutes: q.estimatedMinutes,
          deadline: q.deadline ? q.deadline.slice(0, 10) : "",
          isNight: q.isNight,
          isActive: q.isActive,
          imageUrl: q.imageUrl ?? "",
        });
        setLoading(false);
      })
      .catch(() => {
        setServerError("No se encontró la misión");
        setLoading(false);
      });
  }, [id, reset]);

  async function onSubmit(values: QuestFormValues) {
    setServerError("");
    const payload = {
      ...values,
      deadline: values.deadline ? new Date(`${values.deadline}T23:59:59`).toISOString() : null,
    };
    if (isNew && !payload.deadline) delete (payload as Partial<typeof payload>).deadline;
    try {
      if (isNew) await api.createQuest(payload);
      else await api.updateQuest(id!, payload);
      navigate("/admin");
    } catch (e) {
      if (e instanceof ApiError) {
        setServerError(e.message);
        // Muestra debajo de cada campo los errores 400 que devuelve la API.
        Object.entries(e.details ?? {}).forEach(([field, msgs]) => {
          if (msgs?.length && field in EMPTY) {
            setError(field as keyof QuestFormValues, { type: "server", message: msgs[0] });
          }
        });
      } else {
        setServerError("No se pudo guardar");
      }
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="form-page">
      <Link to="/admin" className="back-link">
        ← Volver al panel
      </Link>
      <h1>{isNew ? "Nueva misión" : "Editar misión"}</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="form form-grid">
        <label className="span-2">
          Título
          <input {...register("title")} aria-invalid={!!errors.title} placeholder="El lomito definitivo" />
          <FieldError message={errors.title?.message} />
        </label>
        <label className="span-2">
          Descripción
          <textarea rows={4} {...register("description")} aria-invalid={!!errors.description} />
          <FieldError message={errors.description?.message} />
        </label>
        <label>
          Categoría
          <select {...register("category")} aria-invalid={!!errors.category}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_INFO[c].emoji} {CATEGORY_INFO[c].label}
              </option>
            ))}
          </select>
          <FieldError message={errors.category?.message} />
        </label>
        <label>
          Barrio
          <input {...register("neighborhood")} aria-invalid={!!errors.neighborhood} placeholder="Pichincha" />
          <FieldError message={errors.neighborhood?.message} />
        </label>
        <label>
          Dificultad (1–5)
          <input type="number" min={1} max={5} {...register("difficulty", { valueAsNumber: true })} aria-invalid={!!errors.difficulty} />
          <FieldError message={errors.difficulty?.message} />
        </label>
        <label>
          XP (10–1000)
          <input type="number" min={10} max={1000} step={10} {...register("xp", { valueAsNumber: true })} aria-invalid={!!errors.xp} />
          <FieldError message={errors.xp?.message} />
        </label>
        <label>
          Duración estimada (minutos)
          <input
            type="number"
            min={5}
            max={600}
            {...register("estimatedMinutes", { valueAsNumber: true })}
            aria-invalid={!!errors.estimatedMinutes}
          />
          <FieldError message={errors.estimatedMinutes?.message} />
        </label>
        <label>
          Fecha límite (opcional, si es de temporada)
          <input type="date" {...register("deadline")} aria-invalid={!!errors.deadline} />
          <FieldError message={errors.deadline?.message} />
        </label>
        <label className="span-2">
          URL de imagen (opcional)
          <input type="url" {...register("imageUrl")} aria-invalid={!!errors.imageUrl} placeholder="https://..." />
          <FieldError message={errors.imageUrl?.message} />
        </label>
        <label className="check">
          <input type="checkbox" {...register("isNight")} /> 🌙 Misión nocturna
        </label>
        <label className="check">
          <input type="checkbox" {...register("isActive")} /> Activa (visible en el tablero)
        </label>
        {serverError && <div className="alert span-2">{serverError}</div>}
        <div className="span-2 form-actions">
          <Link to="/admin" className="btn btn-ghost">
            Cancelar
          </Link>
          <button className="btn" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : isNew ? "Publicar misión" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
