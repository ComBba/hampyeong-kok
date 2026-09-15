export type StoreStatus = 'available' | 'unavailable' | 'verify';

export interface Store {
  id: string;
  name: string;
  address: string;
  roadAddress: string;
  town: string;
  category: string;
  origCategory: string;
  status: StoreStatus;
  badge: string;
  reason: string;
  ruleType: string;
  lat: number | null;
  lng: number | null;
  regDate: string;
  distance?: number;
  isGasStation?: boolean;
}

export interface StoreData {
  metadata: {
    title: string;
    totalCount: number;
    updatedAt: string;
    source: string;
    stats: {
      available: number;
      unavailable: number;
      verify: number;
      geocoded: number;
      failed_geocode: number;
    };
  };
  categories: string[];
  towns: string[];
  stores: Store[];
}

export interface UserLocation {
  lat: number;
  lng: number;
}
