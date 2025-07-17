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

export default function AdminManageUsers() {
	const axios = useAxiosSecure();

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
						<TableRow className='bg-gray-100'>
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

	return (
		<div className='overflow-x-auto bg-background p-6 rounded-md shadow-md w-full'>
			<h2 className='text-2xl font-semibold mb-4'>Manage Users</h2>
			<Table className='!w-full !max-w-full'>
				<TableHeader>
					<TableRow className='bg-gray-100 hover:bg-slate-200'>
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map((user) => (
						<TableRow
							key={user._id}
							className='even:bg-gray-50 hover:bg-slate-200 transition'
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
