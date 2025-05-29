import React from 'react';
import { Utensils, Bed, FileWarning as Running, Book, Tv, Laptop, Coffee, Pill, ShowerHead as Shower, Heart, Music, Gamepad, Clock } from 'lucide-react-native';

// Get a light version of a color for use in light mode
export const getLightColor = (color: string): string => {
  // Convert hex to RGB
  let r = parseInt(color.slice(1, 3), 16);
  let g = parseInt(color.slice(3, 5), 16);
  let b = parseInt(color.slice(5, 7), 16);
  
  // Lighten the color by mixing with white
  r = Math.floor(r + (255 - r) * 0.7);
  g = Math.floor(g + (255 - g) * 0.7);
  b = Math.floor(b + (255 - b) * 0.7);
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Get the corresponding icon component for an activity
export const getActivityIcon = (iconName: string) => {
  switch (iconName) {
    case 'utensils':
      return Utensils;
    case 'bed':
      return Bed;
    case 'running':
      return Running;
    case 'book':
      return Book;
    case 'tv':
      return Tv;
    case 'laptop':
      return Laptop;
    case 'coffee':
      return Coffee;
    case 'pill':
      return Pill;
    case 'shower':
      return Shower;
    case 'heart':
      return Heart;
    case 'music':
      return Music;
    case 'gamepad':
      return Gamepad;
    default:
      return Clock;
  }
};

export const formatTimeSince = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  if (hours > 24) {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  
  return `${parts.join(' ')} ago`;
};

export const formatDuration = (duration: number): string => {
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((duration % (1000 * 60)) / 1000);
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  
  return parts.join(' ');
};