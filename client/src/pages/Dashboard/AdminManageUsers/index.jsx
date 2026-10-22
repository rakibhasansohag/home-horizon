import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import ConfirmActionModal from '@/components/Shared/ConfirmActionModal';
import PersonAvatar from '@/components/Shared/PersonAvatar';
import { gateQuery } from '@/lib/queryWait';
import { cn } from '@/lib/utils';
import { listParams, viewList } from '@/lib/pageList';
import {
	FilterSection,
	Pager,
	ResultSummary,
	useListControls,
} from '@/pages/Dashboard/Components/DashboardFilter';

const ROLE_LABEL = {
	all: 'All people',
	user: 'Users',
	agent: 'Agents',
	admin: 'Admins',
	fraud: 'Fraud',
};

const ROLE_TONE = {
	admin: 'text-brand',
	agent: 'text-foreground',
	fraud: 'text-destructive',
	user: 'text-muted-foreground',
};

export default function AdminManageUsers() {
	const axios = useAxiosSecure();
	const { filter, choose, page, setPage } = useListControls('all');

	const [selectedUser, setSelectedUser] = useState(null);
	const [modalType, setModalType] = useState(null); // 'admin' | 'agent' | 'fraud' | 'delete'

	const usersQuery = useQuery({
		queryKey: ['admin-users', page, filter],
		queryFn: () =>
			axios
				.get('/admin/users', { params: listParams({ page, filter }) })
				.then((r) => r.data),
		placeholderData: keepPreviousData,
	});
	const { refetch } = usersQuery;
	const view = viewList(usersQuery.data, page, (items) =>
		filter === 'all' ? items : items.filter((person) => person.role === filter),
	);
	const rows = view?.items || [];
	const gate = gateQuery(usersQuery);

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

	const openAction = (person, type) => {
		setSelectedUser(person);
		setModalType(type);
	};

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
			{gate === 'error' ? (
				<div className='space-y-3'>
					<p className='text-destructive'>Could not load people.</p>
					<Button type='button' variant='outline' onClick={() => refetch()}>
						Try again
					</Button>
				</div>
			) : gate === 'loading' ? (
				<PeopleSkeleton />
			) : (
				<>
					<ResultSummary label={ROLE_LABEL[filter]} value={view?.total || 0} />
					{!view?.total ? (
						<p className='text-base text-muted-foreground'>
							No people in this role.
						</p>
					) : (
						<div className='space-y-6'>
							<ul className='overflow-hidden rounded-lg border border-border bg-surface'>
								{rows.map((person) => (
									<li
										key={person._id}
										className='flex flex-col gap-3 border-b border-border p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between'
									>
										<div className='flex min-w-0 items-center gap-3'>
											<PersonAvatar
												name={person.name}
												src={person.profilePic || person.photoURL}
											/>
											<div className='min-w-0'>
												<p className='truncate font-medium'>{person.name}</p>
												<p className='truncate text-sm text-muted-foreground'>
													{person.email}
												</p>
											</div>
										</div>
										<div className='flex flex-wrap items-center gap-2 sm:justify-end'>
											<p
												className={cn(
													'px-1 text-sm capitalize',
													ROLE_TONE[person.role] || 'text-muted-foreground',
												)}
											>
												{person.role}
											</p>
											<PersonActions person={person} onAction={openAction} />
										</div>
									</li>
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
			<ConfirmActionModal
				isOpen={!!selectedUser}
				onClose={() => setSelectedUser(null)}
				title={
					modalType === 'admin'
						? 'Make this user an admin?'
						: modalType === 'agent'
							? selectedUser?.role === 'fraud'
								? 'Restore this account as an agent?'
								: 'Make this user an agent?'
							: modalType === 'fraud'
								? 'Mark agent as fraud?'
								: 'Delete this user?'
				}
				description={
					selectedUser
						? selectedUser.role === 'fraud' && modalType === 'agent'
							? `${selectedUser.name}, ${selectedUser.email}. Listings removed when the account was flagged do not come back.`
							: `${selectedUser.name}, ${selectedUser.email}`
						: 'This action cannot be undone.'
				}
				actionLabel={
					modalType === 'admin'
						? 'Make admin'
						: modalType === 'agent'
							? selectedUser?.role === 'fraud'
								? 'Restore as agent'
								: 'Make agent'
							: modalType === 'fraud'
								? 'Mark as fraud'
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

function PersonActions({ person, onAction }) {
	return (
		<div className='flex flex-wrap gap-2'>
			{person.role === 'user' && (
				<>
					<Button
						size='sm'
						variant='accent'
						onClick={() => onAction(person, 'agent')}
					>
						Make agent
					</Button>
					<Button
						size='sm'
						variant='outline'
						onClick={() => onAction(person, 'admin')}
					>
						Make admin
					</Button>
				</>
			)}
			{person.role === 'agent' && (
				<Button
					size='sm'
					variant='outline'
					className='text-destructive'
					onClick={() => onAction(person, 'fraud')}
				>
					Mark as fraud
				</Button>
			)}
			{person.role === 'fraud' && (
				<Button
					size='sm'
					variant='accent'
					onClick={() => onAction(person, 'agent')}
				>
					Restore as agent
				</Button>
			)}
			<Button
				size='sm'
				variant='ghost'
				className='text-destructive'
				onClick={() => onAction(person, 'delete')}
			>
				Delete
			</Button>
		</div>
	);
}

function PeopleSkeleton() {
	return (
		<div
			className='overflow-hidden rounded-lg border border-border bg-surface'
			aria-busy='true'
		>
			<span className='sr-only'>Loading people</span>
			{Array.from({ length: 6 }, (_, index) => (
				<div
					key={index}
					className='flex items-center gap-3 border-b border-border p-4 last:border-b-0'
				>
					<Skeleton className='size-12 rounded-full' />
					<div className='space-y-2'>
						<Skeleton className='h-4 w-36' />
						<Skeleton className='h-3 w-52' />
					</div>
				</div>
			))}
		</div>
	);
}
