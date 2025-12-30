import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Alert, AlertFilter } from '../models/alert.model';
import { AlertSeverity } from '../models/rule.model';
import { SensorType } from '../models/sensor.model';

/**
 * Service for managing and logging alerts
 */
@Injectable({
    providedIn: 'root'
})
export class AlertService {
    private alertsSubject = new BehaviorSubject<Alert[]>([]);
    public alerts$ = this.alertsSubject.asObservable();

    private readonly MAX_ALERTS = 500; // Keep last 500 alerts

    constructor() { }

    /**
     * Add a new alert
     */
    addAlert(alert: Alert): void {
        const currentAlerts = this.alertsSubject.value;
        const newAlerts = [alert, ...currentAlerts];

        // Limit the number of stored alerts
        if (newAlerts.length > this.MAX_ALERTS) {
            newAlerts.splice(this.MAX_ALERTS);
        }

        this.alertsSubject.next(newAlerts);
    }

    /**
     * Get all alerts
     */
    getAlerts(): Alert[] {
        return this.alertsSubject.value;
    }

    /**
     * Get filtered alerts
     */
    getFilteredAlerts(filter: AlertFilter): Alert[] {
        let alerts = this.alertsSubject.value;

        if (filter.severity) {
            alerts = alerts.filter(a => a.severity === filter.severity);
        }

        if (filter.sensorType) {
            alerts = alerts.filter(a => a.sensorType === filter.sensorType);
        }

        if (filter.acknowledged !== undefined) {
            alerts = alerts.filter(a => a.acknowledged === filter.acknowledged);
        }

        if (filter.startDate) {
            alerts = alerts.filter(a => a.timestamp >= filter.startDate!);
        }

        if (filter.endDate) {
            alerts = alerts.filter(a => a.timestamp <= filter.endDate!);
        }

        return alerts;
    }

    /**
     * Get filtered alerts as observable
     */
    getFilteredAlerts$(filter: AlertFilter): Observable<Alert[]> {
        return new Observable(observer => {
            const subscription = this.alerts$.subscribe(alerts => {
                observer.next(this.filterAlerts(alerts, filter));
            });

            return () => subscription.unsubscribe();
        });
    }

    /**
     * Filter alerts based on criteria
     */
    private filterAlerts(alerts: Alert[], filter: AlertFilter): Alert[] {
        let filtered = alerts;

        if (filter.severity) {
            filtered = filtered.filter(a => a.severity === filter.severity);
        }

        if (filter.sensorType) {
            filtered = filtered.filter(a => a.sensorType === filter.sensorType);
        }

        if (filter.acknowledged !== undefined) {
            filtered = filtered.filter(a => a.acknowledged === filter.acknowledged);
        }

        if (filter.startDate) {
            filtered = filtered.filter(a => a.timestamp >= filter.startDate!);
        }

        if (filter.endDate) {
            filtered = filtered.filter(a => a.timestamp <= filter.endDate!);
        }

        return filtered;
    }

    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(alertId: string): boolean {
        const alerts = this.alertsSubject.value;
        const index = alerts.findIndex(a => a.id === alertId);

        if (index === -1) {
            return false;
        }

        const updatedAlerts = [...alerts];
        updatedAlerts[index] = { ...updatedAlerts[index], acknowledged: true };
        this.alertsSubject.next(updatedAlerts);
        return true;
    }

    /**
     * Acknowledge all alerts
     */
    acknowledgeAll(): void {
        const alerts = this.alertsSubject.value.map(a => ({
            ...a,
            acknowledged: true
        }));
        this.alertsSubject.next(alerts);
    }

    /**
     * Clear all alerts
     */
    clearAlerts(): void {
        this.alertsSubject.next([]);
    }

    /**
     * Clear acknowledged alerts
     */
    clearAcknowledged(): void {
        const alerts = this.alertsSubject.value.filter(a => !a.acknowledged);
        this.alertsSubject.next(alerts);
    }

    /**
     * Get alert count by severity
     */
    getAlertCountBySeverity(): Record<AlertSeverity, number> {
        const alerts = this.alertsSubject.value;
        return {
            [AlertSeverity.INFO]: alerts.filter(a => a.severity === AlertSeverity.INFO && !a.acknowledged).length,
            [AlertSeverity.WARNING]: alerts.filter(a => a.severity === AlertSeverity.WARNING && !a.acknowledged).length,
            [AlertSeverity.CRITICAL]: alerts.filter(a => a.severity === AlertSeverity.CRITICAL && !a.acknowledged).length
        };
    }

    /**
     * Get unacknowledged alert count
     */
    getUnacknowledgedCount(): number {
        return this.alertsSubject.value.filter(a => !a.acknowledged).length;
    }

    /**
     * Get recent alerts (last N)
     */
    getRecentAlerts(count: number): Alert[] {
        return this.alertsSubject.value.slice(0, count);
    }
}
