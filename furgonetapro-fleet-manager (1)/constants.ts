
import { Van, VanStatus } from './types';

export const MOCK_VANS: Van[] = [
  {
    id: 'v1',
    brand: 'Mercedes-Benz',
    model: 'Sprinter 314',
    year: 2022,
    licensePlate: 'ABC-1234',
    status: VanStatus.AVAILABLE,
    mileage: 45000,
    fuelLevel: 85,
    lastService: '2023-11-15',
    image: 'https://picsum.photos/seed/van1/800/600',
    pricePerDay: 85
  },
  {
    id: 'v2',
    brand: 'Ford',
    model: 'Transit Cargo',
    year: 2021,
    licensePlate: 'XYZ-9876',
    status: VanStatus.RENTED,
    mileage: 62000,
    fuelLevel: 30,
    lastService: '2023-12-01',
    image: 'https://picsum.photos/seed/van2/800/600',
    pricePerDay: 75
  },
  {
    id: 'v3',
    brand: 'Volkswagen',
    model: 'Transporter T6',
    year: 2023,
    licensePlate: 'GHI-4567',
    status: VanStatus.MAINTENANCE,
    mileage: 12000,
    fuelLevel: 100,
    lastService: '2024-01-20',
    image: 'https://picsum.photos/seed/van3/800/600',
    pricePerDay: 90
  },
  {
    id: 'v4',
    brand: 'Iveco',
    model: 'Daily 35S',
    year: 2020,
    licensePlate: 'LMN-1122',
    status: VanStatus.AVAILABLE,
    mileage: 88000,
    fuelLevel: 45,
    lastService: '2023-09-10',
    image: 'https://picsum.photos/seed/van4/800/600',
    pricePerDay: 70
  }
];

export const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'LayoutDashboard', id: 'dashboard' },
  { label: 'Fleet Inventory', icon: 'Truck', id: 'fleet' },
  { label: 'Bookings', icon: 'CalendarDays', id: 'bookings' },
  { label: 'Analytics', icon: 'BarChart3', id: 'analytics' },
  { label: 'AI Assistant', icon: 'Bot', id: 'ai' }
];
