
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { FleetInventory } from './components/FleetInventory';
import { AIAssistant } from './components/AIAssistant';
import { Bell, Search, User, Globe, Server, Database, Code } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'fleet':
        return <FleetInventory />;
      case 'ai':
        return <AIAssistant />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
            <div className="p-8 bg-slate-50 rounded-full">
              <Search className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-semibold">Próximamente</h2>
            <p>El módulo de {activeTab} está actualmente en desarrollo.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
             <div className="relative w-full max-w-md hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Búsqueda global..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
             </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">Admin</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gestor de Flota</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Floating Documentation Helper */}
      <div className="fixed bottom-6 right-6 group z-50">
         <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-2xl opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 absolute bottom-full right-0 mb-4 w-80 text-xs">
            <h3 className="font-bold mb-4 text-indigo-400 text-sm flex items-center gap-2">
              <Globe className="w-4 h-4" /> Guía de Conexión Backend
            </h3>
            
            <div className="space-y-4">
              <section>
                <p className="font-bold text-slate-300 flex items-center gap-2 mb-1">
                  <Server className="w-3 h-3" /> 1. Servidor Node.js
                </p>
                <p className="text-slate-400">Instala <code>express</code> y <code>cors</code>. Crea una ruta <code>GET /api/vans</code> que devuelva el JSON de tus furgonetas.</p>
              </section>

              <section>
                <p className="font-bold text-slate-300 flex items-center gap-2 mb-1">
                  <Database className="w-3 h-3" /> 2. Base de Datos
                </p>
                <p className="text-slate-400">Conecta tu servidor a MongoDB o PostgreSQL. Mapea los campos ID, Brand, Model y Status.</p>
              </section>

              <section>
                <p className="font-bold text-slate-300 flex items-center gap-2 mb-1">
                  <Code className="w-3 h-3" /> 3. CORS Policy
                </p>
                <p className="text-slate-400">Asegúrate de configurar <code>app.use(cors())</code> en tu backend para evitar bloqueos del navegador.</p>
              </section>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-indigo-300 font-mono italic">API URL: http://localhost:3000</p>
              </div>
            </div>
         </div>
         <button className="bg-slate-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl hover:bg-indigo-600 transition-all transform hover:rotate-12">
            <Server className="w-6 h-6" />
         </button>
      </div>
    </div>
  );
};

export default App;
