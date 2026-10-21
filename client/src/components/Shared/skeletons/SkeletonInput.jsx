export default function SkeletonInput({
	width = '100%',
	height = '2.5rem',
	className = '',
}) {
	return (
		<div
			className={`animate-pulse bg-line dark:bg-muted rounded ${className}`}
			style={{ width, height }}
		/>
	);
}
