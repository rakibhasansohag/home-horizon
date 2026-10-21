import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ConfirmActionModal from '@/components/Shared/ConfirmActionModal';
import {
	FilterSection,
	ResultSummary,
	ShowMore,
	usePreview,
} from '@/pages/Dashboard/Components/DashboardFilter';

const ROLE_LABEL = {
	all: 'All people',
	user: 'Users',
	agent: 'Agents',
	admin: 'Admins',
	fraud: 'Fraud',
};

export default function AdminManageUsers() {
	const axios = useAxiosSecure();
	const { filter, choose, visible, showMore } = usePreview('all');

	const [selectedUser, setSelectedUser] = useState(null);
	const [modalType, setModalType] = useState(null); // 'admin' | 'agent' | 'fraud' | 'delete'

	const {
		data: users = [],
		refetch,
		isLoading,
	} = useQuery({
		queryKey: ['admin-users'],
		queryFn: () => axios.get('/admin/users').then((r) => r.data),
	});

	const roleMutation = useMutation({
		mutationFn: ({ id, role }) =>
			axios.patch(`/admin/users/${id}/role`, { role }),
		onSuccess: () => toast.success('Role updated') && refetch(),
	});

	const fraudMutation = useMutation({
		mutationFn: ({ id, uid }) =>
			axios.patch(`/admin/users/${id}/fraud`, { uid }),
		onSuccess: () => toast.success('Marked as fraud') && refetch(),
	});

	const deleteMutation = useMutation({
		mutationFn: (id) => axios.delete(`/admin/users/${id}`),
		onSuccess: () => toast.success('User deleted') && refetch(),
	});

	const isAnyMutationLoading =
		roleMutation.isLoading ||
		fraudMutation.isLoading ||
		deleteMutation.isLoading;
	if (isLoading)
		return (
			<div className='p-4 space-y-2 max-w-full w-full mt-10'>
				{[...Array(6)].map((_, i) => (
					<Skeleton key={i} className='h-10 rounded-md w-full' />
				))}
				<Table className='!w-full !max-w-full'>
					<TableBody>
						<TableRow className='bg-muted'>
							<TableCell>
								<Skeleton className='h-4 w-32' />
							</TableCell>
							<TableCell>
								<Skeleton className='h-4 w-32' />
							</TableCell>
							<TableCell>
								<Skeleton className='h-4 w-16' />
							</TableCell>
							<TableCell>
								<Skeleton className='h-4 w-16' />
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</div>
		);

	const filtered =
		filter === 'all' ? users : users.filter((person) => person.role === filter);
	const rows = filtered.slice(0, visible);

	return (
		<div className='w-full space-y-6'>
			<FilterSection
				label='Role'
				value={filter}
				onChange={choose}
				options={[
					{ value: 'all', label: 'All' },
					{ value: 'user', label: 'Users' },
					{ value: 'agent', label: 'Agents' },
					{ value: 'admin', label: 'Admins' },
					{ value: 'fraud', label: 'Fraud' },
				]}
			/>
			<ResultSummary label={ROLE_LABEL[filter]} value={filtered.length} />
			{rows.length === 0 ? (
				<p className='text-base text-muted-foreground'>No people in this role.</p>
			) : (
			<div className='space-y-6'>
			<div className='space-y-3 md:hidden'>
				{rows.map((user) => (
					<article
						key={user._id}
						className='space-y-3 rounded-lg border border-border bg-surface p-4'
					>
						<div className='flex items-start justify-between gap-3'>
							<div>
								<p className='font-medium'>{user.name}</p>
								<p className='text-sm text-muted-foreground'>{user.email}</p>
							</div>
							<Badge variant='outline' className='capitalize'>
								{user.role}
							</Badge>
						</div>
						<div className='flex flex-wrap gap-2'>
							{user.role === 'user' && (
								<>
									<Button
										size='sm'
										onClick={() => {
											setSelectedUser(user);
											setModalType('admin');
										}}
									>
										Make Admin
									</Button>
									<Button
										size='sm'
										onClick={() => {
											setSelectedUser(user);
											setModalType('agent');
										}}
									>
										Make Agent
									</Button>
								</>
							)}
							{user.role === 'agent' && (
								<Button
									size='sm'
									variant='destructive'
									onClick={() => {
										setSelectedUser(user);
										setModalType('fraud');
									}}
								>
									Mark as Fraud
								</Button>
							)}
							<Button
								size='sm'
								variant='destructive'
								onClick={() => {
									setSelectedUser(user);
									setModalType('delete');
								}}
							>
								Delete User
							</Button>
						</div>
					</article>
				))}
			</div>
			<div className='hidden md:block'>
			<Table className='w-full'>
				<TableHeader>
					<TableRow className='bg-muted hover:bg-muted'>
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((user) => (
						<TableRow
							key={user._id}
							className='even:bg-muted hover:bg-muted transition'
						>
							<TableCell>{user.name}</TableCell>
							<TableCell>{user.email}</TableCell>
							<TableCell>
								<Badge variant='outline' className='capitalize'>
									{user.role}
								</Badge>
							</TableCell>
							<TableCell className='flex gap-2'>
								{user.role === 'user' && (
									<>
										<Button
											size='sm'
											onClick={() => {
												setSelectedUser(user);
												setModalType('admin');
											}}
										>
											Make Admin
										</Button>

										<Button
											size='sm'
											onClick={() => {
												setSelectedUser(user);
												setModalType('agent');
											}}
										>
											Make Agent
										</Button>
									</>
								)}

								{user.role === 'agent' && (
									<Button
										size='sm'
										variant='destructive'
										onClick={() => {
											setSelectedUser(user);
											setModalType('fraud');
										}}
									>
										Mark as Fraud
									</Button>
								)}

								<Button
									size='sm'
									variant='destructive'
									onClick={() => {
										setSelectedUser(user);
										setModalType('delete');
									}}
								>
									Delete User
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			</div>
			<ShowMore shown={rows.length} total={filtered.length} onMore={showMore} />
			</div>
			)}
			<ConfirmActionModal
				isOpen={!!selectedUser}
				onClose={() => setSelectedUser(null)}
				title={
					modalType === 'admin'
						? 'Make this user an admin?'
						: modalType === 'agent'
						? 'Make this user an agent?'
						: modalType === 'fraud'
						? 'Mark agent as fraud?'
						: 'Delete this user?'
				}
				description={`This action cannot be undone.`}
				actionLabel={
					modalType === 'admin'
						? 'Make Admin'
						: modalType === 'agent'
						? 'Make Agent'
						: modalType === 'fraud'
						? 'Mark as Fraud'
						: 'Delete'
				}
				variant={
					modalType === 'delete' || modalType === 'fraud'
						? 'destructive'
						: 'default'
				}
				loading={isAnyMutationLoading}
				onConfirm={() => {
					if (modalType === 'admin')
						roleMutation.mutate({ id: selectedUser._id, role: 'admin' });
					if (modalType === 'agent')
						roleMutation.mutate({ id: selectedUser._id, role: 'agent' });
					if (modalType === 'fraud')
						fraudMutation.mutate({
							id: selectedUser._id,
							uid: selectedUser.uid,
						});
					if (modalType === 'delete') deleteMutation.mutate(selectedUser._id);
					setSelectedUser(null);
					toast.success('User updated');
				}}
			/>
		</div>
	);
}
