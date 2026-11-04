import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
	Building,
	CheckCircle2,
	Clock,
	ExternalLink,
	Loader2,
	ShieldCheck,
	User,
	XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PersonAvatar from '@/components/Shared/PersonAvatar';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { formatMoney } from '@/components/Shared/PropertyCard';
import { gateQuery } from '@/lib/queryWait';
import { cn } from '@/lib/utils';
import { listParams, viewList } from '@/lib/pageList';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	FilterSection,
	Pager,
	useListControls,
} from '@/pages/Dashboard/Components/DashboardFilter';

const STATUS_TONE = {
	verified: 'text-brand',
	rejected: 'text-destructive',
	pending: 'text-warning',
};

export default function AdminManageProperties() {
	const axiosSecure = useAxiosSecure();
	const { filter, choose, page, setPage } = useListControls('all');
	const [inspectAgent, setInspectAgent] = useState(null);

	const propertiesQuery = useQuery({
		queryKey: ['admin-properties', page, filter],
		queryFn: async () => {
			const res = await axiosSecure.get('/admin/properties', {
				params: listParams({ page, filter }),
			});
			return res.data;
		},
		placeholderData: keepPreviousData,
	});
	const { refetch } = propertiesQuery;
	const view = viewList(propertiesQuery.data, page, (items) =>
		filter === 'all'
			? items
			: items.filter((prop) => prop.verificationStatus === filter),
	);
	const rows = view?.items || [];
	const gate = gateQuery(propertiesQuery);

	const verifyMutation = useMutation({
		mutationFn: (id) => axiosSecure.patch(`/admin/properties/verify/${id}`),
		onSuccess: () => {
			toast.success('Property verified');
			refetch();
		},
		onError: () => toast.error('Verification failed'),
	});

	const rejectMutation = useMutation({
		mutationFn: (id) => axiosSecure.patch(`/admin/properties/reject/${id}`),
		onSuccess: () => {
			toast.success('Property rejected');
			refetch();
		},
		onError: () => toast.error('Rejection failed'),
	});

	return (
		<div className='w-full space-y-6'>
			<FilterSection
				label='Status'
				value={filter}
				onChange={choose}
				options={[
					{ value: 'all', label: 'All' },
					{ value: 'pending', label: 'Pending' },
					{ value: 'verified', label: 'Verified' },
					{ value: 'rejected', label: 'Rejected' },
				]}
			/>
			{gate === 'error' ? (
				<div className='space-y-3'>
					<p className='text-destructive'>Could not load properties.</p>
					<Button type='button' variant='outline' onClick={() => refetch()}>
						Try again
					</Button>
				</div>
			) : gate === 'loading' ? (
				<ListingSkeleton />
			) : (
				<>
					{!view?.total ? (
						<p className='text-base text-muted-foreground'>
							No properties in this status.
						</p>
					) : (
						<div className='space-y-6'>
							<ul className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
								{rows.map((prop) => (
									<ListingRow
										key={prop._id}
										prop={prop}
										onVerify={() => verifyMutation.mutate(prop._id)}
										onReject={() => rejectMutation.mutate(prop._id)}
										busy={
											verifyMutation.isLoading || rejectMutation.isLoading
										}
										verifying={verifyMutation.isLoading}
										rejecting={rejectMutation.isLoading}
										onInspectAgent={setInspectAgent}
									/>
								))}
							</ul>
							<Pager
								page={page}
								pages={view.pages}
								total={view.total}
								limit={view.limit}
								onPage={setPage}
							/>
						</div>
					)}
				</>
			)}

			<AgentProfileDialog
				agent={inspectAgent}
				open={Boolean(inspectAgent)}
				onOpenChange={(open) => !open && setInspectAgent(null)}
			/>
		</div>
	);
}

function ListingRow({
	prop,
	onVerify,
	onReject,
	busy,
	verifying,
	rejecting,
	onInspectAgent,
}) {
	const reviewCount = Array.isArray(prop.reviews) ? prop.reviews.length : 0;
	const price = `${formatMoney(prop.minPrice)}${
		prop.maxPrice != null && String(prop.maxPrice) !== String(prop.minPrice)
			? ` – ${formatMoney(prop.maxPrice)}`
			: ''
	}`;
	const pending = prop.verificationStatus === 'pending';

	return (
		<li className='flex min-h-44 overflow-hidden rounded-lg border border-border bg-surface'>
			<Link
				to={`/all-properties/${prop._id}`}
				className='relative w-2/5 max-w-72 shrink-0 bg-muted'
			>
				<ListingPhoto src={prop.images?.[0]?.url} alt={prop.title} />
			</Link>
			<div className='flex min-w-0 flex-1 flex-col gap-1 p-4'>
				<div className='flex items-start justify-between gap-3'>
					<Link
						to={`/all-properties/${prop._id}`}
						className='line-clamp-2 font-medium leading-snug transition-colors duration-200 hover:text-brand'
					>
						{prop.title}
					</Link>
					<p
						className={cn(
							'shrink-0 text-sm capitalize',
							STATUS_TONE[prop.verificationStatus] || 'text-muted-foreground',
						)}
					>
						{prop.verificationStatus}
					</p>
				</div>
				<p className='truncate text-sm text-muted-foreground'>{placeLine(prop)}</p>
				<p className='text-base font-medium tabular-nums'>{price}</p>
				{reviewCount > 0 ? (
					<p className='text-sm text-muted-foreground'>
						{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
					</p>
				) : null}

				<AgentHoverTrigger prop={prop} onInspect={onInspectAgent} />

				{pending ? (
					<div className='flex flex-wrap gap-2 pt-2'>
						<Button size='sm' variant='accent' onClick={onVerify} disabled={busy}>
							{verifying ? 'Verifying...' : 'Verify'}
						</Button>
						<Button
							size='sm'
							variant='ghost'
							className='text-destructive'
							onClick={onReject}
							disabled={busy}
						>
							{rejecting ? 'Rejecting...' : 'Reject'}
						</Button>
					</div>
				) : null}
			</div>
		</li>
	);
}

function AgentHoverTrigger({ prop, onInspect }) {
	const axiosSecure = useAxiosSecure();
	const [shouldFetch, setShouldFetch] = useState(false);
	const agentKey = prop.agentEmail || prop.agentName || '';

	const statsQuery = useQuery({
		queryKey: ['agent-property-stats', agentKey],
		queryFn: async () => {
			const res = await axiosSecure.get('/admin/properties', {
				params: { q: prop.agentName || prop.agentEmail },
			});
			const raw = Array.isArray(res.data) ? res.data : (res.data?.items || []);
			return raw.filter((item) =>
				prop.agentEmail
					? item.agentEmail === prop.agentEmail
					: item.agentName === prop.agentName,
			);
		},
		enabled: Boolean(shouldFetch && agentKey),
		staleTime: 5 * 60 * 1000,
	});

	const stats = useMemo(() => {
		const items = statsQuery.data || [];
		return {
			total: items.length,
			verified: items.filter((p) => p.verificationStatus === 'verified').length,
			pending: items.filter((p) => p.verificationStatus === 'pending').length,
			rejected: items.filter((p) => p.verificationStatus === 'rejected').length,
		};
	}, [statsQuery.data]);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type='button'
					onClick={(e) => {
						e.preventDefault();
						onInspect?.({
							name: prop.agentName,
							email: prop.agentEmail,
							image: prop.agentImage,
						});
					}}
					onMouseEnter={() => setShouldFetch(true)}
					onFocus={() => setShouldFetch(true)}
					className='group/agent mt-auto flex min-w-0 items-center gap-2 pt-3 text-left transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded'
					aria-label={`View ${prop.agentName}'s stats and profile`}
				>
					<PersonAvatar
						name={prop.agentName}
						src={prop.agentImage}
						className='size-8 ring-1 ring-border group-hover/agent:ring-brand'
					/>
					<div className='min-w-0'>
						<p
							className='truncate text-sm font-medium leading-none text-foreground group-hover/agent:text-brand'
							title={prop.agentEmail || undefined}
						>
							{prop.agentName}
						</p>
						<p className='truncate text-xs text-muted-foreground mt-0.5'>
							{prop.agentEmail || 'Agent'}
						</p>
					</div>
				</button>
			</TooltipTrigger>
			<TooltipContent
				side='top'
				align='start'
				sideOffset={6}
				className='w-64 p-3 bg-surface text-foreground border border-border shadow-xl rounded-lg [&>span:has(svg)]:hidden'
			>
				<div className='space-y-2.5'>
					<div className='flex items-center gap-2 border-b border-line pb-2'>
						<PersonAvatar
							name={prop.agentName}
							src={prop.agentImage}
							className='size-7 shrink-0'
						/>
						<div className='min-w-0 flex-1'>
							<p className='truncate text-xs font-semibold text-foreground leading-tight'>
								{prop.agentName}
							</p>
							<p className='truncate text-[11px] text-muted-foreground'>
								{prop.agentEmail || 'Agent'}
							</p>
						</div>
					</div>

					{statsQuery.isLoading ? (
						<div className='flex items-center justify-center py-2 text-xs text-muted-foreground gap-1.5'>
							<Loader2 className='size-3.5 animate-spin' />
							<span>Loading statistics...</span>
						</div>
					) : statsQuery.isError ? (
						<p className='text-xs text-destructive'>Could not load statistics.</p>
					) : (
						<div className='grid grid-cols-2 gap-1.5 text-xs'>
							<div className='rounded bg-muted/60 px-2 py-1 flex items-center justify-between'>
								<span className='text-muted-foreground'>Total</span>
								<span className='font-semibold tabular-nums text-foreground'>
									{stats.total}
								</span>
							</div>
							<div className='rounded bg-brand-soft px-2 py-1 flex items-center justify-between'>
								<span className='text-brand font-medium'>Verified</span>
								<span className='font-semibold tabular-nums text-brand'>
									{stats.verified}
								</span>
							</div>
							<div className='rounded bg-warning-soft px-2 py-1 flex items-center justify-between'>
								<span className='text-warning font-medium'>Pending</span>
								<span className='font-semibold tabular-nums text-warning'>
									{stats.pending}
								</span>
							</div>
							<div className='rounded bg-destructive/10 px-2 py-1 flex items-center justify-between'>
								<span className='text-destructive font-medium'>Rejected</span>
								<span className='font-semibold tabular-nums text-destructive'>
									{stats.rejected}
								</span>
							</div>
						</div>
					)}

					<p className='text-[10px] text-muted-foreground text-center pt-0.5 border-t border-line'>
						Click to view profile & properties
					</p>
				</div>
			</TooltipContent>
		</Tooltip>
	);
}

function AgentProfileDialog({ agent, open, onOpenChange }) {
	const axiosSecure = useAxiosSecure();
	const agentKey = agent?.email || agent?.name || '';

	const agentPropsQuery = useQuery({
		queryKey: ['agent-properties-full', agentKey],
		queryFn: async () => {
			const res = await axiosSecure.get('/admin/properties', {
				params: { q: agent?.name || agent?.email },
			});
			const raw = Array.isArray(res.data) ? res.data : (res.data?.items || []);
			return raw.filter((item) =>
				agent?.email
					? item.agentEmail === agent.email
					: item.agentName === agent.name,
			);
		},
		enabled: Boolean(open && agentKey),
		staleTime: 5 * 60 * 1000,
	});

	const properties = agentPropsQuery.data || [];
	const stats = useMemo(() => ({
		total: properties.length,
		verified: properties.filter((p) => p.verificationStatus === 'verified').length,
		pending: properties.filter((p) => p.verificationStatus === 'pending').length,
		rejected: properties.filter((p) => p.verificationStatus === 'rejected').length,
	}), [properties]);

	if (!agent) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-2xl max-h-[85vh] flex flex-col p-6 overflow-hidden'>
				<DialogHeader className='shrink-0 pb-3 border-b border-line'>
					<div className='flex items-center gap-4'>
						<PersonAvatar
							name={agent.name}
							src={agent.image}
							className='size-14 ring-2 ring-border shrink-0'
						/>
						<div className='min-w-0 flex-1 text-left'>
							<div className='flex items-center gap-2'>
								<DialogTitle className='text-xl font-display font-medium text-foreground truncate'>
									{agent.name}
								</DialogTitle>
								<span className='inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand shrink-0'>
									<ShieldCheck className='size-3.5' />
									Agent
								</span>
							</div>
							<DialogDescription className='text-sm text-muted-foreground truncate mt-0.5'>
								{agent.email || 'Registered Agent'}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className='flex-1 overflow-y-auto py-4 space-y-5 pr-1'>
					{/* Stat Metric Cards */}
					<div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
						<div className='rounded-lg border border-line bg-surface p-3 space-y-1'>
							<p className='text-xs text-muted-foreground flex items-center gap-1.5'>
								<Building className='size-3.5 text-muted-foreground' />
								Total
							</p>
							<p className='text-xl font-semibold tabular-nums text-foreground'>
								{agentPropsQuery.isLoading ? '—' : stats.total}
							</p>
						</div>
						<div className='rounded-lg border border-brand/20 bg-brand-soft p-3 space-y-1'>
							<p className='text-xs text-brand font-medium flex items-center gap-1.5'>
								<CheckCircle2 className='size-3.5 text-brand' />
								Verified
							</p>
							<p className='text-xl font-semibold tabular-nums text-brand'>
								{agentPropsQuery.isLoading ? '—' : stats.verified}
							</p>
						</div>
						<div className='rounded-lg border border-warning/20 bg-warning-soft p-3 space-y-1'>
							<p className='text-xs text-warning font-medium flex items-center gap-1.5'>
								<Clock className='size-3.5 text-warning' />
								Pending
							</p>
							<p className='text-xl font-semibold tabular-nums text-warning'>
								{agentPropsQuery.isLoading ? '—' : stats.pending}
							</p>
						</div>
						<div className='rounded-lg border border-destructive/20 bg-destructive/10 p-3 space-y-1'>
							<p className='text-xs text-destructive font-medium flex items-center gap-1.5'>
								<XCircle className='size-3.5 text-destructive' />
								Rejected
							</p>
							<p className='text-xl font-semibold tabular-nums text-destructive'>
								{agentPropsQuery.isLoading ? '—' : stats.rejected}
							</p>
						</div>
					</div>

					{/* Property Listing Section */}
					<div className='space-y-3'>
						<div className='flex items-center justify-between'>
							<h4 className='text-sm font-medium text-foreground'>
								Listed Properties ({properties.length})
							</h4>
						</div>

						{agentPropsQuery.isLoading ? (
							<div className='space-y-3'>
								{Array.from({ length: 3 }, (_, i) => (
									<div
										key={i}
										className='flex items-center gap-3 rounded-lg border border-line p-3'
									>
										<Skeleton className='size-14 rounded-md shrink-0' />
										<div className='flex-1 space-y-1.5'>
											<Skeleton className='h-4 w-1/2' />
											<Skeleton className='h-3 w-1/3' />
										</div>
									</div>
								))}
							</div>
						) : properties.length === 0 ? (
							<div className='rounded-lg border border-dashed border-line p-8 text-center'>
								<p className='text-sm text-muted-foreground'>
									No properties found for this agent.
								</p>
							</div>
						) : (
							<ul className='divide-y divide-line rounded-lg border border-line bg-surface overflow-hidden'>
								{properties.map((item) => {
									const price = `${formatMoney(item.minPrice)}${
										item.maxPrice != null &&
										String(item.maxPrice) !== String(item.minPrice)
											? ` – ${formatMoney(item.maxPrice)}`
											: ''
									}`;
									return (
										<li
											key={item._id}
											className='flex items-center justify-between gap-3 p-3 transition-colors hover:bg-muted/40'
										>
											<div className='flex min-w-0 items-center gap-3'>
												<div className='size-12 shrink-0 overflow-hidden rounded bg-muted'>
													{item.images?.[0]?.url ? (
														<img
															src={item.images[0].url}
															alt=''
															className='h-full w-full object-cover'
														/>
													) : null}
												</div>
												<div className='min-w-0'>
													<Link
														to={`/all-properties/${item._id}`}
														target='_blank'
														rel='noreferrer'
														className='line-clamp-1 font-medium text-sm text-foreground hover:text-brand transition-colors'
													>
														{item.title}
													</Link>
													<p className='truncate text-xs text-muted-foreground'>
														{placeLine(item)}
													</p>
													<p className='text-xs font-medium tabular-nums text-foreground mt-0.5'>
														{price}
													</p>
												</div>
											</div>
											<div className='flex shrink-0 items-center gap-2'>
												<span
													className={cn(
														'text-xs capitalize font-medium',
														STATUS_TONE[item.verificationStatus] ||
															'text-muted-foreground',
													)}
												>
													{item.verificationStatus}
												</span>
												<Button asChild size='sm' variant='ghost' className='h-8 px-2'>
													<Link
														to={`/all-properties/${item._id}`}
														target='_blank'
														rel='noreferrer'
														title='View property details'
													>
														<ExternalLink className='size-3.5' />
														<span className='sr-only'>View details</span>
													</Link>
												</Button>
											</div>
										</li>
									);
								})}
							</ul>
						)}
					</div>
				</div>

				<DialogFooter className='shrink-0 pt-3 border-t border-line flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2'>
					<Button
						asChild
						variant='outline'
						size='sm'
						className='w-full sm:w-auto text-xs'
					>
						<Link to={`/dashboard/manage-users?q=${encodeURIComponent(agent.email || agent.name)}`}>
							<User className='size-3.5 mr-1.5' />
							Manage in Users Table
						</Link>
					</Button>
					<Button
						type='button'
						variant='default'
						size='sm'
						onClick={() => onOpenChange(false)}
						className='w-full sm:w-auto text-xs'
					>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function placeLine(prop) {
	const type = String(prop.propertyType || '').trim();
	const location = String(prop.location || '').trim();
	const title = String(prop.title || '').toLowerCase();
	if (!type || title.includes(type.toLowerCase())) return location;
	if (!location) return type;
	if (location.toLowerCase().includes(type.toLowerCase())) return location;
	const label = type.charAt(0).toUpperCase() + type.slice(1);
	return `${label} in ${location}`;
}

function ListingPhoto({ src, alt }) {
	const [failed, setFailed] = useState(false);
	if (!src || failed) return null;
	return (
		<img
			src={src}
			alt={alt || ''}
			className='absolute inset-0 h-full w-full object-cover'
			onError={() => setFailed(true)}
		/>
	);
}

function ListingSkeleton() {
	return (
		<div className='grid grid-cols-1 gap-4 xl:grid-cols-2' aria-busy='true'>
			<span className='sr-only'>Loading properties</span>
			{Array.from({ length: 6 }, (_, index) => (
				<div
					key={index}
					className='flex min-h-44 overflow-hidden rounded-lg border border-border bg-surface'
				>
					<Skeleton className='w-2/5 max-w-72 rounded-none' />
					<div className='flex-1 space-y-2 p-4'>
						<Skeleton className='h-4 w-3/4' />
						<Skeleton className='h-3 w-1/2' />
						<Skeleton className='h-4 w-2/3' />
					</div>
				</div>
			))}
		</div>
	);
}
