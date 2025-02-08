import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface VeteranResource {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

interface MapDisplayProps {
  resources: VeteranResource[];
  userLocation: {
    lat: number;
    lon: number;
  };
}

// Fix for default marker icon
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

export const MapDisplay: React.FC<MapDisplayProps> = ({ resources, userLocation }) => {
  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lon] as [number, number]}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      
      {/* User Location Marker */}
      <Marker position={[userLocation.lat, userLocation.lon]}>
        <Popup>Your Location</Popup>
      </Marker>

      {/* Resource Markers */}
      {resources.map((resource) => (
        <Marker
          key={resource.id}
          position={[resource.latitude, resource.longitude]}
        >
          <Popup>
            <div>
              <strong>{resource.name}</strong>
              <br />
              {resource.address}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
