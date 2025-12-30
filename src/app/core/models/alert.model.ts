import { SensorType } from './sensor.model';
import { AlertSeverity } from './rule.model';

/**
 * Represents an alert triggered by a rule breach
 */
export interface Alert {
    id: string;
    ruleId: string;
    ruleName: string;
    sensorType: SensorType;
    severity: AlertSeverity;
    message: string;
    value: number;
    threshold: number;
    timestamp: Date;
    acknowledged: boolean;
}

/**
 * Filter criteria for alerts
 */
export interface AlertFilter {
    severity?: AlertSeverity;
    sensorType?: SensorType;
    acknowledged?: boolean;
    startDate?: Date;
    endDate?: Date;
}
