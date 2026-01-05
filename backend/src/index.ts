import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import * as dotenv from "dotenv";
import { db } from "./firebase";

dotenv.config();

const app = express();

// Middlewares básicos
app.use(express.json());
app.use(cors({ origin: "*" })); // Ajusta el dominio en producción
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 100,            // Máximo 100 requests por minuto
  })
);

// Ruta real con Firestore app.get("/api/furgonetas", async (req: Request, res: Response) => { try { const snapshot = await db.collection("furgonetas").get(); const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); res.json(data); } catch (error) { res.status(500).json({ error: "Error al obtener furgonetas" }); } });
// Ruta de prueba
app.get("/api/furgonetas", (req: Request, res: Response) => {
  res.json({ message: "Lista de furgonetas (demo)" });
});

// Puerto configurable desde .env
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Manejo de error si el puerto está ocupado
server.on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    const fallbackPort = PORT + 1;
    app.listen(fallbackPort, () => {
      console.log(
        `⚠️ Puerto ${PORT} ocupado, servidor corriendo en http://localhost:${fallbackPort}`
      );
    });
  } else {
    throw err;
  }
});


// Ruta real con Firestore
app.get("/api/furgonetas", async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("furgonetas").get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener furgonetas" });
  }
});

