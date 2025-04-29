import { Box, Field, Flex, Typography } from '@strapi/design-system';
import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css?raw';
import styled from 'styled-components';

// Types
interface GeoPosition {
  latitude: number;
  longitude: number;
}

interface GeoPickerProps {
  name: string;
  onChange: (event: { target: { name: string; value: object; type: string } }) => void;
  value?: GeoPosition;
  intlLabel?: {
    defaultMessage: string;
  };
  required?: boolean;
}

interface MapEventsProps {
  onLocationSelected: (lat: number, lng: number) => void;
}

// Styles
const MapWrapper = styled.div`
  height: 400px;
  width: 100%;
  margin-bottom: 16px;
  z-index:0 ;
  
  .leaflet-container {
    height: 100%;
    width: 100%;
    border-radius: 4px;
  }
`;

// Map Events Component
const MapEvents: React.FC<MapEventsProps> = ({ onLocationSelected }) => {
  useMapEvents({
    click: (e: any) => {
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
};

// Default position (Paris)
const DEFAULT_POSITION: GeoPosition = {
  latitude: 48.8566,
  longitude: 2.3522,
};

const GeoPicker: React.FC<GeoPickerProps> = ({
  name,
  onChange,
  value,
  intlLabel,
  required,
}) => {
  const [position, setPosition] = useState<GeoPosition>(() => {
    try {
      return value ?? DEFAULT_POSITION;
    } catch {
      return DEFAULT_POSITION;
    }
  });

  const handlePositionChange = (lat: number, lng: number) => {
    const newPosition = {
      latitude: lat,
      longitude: lng,
    };

    setPosition(newPosition);

    onChange({
      target: {
        name,
        value: newPosition,
        type: 'json',
      },
    });
  };

  // Update position when value prop changes
  useEffect(() => {
      setPosition(value ?? DEFAULT_POSITION);
  }, [value]);

  return (
    <Field.Root name={name} required={required}>
      <Field.Label>{intlLabel?.defaultMessage ?? 'Location'}</Field.Label>
      <Box padding={4}>
        <Flex direction="column" gap={4}>
          <MapWrapper>
            <MapContainer
              center={[position.latitude, position.longitude]}
              zoom={13}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[position.latitude, position.longitude]} />
              <MapEvents onLocationSelected={handlePositionChange} />
            </MapContainer>
          </MapWrapper>

          <Flex gap={4}>
            <Typography>Latitude: {position.latitude}</Typography>
            <Typography>Longitude: {position.longitude}</Typography>
          </Flex>
        </Flex>
      </Box>
      <Field.Error />
      <Field.Hint />
    </Field.Root>
  );
};

export default GeoPicker;