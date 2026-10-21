export default function SkeletonImage({ className = '' }) {
	return (
		<div
			className={`w-20 h-20 bg-line dark:bg-muted animate-pulse rounded border ${className}`}
		/>
	);
}
