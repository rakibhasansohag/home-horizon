/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			borderRadius: {
				sm: 'calc(var(--radius) - 4px)',
				md: 'calc(var(--radius) - 2px)',
				lg: 'var(--radius)',
				xl: 'calc(var(--radius) + 4px)',
			},
			colors: {
				background: 'oklch(var(--background))',
				foreground: 'oklch(var(--foreground))',
				primary: 'oklch(var(--primary))',
				secondary: 'oklch(var(--secondary))',
				accent: 'oklch(var(--accent))',
				muted: 'oklch(var(--muted))',
				border: 'oklch(var(--border))',
				card: 'oklch(var(--card))',
				ring: 'oklch(var(--ring))',
				input: 'oklch(var(--input))',
			},
		},
	},
	// eslint-disable-next-line no-undef
	plugins: [require('tailwindcss-animate')],
};
