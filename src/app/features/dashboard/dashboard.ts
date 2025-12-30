import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorChart } from '../sensor-chart/sensor-chart';
import { AlertPanel } from '../alert-panel/alert-panel';
import { RuleConfig } from '../rule-config/rule-config';
import { FilterControls, FilterOptions } from '../filter-controls/filter-controls';
import { SensorDataService } from '../../core/services/sensor-data.service';
import { Sensor } from '../../core/models/sensor.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SensorChart,
    AlertPanel,
    RuleConfig,
    FilterControls
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  sensors: Sensor[] = [];
  filteredSensors: Sensor[] = [];
  currentFilter: FilterOptions = {
    sensorType: 'all',
    timeRange: 5
  };

  constructor(private sensorDataService: SensorDataService) { }

  ngOnInit(): void {
    this.sensors = this.sensorDataService.getSensors();
    this.filteredSensors = this.sensors;
  }

  onFilterChange(filter: FilterOptions): void {
    this.currentFilter = filter;

    if (filter.sensorType === 'all') {
      this.filteredSensors = this.sensors;
    } else {
      this.filteredSensors = this.sensors.filter(
        s => s.type === filter.sensorType
      );
    }
  }
}
