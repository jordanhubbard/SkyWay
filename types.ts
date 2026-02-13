
export interface Flight {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  status: string;
  scheduledTime: string;
  estimatedTime: string;
  type: 'arrival' | 'departure';
}

export interface AirportData {
  icao: string;
  name: string;
  location: string;
  summary: string;
  elevation: string;
  runways: string[];
  fboInfo: string;
  fuelServices: string;
  restaurants: string;
  rentals: string;
  reviews: string;
  groundingSources: Array<{ web: { uri: string; title: string } }>;
  flights?: Flight[];
}

export interface AirportImages {
  main: string;
  fbo: string;
  aerial: string;
}

export enum CategoryType {
  SERVICES = 'SERVICES',
  GAS = 'GAS',
  RESTAURANTS = 'RESTAURANTS',
  RENTALS = 'RENTALS',
  REVIEWS = 'REVIEWS',
  FLIGHTS = 'FLIGHTS'
}
