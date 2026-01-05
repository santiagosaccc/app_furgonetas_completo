
export enum VanStatus {
  AVAILABLE = 'Available',
  RENTED = 'Rented',
  MAINTENANCE = 'Maintenance',
  IN_TRANSIT = 'In Transit'
}

export interface Van {
  id: string;
  model: string;
  brand: string;
  year: number;
  licensePlate: string;
  status: VanStatus;
  mileage: number;
  fuelLevel: number; // 0-100
  lastService: string;
  image: string;
  pricePerDay: number;
}

export interface Booking {
  id: string;
  vanId: string;
  clientName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'completed';
}

export interface FleetStats {
  totalVans: number;
  availableVans: number;
  monthlyRevenue: number;
  activeBookings: number;
}
