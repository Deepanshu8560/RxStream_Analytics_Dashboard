/**
 * Represents a single sensor reading with timestamp
 */
export interface SensorReading {
  id: string;
  type: SensorType;
  value: number;
  unit: string;
  timestamp: Date;
}

/**
 * Types of sensors supported by the dashboard
 */
export enum SensorType {
  TEMPERATURE = 'temperature',
  PRESSURE = 'pressure',
  VIBRATION = 'vibration'
}

/**
 * Sensor metadata and configuration
 */
export interface Sensor {
  id: string;
  name: string;
  type: SensorType;
  unit: string;
  minValue: number;
  maxValue: number;
  normalRange: {
    min: number;
    max: number;
  };
}
