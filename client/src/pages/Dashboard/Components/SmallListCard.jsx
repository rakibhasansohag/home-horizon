import React from 'react';
import { Link } from 'react-router';

export default function SmallListCard({ items = [], type = 'generic' }) {
	if (!items || items.length === 0) {
		return <div className='text-muted-foreground'>No items yet.</div>;
	}

	return (
		<div className='space-y-2'>
			{items.map((it) => {
				if (type === 'users') {
					return (
						<div key={it._id || it.uid} className='flex items-center gap-3'>
							<img
								src={it.profilePic || it.photoURL || '/default-avatar.png'}
								alt={it.name}
								className='w-8 h-8 rounded-full object-cover bg-accent'
							/>
							<div>
								<div className='font-medium'>{it.name || it.email}</div>
								<div className='text-xs text-muted-foreground'>{it.email}</div>
							</div>
						</div>
					);
				}
				if (type === 'agents') {
					return (
						<div key={it.id || it._id} className='flex items-center gap-3'>
							<img
								src={it.avatar || '/default-avatar.png'}
								alt={it.name}
								className='w-8 h-8 rounded-full object-cover bg-accent'
							/>
							<div>
								<div className='font-medium'>{it.name}</div>
								<div className='text-xs text-muted-foreground'>
									{(it.total || 0).toLocaleString()} earned
								</div>
							</div>
						</div>
					);
				}
				// TODO : will added in table system
				if (type === 'transactions') {
					return (
						<div
							key={it._id || it.transactionId}
							className='flex items-center justify-between'
						>
							<div>
								<Link
									to={`/all-properties/${it.propertyId}`}
									className='font-medium'
								>
									{it.propertyTitle || it.propertyId || '—'}
								</Link>
								<div className='text-xs text-muted-foreground'>
									{it.buyerName || it.buyerId}
								</div>
							</div>
							<div className='font-semibold'>
								${(it.amount || 0).toLocaleString()}
							</div>
						</div>
					);
				}
				if (type === 'pendingAgents') {
					return (
						<div
							key={it._id || it.uid}
							className='flex items-center justify-between'
						>
							<div>{it.name || it.email}</div>
							<Link
								// to={`/dashboard/manage-users/${it._id}`}
								to={`/dashboard/manage-users`}
								className='text-primary'
							>
								Review
							</Link>
						</div>
					);
				}
				// fallback
				return (
					<div key={it._id || JSON.stringify(it)}>
						{JSON.stringify(it).slice(0, 80)}
					</div>
				);
			})}
		</div>
	);
}
