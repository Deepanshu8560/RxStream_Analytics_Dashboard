import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SensorType } from '../../core/models/sensor.model';

export interface FilterOptions {
  sensorType: SensorType | 'all';
  timeRange: number; // in minutes
}

@Component({
  selector: 'app-filter-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-controls.html',
  styleUrl: './filter-controls.scss',
})
export class FilterControls {
  @Output() filterChange = new EventEmitter<FilterOptions>();

  selectedSensorType: SensorType | 'all' = 'all';
  selectedTimeRange: number = 5;

  sensorTypes: Array<{ value: SensorType | 'all', label: string }> = [
    { value: 'all', label: 'All Sensors' },
    { value: SensorType.TEMPERATURE, label: 'Temperature' },
    { value: SensorType.PRESSURE, label: 'Pressure' },
    { value: SensorType.VIBRATION, label: 'Vibration' }
  ];

  timeRanges: Array<{ value: number, label: string }> = [
    { value: 1, label: 'Last 1 min' },
    { value: 5, label: 'Last 5 min' },
    { value: 15, label: 'Last 15 min' },
    { value: 60, label: 'Last 1 hour' }
  ];

  onFilterChange(): void {
    this.filterChange.emit({
      sensorType: this.selectedSensorType,
      timeRange: this.selectedTimeRange
    });
  }
}
