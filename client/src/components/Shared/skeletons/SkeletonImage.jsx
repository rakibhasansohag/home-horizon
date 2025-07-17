export default function SkeletonImage({ className = '' }) {
	return (
		<div
			className={`w-20 h-20 bg-gray-300 dark:bg-gray-700 animate-pulse rounded border ${className}`}
		/>
	);
}
