export default function SkeletonInput({
	width = '100%',
	height = '2.5rem',
	className = '',
}) {
	return (
		<div
			className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded ${className}`}
			style={{ width, height }}
		/>
	);
}
