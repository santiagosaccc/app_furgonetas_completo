import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
interface Stop {
  id: string;
  lat: number;
  lng: number;
  address?: string; 
}

interface Van {
  id: string;
  name: string; 
  plate: string;
  lat: number;
  lng: number;
  status: 'moving' | 'idle' | 'stopped';
  battery: number;
  speed: number;
  route: Stop[];
  isRealDevice?: boolean;
  lastUpdate?: number;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

// --- Icons (SVG) ---
const SatelliteIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2 L3 14 h9 l-1 8 10 -12 h-9 l1 -8z" />
  </svg>
);

const VanIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
);

const AndroidLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.523 15.3414C17.523 15.3414 17.563 15.4374 17.513 15.5414C17.387 15.8014 16.963 16.7114 16.29 16.7114C15.717 16.7114 15.544 16.3264 15.544 16.3264L14.07 13.6264H9.95L8.476 16.3264C8.476 16.3264 8.303 16.7114 7.73 16.7114C7.057 16.7114 6.633 15.8014 6.507 15.5414C6.457 15.4374 6.497 15.3414 6.497 15.3414L7.545 13.2734C5.462 12.1804 4.095 10.0384 4 7.6264H20.02C19.925 10.0384 18.558 12.1804 16.475 13.2734L17.523 15.3414ZM7.005 5.2344L8.528 2.5964C8.583 2.5004 8.55 2.3784 8.454 2.3234C8.359 2.2694 8.236 2.3014 8.181 2.3974L6.645 5.0564C5.111 4.3634 3.42 4.1954 2 4.6064V7.6264C2.053 6.6494 2.404 5.7534 3.011 5.0354C4.192 3.6364 5.922 2.8944 7.765 3.1094L7.005 5.2344ZM17.485 2.5964L19.008 5.2344L18.248 3.1094C20.092 2.8944 21.821 3.6364 23.002 5.0354C23.61 5.7534 23.96 6.6494 24.014 7.6264V4.6064C22.593 4.1954 20.902 4.3634 19.369 5.0564L17.832 2.3974C17.778 2.3014 17.655 2.2694 17.559 2.3234C17.464 2.3784 17.43 2.5004 17.485 2.5964ZM7.5 9.6264C7.224 9.6264 7 9.8504 7 10.1264C7 10.4024 7.224 10.6264 7.5 10.6264C7.776 10.6264 8 10.4024 8 10.1264C8 9.8504 7.776 9.6264 7.5 9.6264ZM16.5 9.6264C16.224 9.6264 16 9.8504 16 10.1264C16 10.4024 16.224 10.6264 16.5 10.6264C16.776 10.6264 17 10.4024 17 10.1264C17 9.8504 16.776 9.6264 16.5 9.6264Z"/>
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const LocateIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
  </svg>
);

const MapViewIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const EditIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const FlagIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
        <line x1="4" y1="22" x2="4" y2="15"></line>
    </svg>
);

const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const MapPinPlusIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
        <line x1="12" y1="5" x2="12" y2="15"></line>
        <line x1="7" y1="10" x2="17" y2="10"></line>
    </svg>
);

const CodeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
);

const CameraIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
    </svg>
);

const EyeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const CameraOffIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="1" x2="23" y2="23"></line>
        <path d="M21 21l-2-2m-3.28-3.28A6 6 0 0 0 12 14c-4 0-7.33-3.23-9-6a12.16 12.16 0 0 1 2.22-3.22L3 2.5"></path>
        <path d="M15.73 15.73A3 3 0 0 1 12 17c-1.66 0-3-1.34-3-3a3 3 0 0 1 .27-1.27"></path>
        <path d="M21 8c-1.67 2.77-5 6-9 6a9 9 0 0 1-2.22-.27"></path>
        <path d="M1 1l22 22"></path>
    </svg>
);

const VideoIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"></polygon>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
    </svg>
);

const BoxIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
);

const UserIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const ShieldCheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="M9 12l2 2 4-4"></path>
    </svg>
);

// --- Helpers ---
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c; 
};

// --- Camera Feed Component ---
const CameraFeed = ({ label, type, vanStatus, onAnalyze }: { label: string, type: 'cargo' | 'cabin', vanStatus: string, onAnalyze: (type: string) => Promise<string> }) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [isLive, setIsLive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const toggleCamera = async () => {
        if (isLive) {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            setIsLive(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setIsLive(true);
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("No se pudo acceder a la cámara. Verifique permisos.");
            }
        }
    };

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);
    
    // Ensure video srcObject is set if switching back to live view or re-rendering
    useEffect(() => {
        if (isLive && videoRef.current && streamRef.current) {
             videoRef.current.srcObject = streamRef.current;
        }
    }, [isLive]);

    const handleAnalyze = async () => {
        setAnalyzing(true);
        setReport(null);
        const result = await onAnalyze(type);
        setReport(result);
        setAnalyzing(false);
    };

    return (
        <div className="relative bg-black border border-zinc-800 rounded-lg overflow-hidden group mb-3 shadow-lg">
            {/* Header overlay */}
            <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className={`text-[10px] font-mono ${isLive ? 'text-green-500' : 'text-red-500'} font-bold tracking-widest shadow-black drop-shadow-md`}>
                    {isLive ? 'LIVE' : 'REC'}
                </span>
            </div>
            
            {/* Camera Toggle Button */}
             <button 
                onClick={toggleCamera}
                className="absolute top-2 right-2 z-20 bg-black/50 hover:bg-zinc-700 text-white p-1 rounded backdrop-blur-sm transition-colors"
                title={isLive ? "Detener Cámara Real" : "Activar Cámara Real"}
            >
                {isLive ? <CameraOffIcon className="w-3 h-3" /> : <VideoIcon className="w-3 h-3" />}
            </button>

            <div className="absolute top-8 right-2 z-10 text-[10px] font-mono text-zinc-400 bg-black/50 px-1 rounded pointer-events-none">
                {label}
            </div>
            <div className="absolute bottom-2 left-2 z-10 text-[9px] font-mono text-zinc-500 pointer-events-none">
                {new Date().toLocaleTimeString()}
            </div>

            {/* The Feed Content */}
            <div className="h-32 w-full bg-zinc-900 relative flex items-center justify-center">
                {isLive ? (
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover" 
                    />
                ) : (
                    <>
                        {/* Grid lines */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(50,50,50,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(50,50,50,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                        
                        {/* Simulated Content Icon */}
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-800 transition-colors duration-500 group-hover:text-zinc-700">
                            {type === 'cargo' ? <BoxIcon size={48}/> : <UserIcon size={48}/>}
                        </div>
                        
                        {/* Static Noise Overlay (CSS) */}
                        <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                        }}></div>
                        
                        {/* Scanline */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[20%] w-full animate-[scan_3s_linear_infinite] pointer-events-none"></div>
                    </>
                )}
            </div>

            {/* Analysis Overlay Result */}
            {report && (
                 <div className="absolute inset-0 bg-black/80 backdrop-blur-sm p-3 flex flex-col justify-center items-center text-center animate-fade-in z-20">
                     <ShieldCheckIcon className="text-green-500 w-8 h-8 mb-2" />
                     <div className="text-[10px] text-green-400 font-mono leading-tight">{report}</div>
                     <button onClick={() => setReport(null)} className="mt-2 text-[9px] text-zinc-500 underline">Cerrar</button>
                 </div>
            )}

            {/* Analysis Button */}
            {!report && (
                <button 
                    onClick={() => {
                         setAnalyzing(true);
                         onAnalyze(type).then((res: any) => {
                             setReport(res);
                             setAnalyzing(false);
                         });
                    }}
                    disabled={analyzing}
                    className="absolute bottom-2 right-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 text-[9px] font-bold px-2 py-1 rounded border border-blue-500/30 backdrop-blur-md flex items-center gap-1 transition-all z-20 disabled:opacity-50"
                >
                    {analyzing ? (
                        <span className="animate-pulse">ANALIZANDO...</span>
                    ) : (
                        <><EyeIcon className="w-3 h-3" /> ANALIZAR IA</>
                    )}
                </button>
            )}
            
            <style>{`
                @keyframes scan {
                    0% { top: -20%; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};

// --- Gemini AI Helper ---
const GeminiHelper = ({ userLocation, onClose }: { userLocation: { lat: number; lng: number } | null, onClose: () => void }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Analista de Flota en línea. ¿Necesitas un reporte de zona o estado?' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const modelId = "gemini-2.5-flash"; 
      
      const tools = [{ googleMaps: {} }];
      let toolConfig = undefined;

      if (userLocation) {
        toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.lat,
              longitude: userLocation.lng
            }
          }
        };
      }

      const response = await ai.models.generateContent({
        model: modelId,
        contents: userMsg,
        config: {
          tools: tools,
          toolConfig: toolConfig,
          systemInstruction: "Eres 'Fleet AI', un asistente táctico militar/logístico. Respuestas ultra-cortas y precisas. Enfócate en coordenadas, tráfico y estado de vehículos. Si no sabes algo, di 'Negativo'.",
        }
      });

      const text = response.text || "Sin datos de telemetría.";
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      let finalText = text;
      
      if (groundingChunks) {
        finalText += "\n\nREFERENCIAS:";
        groundingChunks.forEach((chunk: any) => {
           if (chunk.web?.uri) {
             finalText += `\n• [${chunk.web.title}](${chunk.web.uri})`;
           }
        });
      }

      setMessages(prev => [...prev, { role: 'model', text: finalText }]);

    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'ERR: Conexión interrumpida.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/80 backdrop-blur-xl border border-zinc-700/50 overflow-hidden shadow-2xl animate-fade-in">
      <div className="p-3 border-b border-zinc-700/50 flex justify-between items-center bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse"></div>
          <span className="font-mono text-xs font-bold text-cyan-400 tracking-widest">FLEET AI V2.5</span>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
          <CloseIcon />
        </button>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs font-mono leading-relaxed shadow-lg ${
              m.role === 'user' 
                ? 'bg-blue-600/90 text-white border border-blue-500/50' 
                : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700'
            }`}>
              {m.text.split('\n').map((line, l) => (
                <div key={l} className="mb-0.5 last:mb-0">{line}</div>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-cyan-500/70 font-mono px-2 animate-pulse">
            <SatelliteIcon className="w-3 h-3 spin-slow" /> Procesando datos satelitales...
          </div>
        )}
      </div>

      <div className="p-3 bg-zinc-900/80 border-t border-zinc-700/50 flex gap-2">
        <input 
          className="flex-1 bg-black/50 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder-zinc-600"
          placeholder="Comando..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button 
          onClick={sendMessage}
          className="bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-400 p-2 rounded-lg transition-colors disabled:opacity-50"
          disabled={loading}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
};

// --- Main Application ---
const App = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{[key: string]: any}>({});
  const routeLayerRef = useRef<any>(null); 
  
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [vans, setVans] = useState<Van[]>([]);
  const [selectedVanId, setSelectedVanId] = useState<string | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>("");
  
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [showAndroidModal, setShowAndroidModal] = useState(false);
  
  // Management State
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // Initialize Data
  useEffect(() => {
    // Valencia Coordinates: Approx 39.4699° N, 0.3763° W
    const initialVans: Van[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `v-${i + 1}`,
      name: i === 0 ? "UNIDAD DE PRUEBA (CÁMARA)" : `Conductor ${i + 1}`,
      plate: `ABC-${100 + i}`,
      lat: 39.4699 + (Math.random() - 0.5) * 0.08,
      lng: -0.3763 + (Math.random() - 0.5) * 0.08,
      status: Math.random() > 0.2 ? 'moving' : (Math.random() > 0.5 ? 'idle' : 'stopped'),
      battery: Math.floor(Math.random() * 40) + 60,
      speed: Math.floor(Math.random() * 60) + 20,
      route: [],
      isRealDevice: false
    }));
    setVans(initialVans);
    // Auto-select the first van so the user sees the camera feature immediately
    setSelectedVanId('v-1');
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Set View to Valencia
    const map = (window as any).L.map(mapContainerRef.current, {
      zoomControl: false, 
      attributionControl: false
    }).setView([39.4699, -0.3763], 13);
    
    (window as any).L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri'
    }).addTo(map);
    
    (window as any).L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}').addTo(map);

    // FeatureGroup for route lines and stop markers
    routeLayerRef.current = (window as any).L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Location Tracking (Admin/Dashboard Location)
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          const userIcon = (window as any).L.divIcon({
            className: 'user-marker-pulse',
            html: `<div style="position:relative; width:20px; height:20px;">
                    <div style="position:absolute; inset:0; background:#3b82f6; border-radius:50%; border:3px solid white; z-index:2; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>
                    <div style="position:absolute; inset:-10px; background:#3b82f6; border-radius:50%; opacity:0.3; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                   </div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          if (markersRef.current['user']) {
            markersRef.current['user'].setLatLng([latitude, longitude]);
          } else {
            const marker = (window as any).L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
            markersRef.current['user'] = marker;
          }
        },
        (error) => console.warn("GPS Signal Lost"),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Map Click Handler Effect
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const handleMapClick = (e: any) => {
        if (isAddingStop && selectedVanId) {
            const { lat, lng } = e.latlng;
            handleAddStop(lat, lng, "Ubicación en mapa");
        }
    };

    mapInstanceRef.current.on('click', handleMapClick);

    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.style.cursor = isAddingStop ? 'crosshair' : 'grab';
    }

    return () => {
        mapInstanceRef.current?.off('click', handleMapClick);
    };
  }, [isAddingStop, selectedVanId, vans]);

  // Route Visualization Effect
  useEffect(() => {
      if (!mapInstanceRef.current || !routeLayerRef.current) return;
      
      routeLayerRef.current.clearLayers();

      const van = vans.find(v => v.id === selectedVanId);
      if (van && van.route.length > 0) {
          // Draw Line
          const latLngs = [[van.lat, van.lng], ...van.route.map(s => [s.lat, s.lng])];
          (window as any).L.polyline(latLngs, {
              color: '#3b82f6',
              weight: 4,
              opacity: 0.7,
              dashArray: '10, 10',
              lineCap: 'round'
          }).addTo(routeLayerRef.current);

          // Draw Stop Markers
          van.route.forEach((stop, index) => {
              const stopIcon = (window as any).L.divIcon({
                  className: 'stop-marker',
                  html: `<div style="background:#ef4444; color:white; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.5);">${index + 1}</div>`,
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
              });
              
              const marker = (window as any).L.marker([stop.lat, stop.lng], { icon: stopIcon }).addTo(routeLayerRef.current);
              if (stop.address) {
                  marker.bindPopup(`<div class="text-xs font-sans p-1 text-center"><b>Parada ${index + 1}</b><br/>${stop.address}</div>`);
              }
          });
      }

  }, [selectedVanId, vans]);

  // Simulation Loop
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    // Custom Markers
    const getVanIcon = (van: Van, selected: boolean) => {
      // Real devices (Native Android) are Blue, simulated are Green/Amber/Red
      let color = van.isRealDevice ? '#3b82f6' : (van.status === 'moving' ? '#10b981' : (van.status === 'idle' ? '#f59e0b' : '#ef4444'));
      
      const size = selected ? 32 : 24;
      const border = selected ? '2px solid white' : '2px solid rgba(255,255,255,0.8)';
      const shadow = selected ? `0 0 20px ${color}` : '0 2px 5px rgba(0,0,0,0.5)';
      
      // Icon shape: Android vs Van
      const iconSvg = van.isRealDevice 
        ? `<svg width="${size * 0.6}" height="${size * 0.6}" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17.523 15.3414C17.523 15.3414 17.563 15.4374 17.513 15.5414C17.387 15.8014 16.963 16.7114 16.29 16.7114C15.717 16.7114 15.544 16.3264 15.544 16.3264L14.07 13.6264H9.95L8.476 16.3264C8.476 16.3264 8.303 16.7114 7.73 16.7114C7.057 16.7114 6.633 15.8014 6.507 15.5414C6.457 15.4374 6.497 15.3414 6.497 15.3414L7.545 13.2734C5.462 12.1804 4.095 10.0384 4 7.6264H20.02C19.925 10.0384 18.558 12.1804 16.475 13.2734L17.523 15.3414ZM7.005 5.2344L8.528 2.5964C8.583 2.5004 8.55 2.3784 8.454 2.3234C8.359 2.2694 8.236 2.3014 8.181 2.3974L6.645 5.0564C5.111 4.3634 3.42 4.1954 2 4.6064V7.6264C2.053 6.6494 2.404 5.7534 3.011 5.0354C4.192 3.6364 5.922 2.8944 7.765 3.1094L7.005 5.2344ZM17.485 2.5964L19.008 5.2344L18.248 3.1094C20.092 2.8944 21.821 3.6364 23.002 5.0354C23.61 5.7534 23.96 6.6494 24.014 7.6264V4.6064C22.593 4.1954 20.902 4.3634 19.369 5.0564L17.832 2.3974C17.778 2.3014 17.655 2.2694 17.559 2.3234C17.464 2.3784 17.43 2.5004 17.485 2.5964ZM7.5 9.6264C7.224 9.6264 7 9.8504 7 10.1264C7 10.4024 7.224 10.6264 7.5 10.6264C7.776 10.6264 8 10.4024 8 10.1264C8 9.8504 7.776 9.6264 7.5 9.6264ZM16.5 9.6264C16.224 9.6264 16 9.8504 16 10.1264C16 10.4024 16.224 10.6264 16.5 10.6264C16.776 10.6264 17 10.4024 17 10.1264C17 9.8504 16.776 9.6264 16.5 9.6264Z"/></svg>`
        : `<svg width="${size * 0.6}" height="${size * 0.6}" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`;

      return (window as any).L.divIcon({
        className: 'van-marker',
        html: `<div style="
          background-color: ${color}; 
          width: ${size}px; height: ${size}px; 
          border-radius: 8px; 
          border: ${border};
          display: flex; align-items: center; justify-content: center; 
          box-shadow: ${shadow};
          transition: all 0.3s ease;
          color: black;
        ">
          ${iconSvg}
        </div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
      });
    };

    const interval = setInterval(() => {
      setVans(prevVans => {
        return prevVans.map(van => {
          if (van.status === 'stopped') return van;
          if (van.isRealDevice) return van; // Real Android devices update via socket/API (simulated below)

          const moveLat = (Math.random() - 0.5) * 0.0008;
          const moveLng = (Math.random() - 0.5) * 0.0008;
          
          const newVan = {
            ...van,
            lat: van.lat + moveLat,
            lng: van.lng + moveLng,
            speed: van.status === 'moving' ? Math.floor(Math.random() * 20) + 30 : 0
          };

          return newVan;
        });
      });
    }, 1500);

    // Update markers
    vans.forEach(van => {
        if (markersRef.current[van.id]) {
            markersRef.current[van.id].setLatLng([van.lat, van.lng]);
            markersRef.current[van.id].setIcon(getVanIcon(van, van.id === selectedVanId));
            markersRef.current[van.id].setZIndexOffset(van.id === selectedVanId ? 1000 : 0);
        } else if (mapInstanceRef.current) {
            const marker = (window as any).L.marker([van.lat, van.lng], { 
              icon: getVanIcon(van, false) 
            }).addTo(mapInstanceRef.current);
            
            marker.on('click', () => {
              setSelectedVanId(van.id);
              mapInstanceRef.current?.flyTo([van.lat, van.lng], 16, { animate: true, duration: 1 });
            });
            
            markersRef.current[van.id] = marker;
        }
    });

    return () => clearInterval(interval);
  }, [mapInstanceRef.current, selectedVanId, vans]);

  // Actions
  const handleLocateUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16);
    }
  };

  const handleFitBounds = () => {
    if (vans.length > 0 && mapInstanceRef.current) {
      const group = new (window as any).L.featureGroup(Object.values(markersRef.current));
      mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  };

  const handleDeleteVan = (id: string) => {
      if (markersRef.current[id]) {
          markersRef.current[id].remove();
          delete markersRef.current[id];
      }
      setVans(prev => prev.filter(v => v.id !== id));
      if (selectedVanId === id) setSelectedVanId(null);
  };

  const handleUpdateVan = (id: string, field: 'name' | 'plate', value: string) => {
      setVans(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleAddStop = (lat: number, lng: number, address: string = "") => {
      setVans(prev => prev.map(v => {
          if (v.id === selectedVanId) {
              const newStop: Stop = {
                  id: Math.random().toString(36).substr(2, 9),
                  lat,
                  lng,
                  address
              };
              return { ...v, route: [...v.route, newStop] };
          }
          return v;
      }));
  };

  const handleAddAddress = async () => {
      if (!addressInput.trim() || !selectedVanId) return;
      setIsSearchingAddress(true);
      
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `Identifica las coordenadas GPS exactas (latitud y longitud) para: "${addressInput}".
          Responde ÚNICAMENTE con un objeto JSON válido (sin markdown) con esta estructura:
          { "lat": number, "lng": number, "address": "Dirección completa corregida y oficial" }`;

          const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash',
             contents: prompt,
             config: { tools: [{ googleMaps: {} }] }
          });

          let jsonString = response.text || "";
          jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();
          const data = JSON.parse(jsonString);
          
          if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
              handleAddStop(data.lat, data.lng, data.address || addressInput);
              if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([data.lat, data.lng], 16);
              }
              setAddressInput("");
          } else {
              throw new Error("Formato de respuesta inválido");
          }
      } catch (e) {
          console.error("Geocoding Error:", e);
          alert("No se pudo localizar esa dirección con Google Maps.");
      } finally {
          setIsSearchingAddress(false);
      }
  };

  const handleDeleteStop = (vanId: string, stopId: string) => {
      setVans(prev => prev.map(v => {
          if (v.id === vanId) {
              return { ...v, route: v.route.filter(s => s.id !== stopId) };
          }
          return v;
      }));
  };

  // Simulate receiving data from the Native App (Since we don't have a real WebSocket backend here)
  const simulateNativeConnection = () => {
      const newId = `android-native-${Math.floor(Math.random() * 1000)}`;
      const newDevice: Van = {
          id: newId,
          name: "Operario Android Nativo",
          plate: "AND-999",
          lat: 39.4699,
          lng: -0.3763,
          status: 'moving',
          battery: 92,
          speed: 45,
          route: [],
          isRealDevice: true
      };
      setVans(prev => [...prev, newDevice]);
      setShowAndroidModal(false);
      
      // Move this simulated android device
      setTimeout(() => {
         if (mapInstanceRef.current) mapInstanceRef.current.flyTo([39.4699, -0.3763], 15);
         setSelectedVanId(newId);
         alert("Dispositivo Android simulado conectado exitosamente.");
      }, 500);
  };

  const handleAnalyzeFeed = async (type: string) => {
    // Since we don't have a REAL video feed, we simulate the analysis by asking Gemini 
    // to generate a security report based on the simulated van status.
    if (!selectedVan) return "";

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const vanStatusDesc = `Furgoneta ${selectedVan.name} (ID: ${selectedVan.id}). Estado: ${selectedVan.status}. Batería: ${selectedVan.battery}%. Velocidad: ${selectedVan.speed}km/h. Ubicación: ${selectedVan.lat},${selectedVan.lng}.`;
        
        const context = type === 'cargo' 
            ? "Analiza la cámara de CARGA/INTERIOR. Supón que hay cajas de cartón apiladas y equipos electrónicos." 
            : "Analiza la cámara de CABINA/CONDUCTOR. Supón que el conductor está visible.";

        const prompt = `Actúa como un sistema de seguridad automatizado militar.
        Contexto del vehículo: ${vanStatusDesc}.
        Tarea: ${context}.
        Genera un reporte de seguridad ultra-breve (máx 15 palabras) en formato de log de sistema. 
        Ejemplos: "CARGA SEGURA. SIN MOVIMIENTOS ANÓMALOS." o "ALERTA: VIBRACIÓN EXCESIVA DETECTADA." o "CONDUCTOR ATENTO. CINTURÓN PUESTO."`;

        const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash',
             contents: prompt,
        });

        return response.text || "SISTEMA SIN DATOS.";
    } catch (e) {
        return "ERROR DE CONEXIÓN CON IA.";
    }
  };

  const selectedVan = vans.find(v => v.id === selectedVanId);

  const calculateLogisticTime = (van: Van) => {
      if (van.route.length === 0) return { dist: 0, time: 0, serviceTime: 0 };
      let totalDistKm = 0;
      let currentLat = van.lat;
      let currentLng = van.lng;
      van.route.forEach(stop => {
          totalDistKm += calculateDistance(currentLat, currentLng, stop.lat, stop.lng);
          currentLat = stop.lat;
          currentLng = stop.lng;
      });
      const travelTimeHours = totalDistKm / 40;
      const serviceTimeHours = van.route.length * 1; 
      return {
          dist: totalDistKm.toFixed(1),
          totalTime: (travelTimeHours + serviceTimeHours).toFixed(1),
          serviceTime: serviceTimeHours
      };
  };

  useEffect(() => {
    if (!selectedVan) {
        setCurrentAddress("");
        return;
    }
    setCurrentAddress("Identificando ubicación...");
    const fetchAddress = async () => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${selectedVan.lat}&lon=${selectedVan.lng}`, {
                headers: { 'User-Agent': 'VanTrackerDemo/1.0' }
            });
            if (!res.ok) throw new Error("Network error");
            const data = await res.json();
            const addr = data.address || {};
            const road = addr.road || addr.pedestrian || "";
            const number = addr.house_number ? `, ${addr.house_number}` : "";
            const city = addr.city || addr.town || addr.village || "";
            const fullAddress = road ? `${road}${number}, ${city}` : (data.display_name || "Coordenadas sin dirección mapeada");
            setCurrentAddress(fullAddress);
        } catch (e) {
            setCurrentAddress(`${selectedVan.lat.toFixed(6)}, ${selectedVan.lng.toFixed(6)}`);
        }
    };
    const timer = setTimeout(fetchAddress, 800);
    return () => clearTimeout(timer);
  }, [selectedVan?.lat, selectedVan?.lng, selectedVanId]);


  return (
    <div className="relative w-full h-full bg-black overflow-hidden font-sans select-none">
      
      {/* MAP LAYER */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-zinc-900" id="map" />

      {/* TOP BAR */}
      <div className="absolute top-4 left-0 right-0 flex justify-center z-30 pointer-events-none">
        <div className="pointer-events-auto bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-2 flex items-center gap-6 shadow-2xl transition-all hover:scale-105">
           <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${userLocation ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-amber-500 animate-pulse'}`}></div>
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                {userLocation ? 'CENTRO DE CONTROL' : 'GPS: BUSCANDO'}
              </span>
           </div>
           <div className="w-px h-3 bg-white/20"></div>
           <div className="flex items-center gap-2 text-zinc-300">
             <SatelliteIcon className="w-4 h-4" />
             <span className="text-xs font-semibold">{vans.length} UNIDADES</span>
           </div>
           {isAddingStop && (
               <>
                <div className="w-px h-3 bg-white/20"></div>
                <div className="flex items-center gap-2 text-red-400 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-[10px] font-bold uppercase">MODO RUTA: CLICK EN MAPA</span>
                </div>
               </>
           )}
        </div>
      </div>

      {/* SIDEBAR */}
      <div 
        className={`absolute top-0 left-0 bottom-0 z-40 w-80 bg-zinc-950/90 backdrop-blur-xl border-r border-white/5 shadow-2xl transition-transform duration-500 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
             <div>
               <h1 className="text-lg font-bold text-white tracking-tight">FLOTA GLOBAL</h1>
               <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Gestión Logística</p>
             </div>
             <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 transition-colors">
               <CloseIcon />
             </button>
          </div>

          <div className="p-4 border-b border-white/5">
             <button 
                onClick={() => setShowAndroidModal(true)}
                className="w-full py-3 bg-green-900/20 hover:bg-green-900/30 text-green-400 border border-green-500/30 rounded-lg text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(22,163,74,0.1)]"
             >
                <AndroidLogo /> VINCULAR APP ANDROID
             </button>
          </div>
          
          {selectedVan ? (
             /* EDIT MODE */
             <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <button onClick={() => setSelectedVanId(null)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-2">
                    ← Volver al listado
                </button>
                
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/10">
                    <h2 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2">
                        <EditIcon /> Editar Información
                    </h2>
                    {selectedVan.isRealDevice && (
                        <div className="mb-3 px-2 py-2 bg-blue-900/30 border border-blue-500/30 text-blue-400 text-[10px] rounded uppercase font-bold text-center flex items-center justify-center gap-2">
                            <AndroidLogo className="w-4 h-4" /> Dispositivo Android Nativo
                        </div>
                    )}
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] text-zinc-500 uppercase">Conductor</label>
                            <input 
                                className="w-full bg-black/50 border border-zinc-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none"
                                value={selectedVan.name}
                                onChange={(e) => handleUpdateVan(selectedVan.id, 'name', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-zinc-500 uppercase">Matrícula / ID</label>
                            <input 
                                className="w-full bg-black/50 border border-zinc-700 rounded p-2 text-sm text-white font-mono focus:border-blue-500 outline-none uppercase"
                                value={selectedVan.plate}
                                onChange={(e) => handleUpdateVan(selectedVan.id, 'plate', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* CAMERA FEED SECTION */}
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/10 relative overflow-hidden">
                     <h2 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2 relative z-10">
                        <CameraIcon /> Video Vigilancia (CCTV)
                    </h2>
                    <div className="space-y-2">
                        <CameraFeed 
                            label="CAM 01 - CARGA/INTERIOR" 
                            type="cargo" 
                            vanStatus={selectedVan.status} 
                            onAnalyze={handleAnalyzeFeed} 
                        />
                        <CameraFeed 
                            label="CAM 02 - CABINA/CONDUCTOR" 
                            type="cabin" 
                            vanStatus={selectedVan.status} 
                            onAnalyze={handleAnalyzeFeed} 
                        />
                    </div>
                </div>


                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/10">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                            <FlagIcon /> Ruta y Paradas
                        </h2>
                    </div>
                    
                    <div className="mb-4 space-y-2">
                        <label className="text-[10px] text-zinc-500 uppercase">Añadir por Dirección</label>
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 bg-black/50 border border-zinc-700 rounded p-2 text-xs text-white placeholder-zinc-600 focus:border-blue-500 outline-none"
                                placeholder="C/ Gran Vía 1, Madrid..."
                                value={addressInput}
                                onChange={(e) => setAddressInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddAddress()}
                            />
                            <button 
                                onClick={handleAddAddress}
                                disabled={isSearchingAddress}
                                className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-400 p-2 rounded transition-colors disabled:opacity-50"
                            >
                                {isSearchingAddress ? <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"></div> : <SearchIcon />}
                            </button>
                        </div>
                    </div>

                     <div className="flex justify-end mb-3">
                        <button 
                            onClick={() => setIsAddingStop(!isAddingStop)}
                            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-colors flex items-center gap-2 w-full justify-center ${isAddingStop ? 'bg-red-500/20 text-red-400 border border-red-500' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-600'}`}
                        >
                            <MapPinPlusIcon />
                            {isAddingStop ? 'Cancelar Modo Mapa' : 'Seleccionar en Mapa'}
                        </button>
                    </div>

                    
                    {selectedVan.route.length > 0 && (
                        <div className="mb-3 p-3 bg-blue-900/20 rounded border border-blue-500/30">
                            <div className="flex justify-between text-xs text-blue-200 mb-1">
                                <span>Distancia Total:</span>
                                <span className="font-mono font-bold">{calculateLogisticTime(selectedVan).dist} km</span>
                            </div>
                             <div className="flex justify-between text-xs text-blue-200">
                                <span>Tiempo Estimado:</span>
                                <span className="font-mono font-bold">{calculateLogisticTime(selectedVan).totalTime} h</span>
                            </div>
                            <div className="text-[9px] text-blue-400/70 mt-1 text-center font-mono">
                                (Inc. {calculateLogisticTime(selectedVan).serviceTime}h de servicio)
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        {selectedVan.route.length === 0 ? (
                            <div className="text-xs text-zinc-600 text-center py-4 italic">
                                Sin paradas asignadas.
                            </div>
                        ) : (
                            selectedVan.route.map((stop, i) => (
                                <div key={stop.id} className="flex justify-between items-center bg-black/40 p-2 rounded border border-zinc-800">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-5 h-5 min-w-[1.25rem] rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold">{i+1}</div>
                                        <div className="flex flex-col">
                                            {stop.address ? (
                                                <span className="text-xs text-zinc-200 truncate font-semibold">{stop.address}</span>
                                            ) : (
                                                <span className="text-xs text-zinc-400 italic">Ubicación manual</span>
                                            )}
                                            <span className="text-[10px] text-zinc-500 font-mono">
                                                {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteStop(selectedVan.id, stop.id)} className="text-zinc-600 hover:text-red-400 ml-2">
                                        <CloseIcon />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <button 
                        onClick={() => handleDeleteVan(selectedVan.id)}
                        className="w-full py-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 rounded-lg text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2"
                    >
                        <TrashIcon /> Eliminar Unidad
                    </button>
                </div>
             </div>
          ) : (
          /* LIST MODE */
          <>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
             {vans.map(van => (
               <div 
                 key={van.id}
                 onClick={() => {
                   setSelectedVanId(van.id);
                   mapInstanceRef.current?.flyTo([van.lat, van.lng], 17);
                 }}
                 className={`group p-4 rounded-xl cursor-pointer transition-all border relative overflow-hidden ${
                   selectedVanId === van.id 
                     ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                     : 'bg-zinc-900/40 border-white/5 hover:bg-zinc-800/60 hover:border-white/10'
                 }`}
               >
                 <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-lg ${selectedVanId === van.id ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-200'}`}>
                         {van.isRealDevice ? <AndroidLogo /> : <VanIcon />}
                       </div>
                       <div>
                         <div className="font-bold text-sm text-zinc-200">{van.name}</div>
                         <div className="text-[10px] text-zinc-500 font-mono flex gap-2">
                             <span>{van.id}</span>
                             <span className="text-zinc-400">|</span>
                             <span className="text-cyan-400">{van.plate}</span>
                         </div>
                       </div>
                    </div>
                    {van.isRealDevice ? (
                         <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                            <span className="text-[9px] text-cyan-400 font-bold">ANDROID LINKED</span>
                         </div>
                    ) : (
                        <div className={`w-2 h-2 rounded-full ${van.status === 'moving' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    )}
                 </div>
                 
                 <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5 relative z-10">
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                       <span className="font-mono">{van.speed} KM/H</span>
                    </div>
                    {van.route.length > 0 && (
                        <div className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-300">
                            {van.route.length} PARADAS
                        </div>
                    )}
                 </div>
               </div>
             ))}
          </div>

          {/* Footer Stats */}
          <div className="p-4 border-t border-white/5 bg-black/20">
             <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-zinc-900/50 p-2 rounded-lg">
                  <div className="text-[10px] text-zinc-500 uppercase">Activas</div>
                  <div className="text-lg font-bold text-emerald-400">{vans.filter(v => v.status === 'moving').length}</div>
                </div>
                <div className="bg-zinc-900/50 p-2 rounded-lg">
                  <div className="text-[10px] text-zinc-500 uppercase">Detenidas</div>
                  <div className="text-lg font-bold text-amber-400">{vans.filter(v => v.status !== 'moving').length}</div>
                </div>
             </div>
          </div>
          </>
          )}
        </div>
      </div>

      {/* TOGGLE SIDEBAR BUTTON */}
      <div className={`absolute top-6 left-6 z-30 transition-all duration-500 ${sidebarOpen ? '-translate-x-20 opacity-0' : 'translate-x-0 opacity-100'}`}>
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-3 bg-zinc-950/80 backdrop-blur-md border border-white/10 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <MenuIcon />
        </button>
      </div>

      {/* RIGHT FLOATING ACTION BUTTONS */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4">
         <div className="flex flex-col gap-2 bg-zinc-950/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl">
            <button 
              onClick={handleLocateUser}
              className="p-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all active:scale-90"
              title="Mi Ubicación"
            >
              <LocateIcon />
            </button>
            <div className="h-px bg-white/10 mx-2"></div>
            <button 
              onClick={handleFitBounds}
              className="p-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all active:scale-90"
              title="Ver Toda la Flota"
            >
              <MapViewIcon />
            </button>
         </div>

         <button 
           onClick={() => setChatOpen(!chatOpen)}
           className={`p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 border border-white/10 relative ${
             chatOpen ? 'bg-cyan-500 text-black rotate-0' : 'bg-zinc-950/90 text-cyan-400 backdrop-blur-xl'
           }`}
         >
            <ChatIcon />
            {!chatOpen && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-black"></div>}
         </button>
      </div>

      {/* ANDROID CONNECT MODAL */}
      {showAndroidModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-2xl max-w-lg w-full relative">
                  <button onClick={() => setShowAndroidModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><CloseIcon /></button>
                  <h2 className="text-xl font-bold mb-2 text-white flex items-center gap-2"><AndroidLogo /> Conexión App Nativa</h2>
                  <p className="text-sm text-zinc-400 mb-4">Para rastrear un dispositivo real, instala la App Android utilizando el código fuente proporcionado.</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-black/50 border border-zinc-800 rounded">
                          <div className="text-[10px] text-zinc-500 uppercase mb-1">ID de Servidor</div>
                          <div className="text-cyan-400 font-mono font-bold">wss://fleet-api.demo/v1</div>
                      </div>
                      <div className="p-3 bg-black/50 border border-zinc-800 rounded">
                           <div className="text-[10px] text-zinc-500 uppercase mb-1">Código de Flota</div>
                           <div className="text-cyan-400 font-mono font-bold">FLT-{Math.floor(Math.random()*10000)}</div>
                      </div>
                  </div>

                  <div className="bg-zinc-800/50 p-4 rounded mb-4 text-xs text-zinc-300 leading-relaxed border border-zinc-700">
                      <strong className="text-white block mb-1">Instrucciones para el Desarrollador:</strong>
                      1. Abre el archivo <span className="font-mono text-cyan-400">ANDROID_APP_CODE.md</span>.<br/>
                      2. Copia el código en un nuevo proyecto de <strong>Android Studio</strong>.<br/>
                      3. Compila el APK e instálalo en el dispositivo del conductor.<br/>
                      4. El GPS funcionará en segundo plano (Background Service).
                  </div>

                  <div className="flex gap-3">
                     <button 
                        onClick={() => {
                            // In a real app, this would open documentation
                            alert("Revisa el archivo PROJECT_DOCS.txt y ANDROID_APP_CODE.md en el editor.");
                        }}
                        className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                     >
                        <CodeIcon /> Ver Código Fuente
                     </button>
                     <button 
                        onClick={simulateNativeConnection}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-colors"
                     >
                        Simular Entrada de Datos
                     </button>
                  </div>
              </div>
          </div>
      )}

      {/* AI CHAT WINDOW */}
      <div className={`absolute bottom-6 right-6 z-40 w-96 max-w-[calc(100vw-48px)] h-[500px] max-h-[60vh] transition-all duration-300 origin-bottom-right ${
        chatOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-10 pointer-events-none'
      }`}>
         <div className="h-full rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <GeminiHelper userLocation={userLocation} onClose={() => setChatOpen(false)} />
         </div>
      </div>

      {/* VAN DETAIL PREVIEW (Only if sidebar closed) */}
      {!sidebarOpen && selectedVan && !chatOpen && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 w-[90%] md:w-auto md:min-w-[400px]">
           <div className="bg-zinc-950/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-up">
              <div className="p-3 bg-blue-600 rounded-xl text-white">
                 {selectedVan.isRealDevice ? <AndroidLogo /> : <VanIcon />}
              </div>
              <div className="flex-1">
                 <h3 className="font-bold text-white">{selectedVan.name}</h3>
                 <div className="flex flex-col gap-1 mt-1">
                    <div className="text-xs text-zinc-300 flex gap-3">
                        <span className="flex items-center gap-1">🔋 {selectedVan.battery}%</span>
                        <span className="flex items-center gap-1">⚡ {selectedVan.speed} km/h</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-1 border-t border-white/5 pt-1 truncate">
                        📍 {currentAddress || "Calculando ubicación..."}
                    </div>
                 </div>
              </div>
              <button 
                onClick={() => setSelectedVanId(null)}
                className="p-2 text-zinc-500 hover:text-white"
              >
                <CloseIcon />
              </button>
           </div>
        </div>
      )}

      {/* CSS Utilities for Animations */}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .spin-slow { animation: spin 3s linear infinite; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

// FIX: MOUNT THE APP TO THE DOM
const root = createRoot(document.getElementById('root')!);
root.render(<App />);