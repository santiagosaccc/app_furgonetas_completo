"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var helmet_1 = require("helmet");
var express_rate_limit_1 = require("express-rate-limit");
var dotenv = require("dotenv"); // <-- cambio aquí
dotenv.config();
var app = express();
var PORT = process.env.PORT || 8080;
// Seguridad básica
app.use((0, helmet_1.default)());
app.use(cors({ origin: "*" })); // Ajusta el dominio en producción
app.use(express.json());
// Rate limiting (máx 100 requests cada 15 min por IP)
var limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);
// Endpoint de prueba
app.get("/api/furgonetas", function (req, res) {
    res.json([
        { id: 1, placa: "ABC123", estado: "OK" },
        { id: 2, placa: "XYZ789", estado: "Mantenimiento" },
    ]);
});
app.listen(PORT, function () {
    console.log("Servidor corriendo en http://localhost:".concat(PORT));
});
