type MapStyle = {
  elementType?: string;
  featureType?: string;
  stylers: Record<string, string | number>[];
};

/** Muted sage + paper — matches Mystic shell (Map Style JSON). */
export const MYSTIC_GOOGLE_MAP_STYLE: MapStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#f4f2ec' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5c6358' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f4f2ec' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#c8cfc0' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#e8e4d8' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#dce8d4' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#f0ede4' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#e6dcc8' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#e8e4d8' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#c9ddd8' }],
  },
];
