import React from 'react';
import { Gallery } from './Gallery';

export interface GalleryData {
  title: string;
  subtitle: string;
  instagramUrl?: string;
}

export function GalleryMapper(data: GalleryData) {
  return React.createElement(Gallery, data);
}
