import React from 'react';
import { Team } from './Team';

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  image: string;
  description: string;
  experience: string;
  specialties: string[];
}

export interface TeamData {
  title: string;
  subtitle: string;
  members: TeamMember[];
}

export function TeamMapper(data: TeamData) {
  return React.createElement(Team, data);
} 