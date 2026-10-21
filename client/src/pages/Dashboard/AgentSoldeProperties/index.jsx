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
		<div className='overflow-x-auto bg-background p-6 space-y-4 w-full'>
			<div className='bg-success-soft dark:bg-success-soft border border-success dark:border-success rounded-lg shadow p-5 max-w-sm'>
				<p className='text-muted-foreground text-sm'>Total Sold Amount</p>
				<h3 className='text-3xl font-bold text-success dark:text-success'>
					৳ {totalSold.toLocaleString()}
				</h3>
			</div>

			<Table className='!w-full !max-w-7xl shadow-md'>
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
										<p className='text-xs text-muted-foreground'>
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
	);
}
