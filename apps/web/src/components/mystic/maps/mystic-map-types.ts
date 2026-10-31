import type { ReactNode } from 'react';

export type MysticMapMarker = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  tone?: 'client' | 'stylist' | 'hq';
  avatarUrl?: string | null;
  avatarName?: string;
};

export type MysticMapShellProps = {
  markers: MysticMapMarker[];
  heightClassName?: string;
  defaultCenter?: { lat: number; lng: number };
  defaultZoom?: number;
  showRiverNorth?: boolean;
  footer?: ReactNode;
  header?: ReactNode;
};
