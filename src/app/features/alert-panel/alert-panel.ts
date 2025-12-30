import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Alert } from '../../core/models/alert.model';
import { AlertSeverity } from '../../core/models/rule.model';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-alert-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-panel.html',
  styleUrl: './alert-panel.scss',
})
export class AlertPanel implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  unacknowledgedCount: number = 0;
  private subscription?: Subscription;

  constructor(private alertService: AlertService) { }

  ngOnInit(): void {
    this.subscription = this.alertService.alerts$.subscribe(alerts => {
      this.alerts = alerts.slice(0, 10); // Show only the 10 most recent
      this.unacknowledgedCount = this.alertService.getUnacknowledgedCount();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  acknowledgeAlert(alertId: string): void {
    this.alertService.acknowledgeAlert(alertId);
  }

  acknowledgeAll(): void {
    this.alertService.acknowledgeAll();
  }

  clearAll(): void {
    this.alertService.clearAlerts();
  }

  getSeverityClass(severity: AlertSeverity): string {
    return `severity-${severity}`;
  }

  getSeverityIcon(severity: AlertSeverity): string {
    const icons: Record<AlertSeverity, string> = {
      [AlertSeverity.INFO]: 'ℹ️',
      [AlertSeverity.WARNING]: '⚠️',
      [AlertSeverity.CRITICAL]: '🔴'
    };
    return icons[severity];
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}
