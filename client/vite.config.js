import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

// Surge serves 200.html for unknown paths, so it must match the built index.html.
function spaFallback() {
	let outDir;
	return {
		name: 'spa-fallback',
		apply: 'build',
		configResolved(config) {
			outDir = path.resolve(config.root, config.build.outDir);
		},
		closeBundle() {
			fs.copyFileSync(path.join(outDir, 'index.html'), path.join(outDir, '200.html'));
		},
	};
}

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss(), spaFallback()],
	resolve: {
		alias: {
			// eslint-disable-next-line no-undef
			'@': path.resolve(__dirname, 'src'),
		},
	},
});
