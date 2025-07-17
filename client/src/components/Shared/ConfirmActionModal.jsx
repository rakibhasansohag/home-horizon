import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ConfirmActionModal({
	isOpen,
	onClose,
	title = 'Are you sure?',
	description,
	actionLabel = 'Confirm',
	cancelLabel = 'Cancel',
	loading = false,
	onConfirm,
	variant = 'default',
}) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<p>{description}</p>
				<DialogFooter className='mt-4'>
					<Button variant='outline' onClick={onClose} disabled={loading}>
						{cancelLabel}
					</Button>
					<Button variant={variant} onClick={onConfirm} disabled={loading}>
						{loading ? `${actionLabel}...` : actionLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
