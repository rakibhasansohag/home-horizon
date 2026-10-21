import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router';

export default function AgentSoldProperties() {
	const axiosSecure = useAxiosSecure();

	const { data: sold = [], isLoading } = useQuery({
		queryKey: ['agent-sold-properties'],
		queryFn: async () => {
			const res = await axiosSecure.get('/agent/sold-properties');
			return res.data;
		},
	});

	if (isLoading)
		return (
			<div className='p-4 space-y-2 max-w-full'>
				{[...Array(6)].map((_, i) => (
					<Skeleton key={i} className='h-10 rounded-md w-full' />
				))}
			</div>
		);

	// Total sold amount calculation
	const totalSold = sold.reduce(
		(acc, item) => acc + parseInt(item.offerAmount),
		0,
	);

	return (
		<div className='w-full space-y-4'>
			<div className='max-w-sm rounded-lg border border-success bg-success-soft p-5'>
				<p className='text-sm text-muted-foreground'>Total Sold Amount</p>
				<h3 className='text-3xl font-semibold tabular-nums text-success'>
					৳{totalSold.toLocaleString()}
				</h3>
			</div>

			<div className='space-y-3 md:hidden'>
				{sold.map((item) => (
					<article
						key={item._id}
						className='space-y-2 rounded-lg border border-border bg-surface p-4'
					>
						<div className='flex gap-3'>
							<img
								src={item.propertyImage}
								alt={item.propertyTitle || item.title}
								className='h-16 w-20 rounded-md object-cover'
							/>
							<div className='min-w-0'>
								<Link
									to={`/all-properties/${item.propertyId}`}
									className='font-medium text-brand hover:underline'
								>
									{item.propertyTitle}
								</Link>
								<p className='text-sm text-muted-foreground'>
									{item.propertyLocation}
								</p>
							</div>
						</div>
						<p className='text-sm'>
							{item.buyerName}
							<span className='text-muted-foreground'> · {item.buyerEmail}</span>
						</p>
						<div className='flex items-center justify-between text-sm'>
							<span className='font-semibold tabular-nums text-success'>
								৳{parseInt(item.offerAmount).toLocaleString()}
							</span>
							<span className='text-muted-foreground'>
								{new Date(item.paidAt).toLocaleDateString('en-BD')}
							</span>
						</div>
					</article>
				))}
			</div>

			<div className='hidden md:block'>
			<Table className='w-full'>
				<TableHeader>
					<TableRow className='bg-muted dark:bg-muted hover:bg-muted'>
						<TableHead>Property</TableHead>
						<TableHead>Title</TableHead>
						<TableHead>Location</TableHead>
						<TableHead>Buyer</TableHead>
						<TableHead>Sold Price</TableHead>
						<TableHead>Sold At</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{sold.map((item, idx) => (
						<TableRow
							key={item._id}
							className={`${
								idx % 2 === 0
									? 'bg-surface dark:bg-background'
									: 'bg-muted dark:bg-muted'
							} hover:bg-muted dark:hover:bg-muted transition-colors`}
						>
							<TableCell>
								<img
									src={item.propertyImage}
									alt={item.title}
									className='w-16 h-12 rounded-md object-cover border border-gray-300 dark:border-gray-700'
								/>
							</TableCell>
							<TableCell className='font-medium text-foreground'>
								<Link to={`/all-properties/${item.propertyId}`}>
									{item.propertyTitle}
								</Link>
							</TableCell>
							<TableCell className='text-muted-foreground'>
								<div className='flex items-center gap-1'>
									<FaMapMarkerAlt />
									<span>{item.propertyLocation}</span>
								</div>
							</TableCell>
							<TableCell>
								<div className='flex items-center gap-3'>
									<Avatar className='w-8 h-8'>
										<AvatarImage src={item?.buyerImage || ''} />
										<AvatarFallback>
											{item.buyerName?.[0] || 'B'}
										</AvatarFallback>
									</Avatar>
									<div className='leading-tight'>
										<p className='text-foreground text-sm'>{item.buyerName}</p>
										<p className='text-sm text-muted-foreground'>
											{item.buyerEmail}
										</p>
									</div>
								</div>
							</TableCell>

							<TableCell className='text-success font-semibold'>
								৳{parseInt(item.offerAmount).toLocaleString()}
							</TableCell>
							<TableCell className='text-muted-foreground text-sm'>
								{new Date(item.paidAt).toLocaleDateString('en-BD')}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			</div>
		</div>
	);
}
