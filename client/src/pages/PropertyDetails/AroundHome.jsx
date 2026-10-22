import { useContext, useEffect } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMoney } from '@/components/Shared/PropertyCard';
import { homeFacts } from '@/lib/amenities';
import { ThemeContext } from '@/context/ThemeContext';
import useAxios from '@/hooks/useAxios';

const SPAN = 0.05;

function pin(active) {
	const size = active ? 22 : 12;
	return new L.DivIcon({
		className: 'hh-pin',
		iconSize: [size, size],
		iconAnchor: [size / 2, size / 2],
		html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:999px;background:var(--brand);border:2px solid var(--paper);box-shadow:0 0 0 ${active ? 4 : 1}px var(--brand)"></span>`,
	});
}

const homePin = pin(true);
const nearPin = pin(false);

function ThemeTiles({ theme }) {
	const map = useMap();

	useEffect(() => {
		map.getContainer().classList.toggle('hh-map-dark', theme === 'dark');
	}, [map, theme]);

	return null;
}

function pointOf(property) {
	const lat = Number(property?.coordinates?.lat);
	const lng = Number(property?.coordinates?.lng);
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
	return { lat, lng };
}

function distance(from, property) {
	const point = pointOf(property);
	if (!point) return Number.POSITIVE_INFINITY;
	const dLat = point.lat - from.lat;
	const dLng = point.lng - from.lng;
	return dLat * dLat + dLng * dLng;
}

function NearbyMap({ home, nearby }) {
	const { theme } = useContext(ThemeContext);
	const pins = [home, ...nearby].filter((property) => pointOf(property));

	return (
		<MapContainer
			center={[home.coordinates.lat, home.coordinates.lng]}
			zoom={13}
			className='z-10 h-full w-full'
			scrollWheelZoom={false}
		>
			<TileLayer
				url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				attribution='&copy; OpenStreetMap'
			/>
			<ThemeTiles theme={theme} />
			{pins.map((property) => (
				<Marker
					key={property._id}
					position={[
						Number(property.coordinates.lat),
						Number(property.coordinates.lng),
					]}
					icon={property._id === home._id ? homePin : nearPin}
				>
					<Popup autoPan={false}>
						<strong>{property.title}</strong>
						<br />
						{property._id === home._id ? 'This home' : property.location}
					</Popup>
				</Marker>
			))}
		</MapContainer>
	);
}

export default function AroundHome({ property }) {
	const axios = useAxios();
	const here = pointOf(property);

	const box = here
		? {
				swLat: Math.round((here.lat - SPAN) * 1000) / 1000,
				swLng: Math.round((here.lng - SPAN) * 1000) / 1000,
				neLat: Math.round((here.lat + SPAN) * 1000) / 1000,
				neLng: Math.round((here.lng + SPAN) * 1000) / 1000,
			}
		: null;

	const { data: nearby = [], isLoading, isFetching } = useQuery({
		queryKey: ['nearby-properties', property?._id, box],
		enabled: !!box,
		staleTime: 5 * 60 * 1000,
		queryFn: async () => {
			const params = new URLSearchParams({
				search: '',
				sort: 'desc',
				swLat: box.swLat,
				swLng: box.swLng,
				neLat: box.neLat,
				neLng: box.neLng,
			});
			const res = await axios.get(`/properties/verified?${params.toString()}`);
			const list = Array.isArray(res.data) ? res.data : [];
			return list
				.filter((item) => item._id !== property._id && pointOf(item))
				.sort((a, b) => distance(here, a) - distance(here, b))
				.slice(0, 4);
		},
	});

	return (
		<section className='space-y-4'>
			<h2 className='text-xl font-semibold'>Around this home</h2>
			{!here ? (
				<p className='text-base text-muted-foreground'>
					This listing does not include a map location.
				</p>
			) : (
				<div className='grid gap-4 lg:grid-cols-2'>
					<div className='h-80 overflow-hidden rounded-lg border border-border'>
						<NearbyMap home={property} nearby={nearby} />
					</div>
					<div className='space-y-3'>
						{(isLoading || isFetching) && nearby.length === 0 ? (
							Array.from({ length: 3 }, (_, index) => (
								<Skeleton key={index} className='h-20 w-full' />
							))
						) : nearby.length === 0 ? (
							<p className='text-base text-muted-foreground'>
								No other verified homes in this area.
							</p>
						) : (
							nearby.map((item) => {
								const image = item.images?.[0]?.url;
								return (
									<article
										key={item._id}
										className='flex gap-3 rounded-lg border border-border bg-surface p-2'
									>
										{image ? (
											<img
												src={image}
												alt=''
												className='h-16 w-20 shrink-0 rounded-md object-cover'
											/>
										) : (
											<div className='h-16 w-20 shrink-0 rounded-md bg-muted' />
										)}
										<div className='min-w-0 py-1'>
											<h3 className='truncate text-base font-semibold'>
												<Link
													to={`/all-properties/${item._id}`}
													className='hover:text-brand hover:underline'
												>
													{item.title || 'Property'}
												</Link>
											</h3>
											<p className='truncate text-sm text-muted-foreground'>
												{item.location}
											</p>
											{homeFacts(item) ? (
												<p className='truncate text-sm text-muted-foreground'>
													{homeFacts(item)}
												</p>
											) : null}
											<p className='mt-1 text-sm font-semibold tabular-nums'>
												{formatMoney(item.minPrice)}
											</p>
										</div>
									</article>
								);
							})
						)}
					</div>
				</div>
			)}
		</section>
	);
}
