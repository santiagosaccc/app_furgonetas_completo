# 🚛 Fleet Link v3.0 - Sistema de Control Logístico con IA

![Estado](https://img.shields.io/badge/Estado-Prototipo_Funcional-green)
![Tech](https://img.shields.io/badge/React-TypeScript-blue)
![AI](https://img.shields.io/badge/AI-Gemini_2.5-purple)

**Fleet Link** es una plataforma avanzada de comando y control para logística y seguridad de flotas. Integra mapas en tiempo real, inteligencia artificial generativa (Google Gemini) y simulación de sistemas de videovigilancia CCTV.

## 🚀 Características Principales

### 1. 🗺️ Rastreo GPS en Tiempo Real
- Visualización de unidades sobre mapa satelital (ESRI).
- Interpolación de movimiento fluida.
- Cálculo automático de distancias y tiempos de ruta.

### 2. 👁️ Videovigilancia (CCTV) con IA
- **Modo Simulación:** Generación de ruido estático y superposiciones de interfaz militar.
- **Modo Live:** Integración con Webcam local (`getUserMedia`).
- **Análisis Inteligente:** Botón "Analizar IA" que utiliza **Google Gemini 2.5** para generar reportes de seguridad tácticos basados en el estado del vehículo.

### 3. 💬 Asistente Táctico "Fleet AI"
- Chatbot flotante integrado.
- Capacidad de **Grounding** con Google Maps para buscar direcciones reales y obtener coordenadas GPS precisas.

### 4. 📱 Integración Android
- Protocolo de conexión para App Nativa (código fuente Kotlin incluido en `ANDROID_APP_CODE.md`).
- Simulación de recepción de datos de telemetría.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 18, TypeScript, Tailwind CSS.
- **Mapas:** Leaflet.js.
- **IA:** Google GenAI SDK (`@google/genai`).
- **Iconografía:** SVG nativos (Lucide style).

## 📂 Estructura del Proyecto

```bash
/
├── index.html            # Entry point
├── index.tsx             # Core Logic (React App)
├── metadata.json         # Permissions config
├── CAMERA_SETUP_GUIDE.md # Guía para configurar cámaras IP reales
├── ANDROID_APP_CODE.md   # Código fuente App Android (Kotlin)
└── PROJECT_DOCS.txt      # Documentación técnica general
```

## 🔧 Configuración

1. Clonar el repositorio.
2. Asegurarse de tener una `API_KEY` válida de Google Gemini.
3. El proyecto está diseñado para ejecutarse en entornos que soporten módulos ES6 directamente o mediante empaquetadores como Vite/Webpack.

---
*Desarrollado para demostración de capacidades de integración IA + IoT.*
