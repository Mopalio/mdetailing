import React from 'react';
import { Gallery } from './Gallery';

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title: string;
  description: string;
}

export interface GalleryData {
  title: string;
  subtitle: string;
  images: GalleryImage[];
}

export function GalleryMapper(data: GalleryData) {
  return React.createElement(Gallery, data);
} 