import { Injectable } from '@angular/core';
import { Observable, interval, BehaviorSubject, combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Sensor, SensorReading, SensorType } from '../models/sensor.model';

/**
 * Service for simulating real-time sensor data streams
 */
@Injectable({
    providedIn: 'root'
})
export class SensorDataService {
    private sensors: Sensor[] = [
        {
            id: 'temp-001',
            name: 'Temperature Sensor 1',
            type: SensorType.TEMPERATURE,
            unit: '°C',
            minValue: 0,
            maxValue: 150,
            normalRange: { min: 20, max: 80 }
        },
        {
            id: 'press-001',
            name: 'Pressure Sensor 1',
            type: SensorType.PRESSURE,
            unit: 'PSI',
            minValue: 0,
            maxValue: 200,
            normalRange: { min: 30, max: 120 }
        },
        {
            id: 'vib-001',
            name: 'Vibration Sensor 1',
            type: SensorType.VIBRATION,
            unit: 'Hz',
            minValue: 0,
            maxValue: 100,
            normalRange: { min: 10, max: 50 }
        }
    ];

    private sensorStreams$ = new Map<string, Observable<SensorReading>>();
    private activeSensorsSubject = new BehaviorSubject<string[]>(
        this.sensors.map(s => s.id)
    );

    public activeSensors$ = this.activeSensorsSubject.asObservable();

    constructor() {
        this.initializeSensorStreams();
    }

    /**
     * Initialize data streams for all sensors
     */
    private initializeSensorStreams(): void {
        this.sensors.forEach(sensor => {
            const stream$ = this.createSensorStream(sensor).pipe(
                shareReplay(1) // Share the stream among multiple subscribers
            );
            this.sensorStreams$.set(sensor.id, stream$);
        });
    }

    /**
     * Create a simulated data stream for a sensor
     */
    private createSensorStream(sensor: Sensor): Observable<SensorReading> {
        // Generate data every 1-2 seconds with random interval
        return interval(1000 + Math.random() * 1000).pipe(
            map(() => this.generateReading(sensor))
        );
    }

    /**
     * Generate a random sensor reading
     */
    private generateReading(sensor: Sensor): SensorReading {
        // Generate value with some randomness around the normal range
        const normalMid = (sensor.normalRange.min + sensor.normalRange.max) / 2;
        const normalSpread = sensor.normalRange.max - sensor.normalRange.min;

        // 80% chance of normal value, 20% chance of abnormal
        const isNormal = Math.random() < 0.8;

        let value: number;
        if (isNormal) {
            // Normal value with some variance
            value = normalMid + (Math.random() - 0.5) * normalSpread * 1.2;
        } else {
            // Occasionally generate values outside normal range
            const range = sensor.maxValue - sensor.minValue;
            value = sensor.minValue + Math.random() * range;
        }

        // Clamp to min/max
        value = Math.max(sensor.minValue, Math.min(sensor.maxValue, value));

        return {
            id: `${sensor.id}-${Date.now()}`,
            type: sensor.type,
            value: Math.round(value * 100) / 100, // Round to 2 decimals
            unit: sensor.unit,
            timestamp: new Date()
        };
    }

    /**
     * Get the data stream for a specific sensor
     */
    getSensorStream(sensorId: string): Observable<SensorReading> | undefined {
        return this.sensorStreams$.get(sensorId);
    }

    /**
     * Get all sensor streams combined
     */
    getAllSensorStreams(): Observable<SensorReading[]> {
        const streams = Array.from(this.sensorStreams$.values());
        return combineLatest(streams);
    }

    /**
     * Get sensor metadata
     */
    getSensors(): Sensor[] {
        return [...this.sensors];
    }

    /**
     * Get a specific sensor by ID
     */
    getSensor(id: string): Sensor | undefined {
        return this.sensors.find(s => s.id === id);
    }

    /**
     * Get sensors by type
     */
    getSensorsByType(type: SensorType): Sensor[] {
        return this.sensors.filter(s => s.type === type);
    }

    /**
     * Toggle sensor active state
     */
    toggleSensor(sensorId: string): void {
        const active = this.activeSensorsSubject.value;
        if (active.includes(sensorId)) {
            this.activeSensorsSubject.next(active.filter(id => id !== sensorId));
        } else {
            this.activeSensorsSubject.next([...active, sensorId]);
        }
    }

    /**
     * Check if sensor is active
     */
    isSensorActive(sensorId: string): boolean {
        return this.activeSensorsSubject.value.includes(sensorId);
    }
}
