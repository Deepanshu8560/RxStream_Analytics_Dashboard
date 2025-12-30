import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Rule, RuleCondition, AlertSeverity } from '../models/rule.model';
import { SensorReading, SensorType } from '../models/sensor.model';
import { Alert } from '../models/alert.model';

/**
 * Service for managing threshold rules and evaluating sensor data
 */
@Injectable({
    providedIn: 'root'
})
export class RuleEngineService {
    private rulesSubject = new BehaviorSubject<Rule[]>([]);
    public rules$ = this.rulesSubject.asObservable();

    constructor() {
        // Initialize with some default rules
        this.initializeDefaultRules();
    }

    /**
     * Initialize default rules for demonstration
     */
    private initializeDefaultRules(): void {
        const defaultRules: Rule[] = [
            {
                id: this.generateId(),
                name: 'High Temperature Warning',
                sensorType: SensorType.TEMPERATURE,
                condition: RuleCondition.GREATER_THAN,
                threshold: 100,
                severity: AlertSeverity.WARNING,
                enabled: true,
                createdAt: new Date()
            },
            {
                id: this.generateId(),
                name: 'Critical Temperature',
                sensorType: SensorType.TEMPERATURE,
                condition: RuleCondition.GREATER_THAN_OR_EQUAL,
                threshold: 120,
                severity: AlertSeverity.CRITICAL,
                enabled: true,
                createdAt: new Date()
            },
            {
                id: this.generateId(),
                name: 'High Pressure Warning',
                sensorType: SensorType.PRESSURE,
                condition: RuleCondition.GREATER_THAN,
                threshold: 150,
                severity: AlertSeverity.WARNING,
                enabled: true,
                createdAt: new Date()
            },
            {
                id: this.generateId(),
                name: 'Low Pressure Alert',
                sensorType: SensorType.PRESSURE,
                condition: RuleCondition.LESS_THAN,
                threshold: 20,
                severity: AlertSeverity.INFO,
                enabled: true,
                createdAt: new Date()
            },
            {
                id: this.generateId(),
                name: 'High Vibration Critical',
                sensorType: SensorType.VIBRATION,
                condition: RuleCondition.GREATER_THAN_OR_EQUAL,
                threshold: 70,
                severity: AlertSeverity.CRITICAL,
                enabled: true,
                createdAt: new Date()
            }
        ];

        this.rulesSubject.next(defaultRules);
    }

    /**
     * Evaluate a sensor reading against all active rules
     */
    evaluateReading(reading: SensorReading): Alert | null {
        const rules = this.rulesSubject.value.filter(
            r => r.enabled && r.sensorType === reading.type
        );

        // Sort by severity (critical first) to return the most severe alert
        const sortedRules = rules.sort((a, b) => {
            const severityOrder = {
                [AlertSeverity.CRITICAL]: 3,
                [AlertSeverity.WARNING]: 2,
                [AlertSeverity.INFO]: 1
            };
            return severityOrder[b.severity] - severityOrder[a.severity];
        });

        for (const rule of sortedRules) {
            if (this.checkCondition(reading.value, rule.condition, rule.threshold)) {
                return this.createAlert(reading, rule);
            }
        }

        return null;
    }

    /**
     * Check if a value meets a condition against a threshold
     */
    private checkCondition(
        value: number,
        condition: RuleCondition,
        threshold: number
    ): boolean {
        switch (condition) {
            case RuleCondition.GREATER_THAN:
                return value > threshold;
            case RuleCondition.LESS_THAN:
                return value < threshold;
            case RuleCondition.GREATER_THAN_OR_EQUAL:
                return value >= threshold;
            case RuleCondition.LESS_THAN_OR_EQUAL:
                return value <= threshold;
            case RuleCondition.EQUAL:
                return Math.abs(value - threshold) < 0.01; // Float comparison
            default:
                return false;
        }
    }

    /**
     * Create an alert from a reading and rule
     */
    private createAlert(reading: SensorReading, rule: Rule): Alert {
        const conditionSymbol = this.getConditionSymbol(rule.condition);
        const message = `${reading.type.toUpperCase()}: ${reading.value}${reading.unit} ${conditionSymbol} ${rule.threshold}${reading.unit}`;

        return {
            id: this.generateId(),
            ruleId: rule.id,
            ruleName: rule.name,
            sensorType: reading.type,
            severity: rule.severity,
            message,
            value: reading.value,
            threshold: rule.threshold,
            timestamp: reading.timestamp,
            acknowledged: false
        };
    }

    /**
     * Get symbol for condition
     */
    private getConditionSymbol(condition: RuleCondition): string {
        const symbols: Record<RuleCondition, string> = {
            [RuleCondition.GREATER_THAN]: '>',
            [RuleCondition.LESS_THAN]: '<',
            [RuleCondition.GREATER_THAN_OR_EQUAL]: '≥',
            [RuleCondition.LESS_THAN_OR_EQUAL]: '≤',
            [RuleCondition.EQUAL]: '='
        };
        return symbols[condition];
    }

    /**
     * Add a new rule
     */
    addRule(rule: Omit<Rule, 'id' | 'createdAt'>): Rule {
        const newRule: Rule = {
            ...rule,
            id: this.generateId(),
            createdAt: new Date()
        };

        const currentRules = this.rulesSubject.value;
        this.rulesSubject.next([...currentRules, newRule]);
        return newRule;
    }

    /**
     * Update an existing rule
     */
    updateRule(id: string, updates: Partial<Rule>): boolean {
        const currentRules = this.rulesSubject.value;
        const index = currentRules.findIndex(r => r.id === id);

        if (index === -1) {
            return false;
        }

        const updatedRules = [...currentRules];
        updatedRules[index] = { ...updatedRules[index], ...updates };
        this.rulesSubject.next(updatedRules);
        return true;
    }

    /**
     * Delete a rule
     */
    deleteRule(id: string): boolean {
        const currentRules = this.rulesSubject.value;
        const filteredRules = currentRules.filter(r => r.id !== id);

        if (filteredRules.length === currentRules.length) {
            return false;
        }

        this.rulesSubject.next(filteredRules);
        return true;
    }

    /**
     * Toggle rule enabled state
     */
    toggleRule(id: string): boolean {
        const currentRules = this.rulesSubject.value;
        const rule = currentRules.find(r => r.id === id);

        if (!rule) {
            return false;
        }

        return this.updateRule(id, { enabled: !rule.enabled });
    }

    /**
     * Get all rules
     */
    getRules(): Rule[] {
        return this.rulesSubject.value;
    }

    /**
     * Get rules by sensor type
     */
    getRulesBySensorType(type: SensorType): Rule[] {
        return this.rulesSubject.value.filter(r => r.sensorType === type);
    }

    /**
     * Generate a unique ID
     */
    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
