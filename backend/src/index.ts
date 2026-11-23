import { env } from "./config/env.js";
import { app } from "./app.js";
import { connectDb } from "./db.js";

await connectDb();

app.listen(env.PORT, () => {
  console.log(`🚀 SideQuest API escuchando en http://localhost:${env.PORT}`);
});
