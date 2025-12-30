import { SensorType } from './sensor.model';

/**
 * Represents a threshold rule for sensor monitoring
 */
export interface Rule {
    id: string;
    name: string;
    sensorType: SensorType;
    condition: RuleCondition;
    threshold: number;
    severity: AlertSeverity;
    enabled: boolean;
    createdAt: Date;
}

/**
 * Condition types for rule evaluation
 */
export enum RuleCondition {
    GREATER_THAN = 'gt',
    LESS_THAN = 'lt',
    GREATER_THAN_OR_EQUAL = 'gte',
    LESS_THAN_OR_EQUAL = 'lte',
    EQUAL = 'eq'
}

/**
 * Alert severity levels
 */
export enum AlertSeverity {
    INFO = 'info',
    WARNING = 'warning',
    CRITICAL = 'critical'
}

/**
 * Human-readable labels for conditions
 */
export const CONDITION_LABELS: Record<RuleCondition, string> = {
    [RuleCondition.GREATER_THAN]: '>',
    [RuleCondition.LESS_THAN]: '<',
    [RuleCondition.GREATER_THAN_OR_EQUAL]: '≥',
    [RuleCondition.LESS_THAN_OR_EQUAL]: '≤',
    [RuleCondition.EQUAL]: '='
};
