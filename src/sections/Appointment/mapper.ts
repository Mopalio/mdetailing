import React from 'react';
import { Appointment } from './Appointment';

export interface AppointmentData {
  title: string;
  subtitle: string;
}

export function AppointmentMapper(data: AppointmentData) {
  return React.createElement(Appointment, data);
} 