import React from 'react';
import { VeteranResource } from '../Api/OverpassService';

interface MapDisplayProps {
  resources: VeteranResource[];
  userLocation: {
    lat: number;
    lon: number;
  };
}

export const MapDisplay: React.FC<MapDisplayProps> = () => {
  return (
    <div>Map Display Component - To be implemented in Phase 4</div>
  );
};
