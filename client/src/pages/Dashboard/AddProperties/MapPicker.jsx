import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
import { useContext, useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ThemeContext } from '../../../context/ThemeContext';

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
	iconRetinaUrl:
		'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
	shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function LocationMarker({ setLatLng }) {
	const [position, setPosition] = useState(null);

	useMapEvents({
		click(e) {
			setPosition(e.latlng);
			setLatLng(e.latlng);
		},
	});

	return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ setLat, setLng }) {
	const [scrollZoom, setScrollZoom] = useState(true);
	const { theme } = useContext(ThemeContext);

	const handleSetLatLng = (latlng) => {
		setLat(latlng.lat);
		setLng(latlng.lng);
	};

	useEffect(() => {
		const handleKey = (e) =>
			setScrollZoom(e.key === 'ShiftLeft' || e.key === 'ShiftRight');

		window.addEventListener('keydown', handleKey);
		window.addEventListener('keyup', handleKey);
		return () => {
			window.removeEventListener('keydown', handleKey);
			window.removeEventListener('keyup', handleKey);
		};
	}, []);

	return (
		<MapContainer
			center={[23.7806, 90.4193]}
			zoom={6}
			scrollWheelZoom={scrollZoom}
			style={{ height: '400px', width: '100%' }}
		>
			<TileLayer
				url={
					theme === 'dark'
						? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
						: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				}
				attribution='&copy; OpenStreetMap contributors'
			/>
			<LocationMarker setLatLng={handleSetLatLng} />
		</MapContainer>
	);
}
