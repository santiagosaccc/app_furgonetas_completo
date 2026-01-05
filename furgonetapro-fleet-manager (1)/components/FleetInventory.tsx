
import React, { useState, useEffect } from 'react';
import { Search, Filter, Fuel, Gauge, MoreVertical, Calendar, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { Van, VanStatus } from '../types';

export const FleetInventory: React.FC = () => {
  const [vans, setVans] = useState<Van[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getVans();
      setVans(data);
    } catch (err) {
      setError('No se pudo conectar con el servidor. ¿Está el backend encendido?');
      // Fallback a datos locales si falla (solo para demo)
      // import { MOCK_VANS } from '../constants';
      // setVans(MOCK_VANS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVans();
  }, []);

  const filteredVans = vans.filter(van => 
    van.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    van.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    van.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-600" />
        <p className="font-medium">Cargando flota desde el servidor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 p-8 rounded-2xl text-center">
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <button 
          onClick={fetchVans}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl mx-auto hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar Conexión
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventario de Flota</h2>
          <p className="text-slate-500">Gestiona y rastrea tus activos en tiempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por modelo o placa..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold">
            + Añadir Vehículo
          </button>
        </div>
      </div>

      {filteredVans.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-400">No se encontraron vehículos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVans.map((van) => (
            <VanCard key={van.id} van={van} />
          ))}
        </div>
      )}
    </div>
  );
};

const VanCard: React.FC<{ van: Van }> = ({ van }) => {
  const statusColors = {
    [VanStatus.AVAILABLE]: 'bg-emerald-100 text-emerald-700',
    [VanStatus.RENTED]: 'bg-blue-100 text-blue-700',
    [VanStatus.MAINTENANCE]: 'bg-orange-100 text-orange-700',
    [VanStatus.IN_TRANSIT]: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={van.image} 
          alt={van.model} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[van.status]}`}>
            {van.status}
          </span>
        </div>
        <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white text-slate-700">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{van.brand} {van.model}</h3>
            <p className="text-sm text-slate-400 font-medium uppercase tracking-tighter">{van.licensePlate}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-indigo-600">${van.pricePerDay}</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold">/ Día</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-50">
          <div className="flex flex-col items-center">
            <Gauge className="w-4 h-4 text-slate-400 mb-1" />
            <span className="text-[11px] font-bold text-slate-600">{van.mileage.toLocaleString()}km</span>
          </div>
          <div className="flex flex-col items-center">
            <Fuel className="w-4 h-4 text-slate-400 mb-1" />
            <span className="text-[11px] font-bold text-slate-600">{van.fuelLevel}%</span>
          </div>
          <div className="flex flex-col items-center">
            <Calendar className="w-4 h-4 text-slate-400 mb-1" />
            <span className="text-[11px] font-bold text-slate-600">{van.year}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
