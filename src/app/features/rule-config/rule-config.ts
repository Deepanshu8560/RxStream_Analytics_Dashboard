import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Rule, RuleCondition, AlertSeverity, CONDITION_LABELS } from '../../core/models/rule.model';
import { SensorType } from '../../core/models/sensor.model';
import { RuleEngineService } from '../../core/services/rule-engine.service';

@Component({
  selector: 'app-rule-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rule-config.html',
  styleUrl: './rule-config.scss',
})
export class RuleConfig implements OnInit {
  rules: Rule[] = [];
  showAddForm: boolean = false;

  // Form model
  newRule = {
    name: '',
    sensorType: SensorType.TEMPERATURE,
    condition: RuleCondition.GREATER_THAN,
    threshold: 0,
    severity: AlertSeverity.WARNING
  };

  // Enums for template
  sensorTypes = Object.values(SensorType);
  conditions = Object.values(RuleCondition);
  severities = Object.values(AlertSeverity);
  conditionLabels = CONDITION_LABELS;

  constructor(private ruleEngine: RuleEngineService) { }

  ngOnInit(): void {
    this.ruleEngine.rules$.subscribe(rules => {
      this.rules = rules;
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  addRule(): void {
    if (!this.newRule.name || this.newRule.threshold === null) {
      return;
    }

    this.ruleEngine.addRule({
      name: this.newRule.name,
      sensorType: this.newRule.sensorType,
      condition: this.newRule.condition,
      threshold: this.newRule.threshold,
      severity: this.newRule.severity,
      enabled: true
    });

    this.resetForm();
    this.showAddForm = false;
  }

  deleteRule(id: string): void {
    this.ruleEngine.deleteRule(id);
  }

  toggleRule(id: string): void {
    this.ruleEngine.toggleRule(id);
  }

  resetForm(): void {
    this.newRule = {
      name: '',
      sensorType: SensorType.TEMPERATURE,
      condition: RuleCondition.GREATER_THAN,
      threshold: 0,
      severity: AlertSeverity.WARNING
    };
  }

  getSeverityClass(severity: AlertSeverity): string {
    return `severity-${severity}`;
  }

  getConditionLabel(condition: RuleCondition): string {
    return this.conditionLabels[condition];
  }
}
