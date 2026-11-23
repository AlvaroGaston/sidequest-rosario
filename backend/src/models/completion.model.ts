import { Schema, Types, model } from "mongoose";

// Registro de "misión completada": cada usuario ve y borra solo los suyos.
const completionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    quest: { type: Types.ObjectId, ref: "Quest", required: true },
    // Copia de la XP al momento de completar, para que el ranking no cambie si se edita la misión.
    xp: { type: Number, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret._id;
        return ret;
      },
    },
  },
);

completionSchema.index({ userId: 1, quest: 1 }, { unique: true });

export const CompletionModel = model("Completion", completionSchema);
