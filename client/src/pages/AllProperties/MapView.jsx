import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

import L from 'leaflet';

function pin(active) {
	const size = active ? 18 : 14;
	return new L.DivIcon({
		className: 'hh-pin',
		iconSize: [size, size],
		iconAnchor: [size / 2, size / 2],
		html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:999px;background:#1F5C4A;border:2px solid #fff;box-shadow:0 0 0 1px #1F5C4A"></span>`,
	});
}

const defaultIcon = pin(false);
const activeIcon = pin(true);

const MapEvents = ({ onBoundsChange }) => {
	useMapEvents({
		moveend: (e) => {
			const bounds = e.target.getBounds();
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

export default function MapView({
	properties,
	onBoundsChange,
	onMarkerClick,
	activeId,
}) {
	const { theme } = useContext(ThemeContext);

	return (
		<MapContainer
			center={[23.8103, 90.4125]}
			zoom={12}
			className='w-full h-full z-10'
			scrollWheelZoom={false}
		>
			<TileLayer
				url={
					theme === 'dark'
						? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
						: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				}
			/>
			<MapEvents onBoundsChange={onBoundsChange} />
			{properties.map((prop) => (
				<Marker
					key={prop._id}
					position={[prop.coordinates.lat, prop.coordinates.lng]}
					eventHandlers={{
						click: () => onMarkerClick(prop._id),
					}}
					icon={prop._id === activeId ? activeIcon : defaultIcon}
				>
					<Popup>
						<b>{prop.title}</b> <br />
						{prop.location}
					</Popup>
				</Marker>
			))}
		</MapContainer>
	);
}
