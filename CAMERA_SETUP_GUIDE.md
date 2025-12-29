# GUÍA DE CONFIGURACIÓN DE CÁMARAS (CCTV)

Esta guía explica cómo pasar de la "Cámara Web/Simulada" actual a un sistema de cámaras IP reales (RTSP/HLS) y cómo pedirle a una IA que haga ese cambio.

---

## 1. Localización del Código
Todo el código relacionado con el video se encuentra en el archivo `index.tsx`, específicamente en el componente:

```typescript
const CameraFeed = ({ label, type, vanStatus, onAnalyze }: ...) => { ... }
```

## 2. Lenguaje y Tecnologías
Para configurar cámaras reales, necesitas saber que **los navegadores web NO reproducen RTSP (el protocolo estándar de cámaras de seguridad) directamente**.

Necesitas usar:
1.  **Lenguaje:** TypeScript / React.
2.  **Librería Intermedia:** `hls.js` (para streams HLS) o integrar un servidor de retransmisión como WebRTC.

---

## 3. PROMPT PARA CONFIGURACIÓN (Copiar y Pegar)

Si quieres que Copilot o yo modifiquemos el código para conectar cámaras reales, usa este prompt exacto. Él entenderá el contexto técnico necesario.

**--- INICIO DEL PROMPT ---**

> "Actúa como Ingeniero Senior de Frontend. Quiero modificar el componente `CameraFeed` en `index.tsx` para soportar cámaras de seguridad reales.
>
> 1.  Elimina la simulación de ruido estático y la webcam local actual.
> 2.  Modifica la interfaz `Van` para incluir una propiedad opcional `cameraUrl` (string).
> 3.  Implementa un reproductor de video capaz de leer streams HLS (.m3u8) o MP4 directos.
> 4.  Si la furgoneta tiene `cameraUrl`, reproduce ese video. Si no, muestra un mensaje de 'SEÑAL PERDIDA'.
> 5.  Usa etiquetas de video HTML5 estándar.
> 6.  Manten el botón de 'ANALIZAR IA', pero ahora quiero que capture un frame real del video (usando un canvas oculto), lo convierta a Base64 y se lo envíe a Gemini Pro Vision para un análisis real de lo que se ve."

**--- FIN DEL PROMPT ---**

---

## 4. Estructura de Datos Necesaria

Para que las cámaras funcionen tras aplicar el cambio anterior, tus datos en `index.tsx` (dentro de `initialVans`) deberán verse así:

```typescript
// Ejemplo de configuración futura
const initialVans = [
  {
    id: "v-1",
    name: "Unidad 01",
    // ... otros datos ...
    cameraUrl: "https://midominio.com/streams/camara01.m3u8" // URL real de la cámara
  }
]
```

## 5. Captura de Frames para IA (Visión Real)

Para que la IA vea realmente lo que pasa, el código debe hacer esto (incluido en la petición del prompt de arriba):

1.  Crear un elemento `<canvas>` en memoria.
2.  Dibujar la imagen actual del `<video>` en el canvas: `ctx.drawImage(videoElement, 0, 0)`.
3.  Obtener el Base64: `canvas.toDataURL('image/jpeg')`.
4.  Enviar ese string a `ai.models.generateContent` usando un modelo que soporte imágenes (como `gemini-2.5-flash` o `gemini-pro-vision`).
