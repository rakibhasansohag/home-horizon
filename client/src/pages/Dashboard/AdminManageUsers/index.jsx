import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function AdminManageUsers() {
	const axios = useAxiosSecure();
	const [searchParams, setSearchParams] = useSearchParams();
	const { filter, choose, page, setPage, q, query, search } =
		useListControls('all');

	const [selectedUser, setSelectedUser] = useState(null);
	const [modalType, setModalType] = useState(null); // 'admin' | 'agent' | 'fraud' | 'delete'

	// Initialize search from URL `?q=` param if provided
	useEffect(() => {
		const urlQ = searchParams.get('q');
		if (urlQ && urlQ !== q) {
			search(urlQ);
		}
	}, []);

	const handleSearchChange = (value) => {
		search(value);
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				if (value.trim()) {
					next.set('q', value.trim());
				} else {
					next.delete('q');
				}
				return next;
			},
			{ replace: true },
		);
	};

	const usersQuery = useQuery({
		queryKey: ['admin-users', page, filter, query],
		queryFn: () =>
			axios
				.get('/admin/users', {
					params: listParams({ page, filter, query }),
				})
				.then((r) => r.data),
		placeholderData: keepPreviousData,
	});
	const { refetch } = usersQuery;

	const view = viewList(usersQuery.data, page, (items) => {
		let list =
			filter === 'all'
				? items
				: items.filter((person) => person.role === filter);
		if (query) {
			const term = query.toLowerCase();
			list = list.filter((person) =>
				`${person.name || ''} ${person.email || ''}`
					.toLowerCase()
					.includes(term),
			);
		}
		return list;
	});
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
			<div className='relative'>
				<Search className='absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none' />
				<Input
					value={q}
					aria-label='Find user by name or email'
					placeholder='Search people by name or email...'
					className='pl-9'
					onChange={(event) => handleSearchChange(event.target.value)}
				/>
			</div>

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
						<div className='rounded-lg border border-dashed border-line p-8 text-center'>
							<p className='text-base text-muted-foreground'>
								{query
									? `No people found matching "${query}".`
									: 'No people in this role.'}
							</p>
							{query ? (
								<Button
									variant='ghost'
									size='sm'
									className='mt-2'
									onClick={() => handleSearchChange('')}
								>
									Clear search
								</Button>
							) : null}
						</div>
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
											<span
												className={cn(
													'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
													person.role === 'admin' &&
														'bg-brand-soft text-brand ring-1 ring-brand/20',
													person.role === 'agent' &&
														'bg-muted text-foreground ring-1 ring-border',
													person.role === 'fraud' &&
														'bg-destructive/10 text-destructive ring-1 ring-destructive/20',
													person.role === 'user' &&
														'bg-surface text-muted-foreground ring-1 ring-border',
												)}
											>
												{person.role}
											</span>
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
