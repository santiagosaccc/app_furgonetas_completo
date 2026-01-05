
import { Van, Booking } from '../types';

// En producción esto vendría de una variable de entorno
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Servicio centralizado para comunicación con el backend
 */
export const api = {
  // Obtener todos los vehículos
  getVans: async (): Promise<Van[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vans`);
      if (!response.ok) throw new Error('Error al obtener vehículos');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Obtener un vehículo por ID
  getVanById: async (id: string): Promise<Van> => {
    const response = await fetch(`${API_BASE_URL}/vans/${id}`);
    if (!response.ok) throw new Error('Vehículo no encontrado');
    return await response.json();
  },

  // Crear una nueva reserva
  createBooking: async (bookingData: Partial<Booking>): Promise<Booking> => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) throw new Error('Error al crear reserva');
    return await response.json();
  },

  // Actualizar estado de un vehículo
  updateVanStatus: async (id: string, status: string): Promise<Van> => {
    const response = await fetch(`${API_BASE_URL}/vans/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Error al actualizar vehículo');
    return await response.json();
  }
};
