export const SITE = {
	name: 'HomeHorizon',
	url: (
		import.meta.env.VITE_SITE_URL || 'https://homehorizon-by-rakib.netlify.app'
	).replace(/\/+$/, ''),
	title: 'HomeHorizon | Verified Homes for Sale in Dhaka',
	description:
		'Find verified homes for sale in Dhaka. Search listings on a map, compare prices, read buyer reviews, and make offers to trusted agents on HomeHorizon.',
	image: '/og-image.jpg',
	imageAlt: 'Row of family houses on a quiet street',
	locale: 'en_US',
};

const dashboardTitles = [
	['/dashboard/profile/edit', 'Edit profile'],
	['/dashboard/profile', 'My Profile'],
	['/dashboard/wishlist', 'Wishlist'],
	['/dashboard/offer', 'Make an offer'],
	['/dashboard/property-bought', 'Property bought'],
	['/dashboard/my-reviews', 'My reviews'],
	['/dashboard/add-property', 'Add Property'],
	['/dashboard/my-property', 'My Added Properties'],
	['/dashboard/agent-offer-properties', 'Requested Properties'],
	['/dashboard/sold-properties', 'My Sold Properties'],
	['/dashboard/manage-properties', 'Manage Properties'],
	['/dashboard/manage-users', 'Manage Users'],
	['/dashboard/manage-reviews', 'Manage Reviews'],
	['/dashboard/advertise-property', 'Advertise Property'],
	['/dashboard/payments', 'Payments'],
	['/dashboard/payment-success', 'Payment'],
	['/dashboard', 'Dashboard'],
];

export function dashboardTitle(pathname) {
	const match = dashboardTitles.find(([path]) =>
		path === '/dashboard' ? pathname === path : pathname.startsWith(path),
	);
	return match ? match[1] : 'Dashboard';
}

const publicPages = {
	'/': {
		title: null,
		description: SITE.description,
	},
	'/all-properties': {
		title: 'Homes for Sale in Dhaka',
		description:
			'Browse every verified property for sale on HomeHorizon. Search by location, sort by price, and explore homes on an interactive map of Dhaka.',
	},
	'/about-us': {
		title: 'About Us',
		description:
			'Learn about HomeHorizon, a real estate platform that connects home buyers in Dhaka with verified listings, trusted agents, and honest reviews.',
	},
	'/contact': {
		title: 'Contact Us',
		description:
			'Get in touch with the HomeHorizon team by email, phone, or WhatsApp for help with buying, selling, or listing a home.',
	},
	'/legal/terms-of-service': {
		title: 'Terms of Service',
		description: 'The terms that apply when you use HomeHorizon to browse, list, or buy homes.',
	},
	'/legal/privacy-policy': {
		title: 'Privacy Policy',
		description: 'How HomeHorizon collects, uses, and protects your personal information.',
	},
	'/legal/cookie-policy': {
		title: 'Cookie Policy',
		description: 'How HomeHorizon uses cookies and similar technologies.',
	},
};

export function routeSeo(pathname) {
	const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

	if (publicPages[path]) return { ...publicPages[path] };

	if (/^\/all-properties\/[^/]+$/.test(path)) {
		return {
			title: 'Property Details',
			description:
				'Photos, price, amenities, location, and buyer reviews for a verified home for sale on HomeHorizon.',
		};
	}
	if (path === '/auth/login') {
		return {
			title: 'Sign In',
			description: 'Sign in to HomeHorizon to save homes, make offers, and manage your listings.',
			noindex: true,
		};
	}
	if (path === '/auth/register') {
		return {
			title: 'Create an Account',
			description:
				'Create a free HomeHorizon account to save homes, make offers, and list properties.',
			noindex: true,
		};
	}
	if (path.startsWith('/dashboard')) {
		return { title: dashboardTitle(path), noindex: true };
	}
	if (path === '/forbidden' || path === '/unauthorized') {
		return { title: 'Access Forbidden', noindex: true };
	}
	return { title: 'Page Not Found', noindex: true };
}

export function absoluteUrl(value) {
	if (!value) return '';
	if (/^https?:\/\//i.test(value)) return value;
	return `${SITE.url}${value.startsWith('/') ? '' : '/'}${value}`;
}

export function clip(text, max = 160) {
	const clean = String(text ?? '')
		.replace(/\s+/g, ' ')
		.trim();
	if (clean.length <= max) return clean;
	const cut = clean.slice(0, max - 1);
	const lastSpace = cut.lastIndexOf(' ');
	return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : cut.length)}…`;
}

function setMeta(attr, key, content) {
	let el = document.head.querySelector(`meta[${attr}="${key}"]`);
	if (!content) {
		el?.remove();
		return;
	}
	if (!el) {
		el = document.createElement('meta');
		el.setAttribute(attr, key);
		document.head.appendChild(el);
	}
	el.setAttribute('content', content);
}

function setCanonical(href) {
	let el = document.head.querySelector('link[rel="canonical"]');
	if (!href) {
		el?.remove();
		return;
	}
	if (!el) {
		el = document.createElement('link');
		el.setAttribute('rel', 'canonical');
		document.head.appendChild(el);
	}
	el.setAttribute('href', href);
}

function setJsonLd(data) {
	let el = document.getElementById('page-jsonld');
	if (!data) {
		el?.remove();
		return;
	}
	if (!el) {
		el = document.createElement('script');
		el.type = 'application/ld+json';
		el.id = 'page-jsonld';
		document.head.appendChild(el);
	}
	el.textContent = JSON.stringify(data);
}

export function applySeo(meta = {}) {
	const title = meta.title ? `${meta.title} | ${SITE.name}` : SITE.title;
	const description = clip(meta.description || SITE.description);
	const url = meta.noindex ? '' : absoluteUrl(meta.path || window.location.pathname);
	const image = absoluteUrl(meta.image || SITE.image);
	const imageAlt = meta.image ? meta.imageAlt || meta.title : SITE.imageAlt;

	document.title = title;
	setMeta('name', 'description', description);
	setMeta('name', 'robots', meta.noindex ? 'noindex, nofollow' : 'index, follow');
	setCanonical(url);

	setMeta('property', 'og:site_name', SITE.name);
	setMeta('property', 'og:locale', SITE.locale);
	setMeta('property', 'og:type', meta.type || 'website');
	setMeta('property', 'og:title', title);
	setMeta('property', 'og:description', description);
	setMeta('property', 'og:url', url);
	setMeta('property', 'og:image', image);
	setMeta('property', 'og:image:width', meta.image ? '' : '1200');
	setMeta('property', 'og:image:height', meta.image ? '' : '630');
	setMeta('property', 'og:image:alt', imageAlt);

	setMeta('name', 'twitter:card', 'summary_large_image');
	setMeta('name', 'twitter:title', title);
	setMeta('name', 'twitter:description', description);
	setMeta('name', 'twitter:image', image);
	setMeta('name', 'twitter:image:alt', imageAlt);

	setJsonLd(meta.jsonLd);
}
