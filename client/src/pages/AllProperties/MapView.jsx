import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	useMap,
	useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useContext, useEffect, useRef } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

import L from 'leaflet';

function pin(active) {
	const size = active ? 22 : 12;
	return new L.DivIcon({
		className: 'hh-pin',
		iconSize: [size, size],
		iconAnchor: [size / 2, size / 2],
		html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:999px;background:var(--brand);border:2px solid var(--paper);box-shadow:0 0 0 ${active ? 4 : 1}px var(--brand)"></span>`,
	});
}

const defaultIcon = pin(false);
const activeIcon = pin(true);

const MapEvents = ({ onBoundsChange, ignoreMove }) => {
	useMapEvents({
		moveend: (event) => {
			if (ignoreMove.current) {
				ignoreMove.current = false;
				return;
			}
			const bounds = event.target.getBounds();
			onBoundsChange({
				swLat: bounds.getSouthWest().lat,
				swLng: bounds.getSouthWest().lng,
				neLat: bounds.getNorthEast().lat,
				neLng: bounds.getNorthEast().lng,
			});
		},
	});
	return null;
};

function ThemeTiles({ theme }) {
	const map = useMap();

	useEffect(() => {
		map.getContainer().classList.toggle('hh-map-dark', theme === 'dark');
	}, [map, theme]);

	return null;
}

function FocusMarker({ activeId, propertiesRef, ignoreMove }) {
	const map = useMap();

	useEffect(() => {
		const property = propertiesRef.current.find((item) => item._id === activeId);
		if (!property?.coordinates) return;
		const latlng = L.latLng(property.coordinates.lat, property.coordinates.lng);
		if (map.getBounds().contains(latlng)) return;
		ignoreMove.current = true;
		map.flyTo(latlng, Math.max(map.getZoom(), 12), { duration: 0.45 });
	}, [activeId, ignoreMove, map, propertiesRef]);

	return null;
}

function PropertyMarker({ property, active, onMarkerClick }) {
	const markerRef = useRef(null);

	useEffect(() => {
		const marker = markerRef.current;
		if (!marker) return;
		if (active) marker.openPopup();
		else marker.closePopup();
	}, [active]);

	if (!property?.coordinates) return null;

	return (
		<Marker
			ref={markerRef}
			position={[property.coordinates.lat, property.coordinates.lng]}
			eventHandlers={{
				click: () => onMarkerClick(property._id),
			}}
			opacity={active ? 1 : 0.35}
			icon={active ? activeIcon : defaultIcon}
			zIndexOffset={active ? 500 : 0}
		>
			<Popup>
				<strong>{property.title}</strong>
				<br />
				{property.location}
			</Popup>
		</Marker>
	);
}

export default function MapView({
	properties,
	onBoundsChange,
	onMarkerClick,
	activeId,
}) {
	const { theme } = useContext(ThemeContext);
	const ignoreMove = useRef(false);
	const propertiesRef = useRef(properties);
	propertiesRef.current = properties;

	return (
		<MapContainer
			center={[23.8103, 90.4125]}
			zoom={12}
			className='z-10 h-full w-full'
			scrollWheelZoom={false}
		>
			<TileLayer
				key={theme}
				url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				attribution='&copy; OpenStreetMap'
			/>
			<ThemeTiles theme={theme} />
			<MapEvents onBoundsChange={onBoundsChange} ignoreMove={ignoreMove} />
			<FocusMarker
				activeId={activeId}
				propertiesRef={propertiesRef}
				ignoreMove={ignoreMove}
			/>
			{properties.map((property) => (
				<PropertyMarker
					key={property._id}
					property={property}
					active={property._id === activeId}
					onMarkerClick={onMarkerClick}
				/>
			))}
		</MapContainer>
	);
}
