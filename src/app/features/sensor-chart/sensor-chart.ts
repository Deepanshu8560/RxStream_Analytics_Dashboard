import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Sensor, SensorReading } from '../../core/models/sensor.model';
import { SensorDataService } from '../../core/services/sensor-data.service';
import { RuleEngineService } from '../../core/services/rule-engine.service';
import { AlertService } from '../../core/services/alert.service';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-sensor-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sensor-chart.html',
  styleUrl: './sensor-chart.scss',
})
export class SensorChart implements OnInit, OnDestroy, AfterViewInit {
  @Input() sensorId!: string;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  sensor?: Sensor;
  chart?: Chart;
  dataPoints: SensorReading[] = [];
  currentValue: number = 0;
  minValue: number = 0;
  maxValue: number = 0;
  avgValue: number = 0;

  private subscription?: Subscription;
  private readonly MAX_DATA_POINTS = 20;

  constructor(
    private sensorDataService: SensorDataService,
    private ruleEngine: RuleEngineService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.sensor = this.sensorDataService.getSensor(this.sensorId);
    if (!this.sensor) {
      console.error(`Sensor not found: ${this.sensorId}`);
      return;
    }
  }

  ngAfterViewInit(): void {
    this.initializeChart();
    this.subscribeToSensorData();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.chart?.destroy();
  }

  private initializeChart(): void {
    if (!this.chartCanvas || !this.sensor) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: `${this.sensor.name} (${this.sensor.unit})`,
          data: [],
          borderColor: this.getChartColor(this.sensor.type),
          backgroundColor: this.getChartBackgroundColor(this.sensor.type),
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 750,
          easing: 'easeInOutQuart'
        },
        scales: {
          x: {
            display: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
            },
            ticks: {
              color: '#a0aec0',
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8
            }
          },
          y: {
            display: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
            },
            ticks: {
              color: '#a0aec0'
            },
            min: this.sensor.minValue,
            max: this.sensor.maxValue
          }
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#ffffff',
              font: {
                family: 'Inter',
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(10, 14, 39, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#a0aec0',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            displayColors: false
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private subscribeToSensorData(): void {
    if (!this.sensor) return;

    const stream$ = this.sensorDataService.getSensorStream(this.sensorId);
    if (!stream$) return;

    this.subscription = stream$.subscribe(reading => {
      this.addDataPoint(reading);
      this.updateStatistics();
      this.evaluateRules(reading);
    });
  }

  private addDataPoint(reading: SensorReading): void {
    this.dataPoints.push(reading);

    // Keep only the last MAX_DATA_POINTS
    if (this.dataPoints.length > this.MAX_DATA_POINTS) {
      this.dataPoints.shift();
    }

    this.updateChart();
  }

  private updateChart(): void {
    if (!this.chart) return;

    const labels = this.dataPoints.map(dp =>
      new Date(dp.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    );

    const data = this.dataPoints.map(dp => dp.value);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.update('none'); // Update without animation for smooth real-time updates
  }

  private updateStatistics(): void {
    if (this.dataPoints.length === 0) {
      this.currentValue = 0;
      this.minValue = 0;
      this.maxValue = 0;
      this.avgValue = 0;
      return;
    }

    const values = this.dataPoints.map(dp => dp.value);
    this.currentValue = values[values.length - 1];
    this.minValue = Math.min(...values);
    this.maxValue = Math.max(...values);
    this.avgValue = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
  }

  private evaluateRules(reading: SensorReading): void {
    const alert = this.ruleEngine.evaluateReading(reading);
    if (alert) {
      this.alertService.addAlert(alert);
    }
  }

  private getChartColor(type: string): string {
    const colors: Record<string, string> = {
      'temperature': '#f59e0b',
      'pressure': '#3b82f6',
      'vibration': '#10b981'
    };
    return colors[type] || '#667eea';
  }

  private getChartBackgroundColor(type: string): string {
    const colors: Record<string, string> = {
      'temperature': 'rgba(245, 158, 11, 0.1)',
      'pressure': 'rgba(59, 130, 246, 0.1)',
      'vibration': 'rgba(16, 185, 129, 0.1)'
    };
    return colors[type] || 'rgba(102, 126, 234, 0.1)';
  }

  get isActive(): boolean {
    return this.sensorDataService.isSensorActive(this.sensorId);
  }
}
