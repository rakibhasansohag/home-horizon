import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ConfirmPaymentModal({
	open,
	onConfirm,
	onCancel,
	propertyTitle,
	offerAmount,
}) {
	return (
		<Dialog open={open} onOpenChange={onCancel}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Confirm Payment</DialogTitle>
				</DialogHeader>
				<div className='space-y-2'>
					<p>Are you sure you want to proceed with payment for:</p>
					<p className='font-bold'>{propertyTitle}</p>
					<p>
						Offer Amount:{' '}
						<span className='text-primary font-semibold'>৳{offerAmount}</span>
					</p>
				</div>
				<DialogFooter className='mt-4'>
					<Button variant='outline' onClick={onCancel}>
						Cancel
					</Button>
					<Button onClick={onConfirm}>Confirm & Pay</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
