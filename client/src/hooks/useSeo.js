import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router';
import { applySeo, routeSeo } from '@/lib/seo';

// Layout effects run before passive effects in the same commit, so route
// defaults set here are always overridden by a page's useSeo call.
export function useRouteSeo() {
	const { pathname } = useLocation();

	useLayoutEffect(() => {
		applySeo(routeSeo(pathname));
	}, [pathname]);
}

export default function useSeo(meta) {
	const { pathname } = useLocation();
	const key = JSON.stringify(meta ?? null);

	useEffect(() => {
		applySeo({ ...routeSeo(pathname), ...JSON.parse(key) });
	}, [pathname, key]);
}
