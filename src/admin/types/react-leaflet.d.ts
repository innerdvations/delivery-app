declare module 'react-leaflet' {
  import { ComponentType, ReactNode } from 'react';
  import { Map, TileLayer, Marker, Popup } from 'leaflet';

  export interface MapContainerProps {
    center: [number, number];
    zoom: number;
    scrollWheelZoom?: boolean;
    children?: ReactNode;
  }

  export interface TileLayerProps {
    attribution: string;
    url: string;
  }

  export interface MarkerProps {
    position: [number, number];
    children?: ReactNode;
  }

  export interface PopupProps {
    className?: string;
    children?: ReactNode;
  }

  export const MapContainer: ComponentType<MapContainerProps>;
  export const TileLayer: ComponentType<TileLayerProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const Popup: ComponentType<PopupProps>;
}
