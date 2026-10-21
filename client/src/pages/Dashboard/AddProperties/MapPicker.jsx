import { MapContainer, TileLayer, useMapEvents, Marker, useMap } from 'react-leaflet';
import { useContext, useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ThemeContext } from '../../../context/ThemeContext';

const pickerPin = new L.DivIcon({
	className: 'hh-pin',
	iconSize: [16, 16],
	iconAnchor: [8, 8],
	html: '<span style="display:block;width:16px;height:16px;border-radius:999px;background:var(--brand);border:2px solid var(--paper);box-shadow:0 0 0 3px var(--brand)"></span>',
});

function ThemeTiles({ theme }) {
	const map = useMap();

	useEffect(() => {
		map.getContainer().classList.toggle('hh-map-dark', theme === 'dark');
	}, [map, theme]);

	return null;
}

function LocationMarker({ setLatLng }) {
	const [position, setPosition] = useState(null);

	useMapEvents({
		click(e) {
			setPosition(e.latlng);
			setLatLng(e.latlng);
		},
	});

	return position ? <Marker position={position} icon={pickerPin} /> : null;
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
		<div className='overflow-hidden rounded-lg border border-border'>
			<MapContainer
				center={[23.7806, 90.4193]}
				zoom={6}
				scrollWheelZoom={scrollZoom}
				style={{ height: '24rem', width: '100%' }}
			>
				<ThemeTiles theme={theme} />
				<TileLayer
					url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
					attribution='&copy; OpenStreetMap contributors'
				/>
				<LocationMarker setLatLng={handleSetLatLng} />
			</MapContainer>
		</div>
	);
}
