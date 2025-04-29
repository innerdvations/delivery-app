import { Link } from "@strapi/design-system";
import React, { useState, useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styled from "styled-components";

// Types
type GeoPosition = [latitude: number, longitude: number];

interface ApiResponse {
  message?: string;
  error?: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
  [key: string]: any;
}

interface GeoPickerInputProps {
  name: string;
  onChange: (event: {
    target: { name: string; value: string; type: string };
  }) => void;
  values?: Truck[];
  intlLabel?: {
    defaultMessage: string;
  };
  required?: boolean;
}

interface Truck {
  id: string;
  documentId: string;
  name: string;
  model: string;
  position: {
    latitude: number;
    longitude: number;
  };
}

interface MapEventsProps {
  onLocationSelected: (latitude: number, longitude: number) => void;
}

// Styled components
const MapWrapper = styled.div`
  height: 600px;
  width: 100%;
  margin-bottom: 16px;

  .leaflet-container {
    height: 100%;
    width: 100%;
    border-radius: 4px;
  }

`;

const DEFAULT_TRUCKS: Truck[] = [];

const barycenter = (points: { latitude: number; longitude: number }[]): GeoPosition => {
  const avg = (values: number[]) =>
    values.reduce((a, b) => a + b, 0) / values.length;

  return [
    avg(points.map((p) => p.latitude)),
    avg(points.map((p) => p.longitude))
  ];
};

const MapWidget: React.FC<GeoPickerInputProps> = ({
  name,
  onChange,
  values,
}) => {
  const [trucks, setTrucks] = useState<Truck[]>(DEFAULT_TRUCKS);
  const [center, setCenter] = useState<GeoPosition>([30, 10]);
  const [zoom, setZoom] = useState<number>(4);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTruckPositions = async () => {
      try {
        const response = await fetch('/truck-tracker/truck-positions');
        
        if (!response.ok) {
          const data = (await response.json()) as ApiResponse;
          throw new Error(data.error?.message || data.message || 'Failed to fetch truck positions');
        }

        const positions = await response.json();
        setTrucks(positions);
        setError(null);
      } catch (error) {
        console.error('Error fetching truck positions:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch truck positions');
      }
    };

    fetchTruckPositions();
  }, []);

  useEffect(() => {
    if (trucks.length > 0) {
      const center = barycenter(trucks.map((t) => t.position));
      setCenter(center);
    }
  }, [trucks]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <MapWrapper>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {trucks.map((truck) => (
          <TruckMarker key={truck.id} truck={truck} />
        ))}
      </MapContainer>
    </MapWrapper>
  );
};

const TruckMarker: React.FC<{ truck: Truck }> = ({ truck }) => {
  const href = `http://localhost:1337/admin/content-manager/collection-types/plugin::truck-tracker.truck/${truck.documentId}`;

  return (
    <Marker position={[truck.position.latitude, truck.position.longitude]}>
      <Popup className="request-popup">
        <h1 style={{ fontWeight: "bold", fontSize: "1.5rem" }}>{truck.name}</h1>
        <p style={{ fontSize: "1rem" }}>{truck.model}</p>
        <Link href={href}>Open in content manager</Link>
      </Popup>
    </Marker>
  );
};

export { MapWidget };
