export enum TimerState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED'
}

export interface Station {
  name: string;
  description: string;
  environment: 'city' | 'nature' | 'cyberpunk' | 'desert' | 'snow' | 'clear';
}

export interface Destination {
  id: string;
  name: string;
  region: string;
  durationMinutes: number;
  distanceKm: number;
  themeColor: string;
  imageUrl: string;
  lat: number;
  lng: number;
  timezone: string;
}

export interface MissionLabel {
  id: string;
  name: string;
  color: string; // Tailwind class base (e.g. 'blue', 'red')
  icon?: string; // Key for icon map
  subLabels?: string[];
  isCustom?: boolean;
  customSubLabelPrompt?: string; // e.g. "Book Title" - if present, shows input instead of buttons
}

export interface FocusSession {
  id: string;
  task: string; // Specific details
  label?: MissionLabel;
  subLabel?: string;
  durationMinutes: number;
  actualDurationMinutes?: number;
  startTime: number;
  completed: boolean;
  station?: Station;
  destination?: Destination;
  seat?: string;
}

export interface GeminiStationResponse {
  stationName: string;
  description: string;
  environment: 'city' | 'nature' | 'cyberpunk' | 'desert' | 'snow' | 'clear';
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeName?: string;
  };
}

export interface GeminiDestinationData {
  weather: {
    temp: number;
    condition: string;
  };
  station: Station;
  localTime: string;
  groundingChunks: GroundingChunk[];
}