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

// Format a duration in milliseconds to a human-readable string
export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
};

// Format time since a given date to a human-readable string
export const formatTimeSince = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  if (seconds > 0) return `${seconds}s ago`;
  return 'Just now';
};