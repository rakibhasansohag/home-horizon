export const PAGE_SIZE = 6;

export function readList(data) {
	if (data == null) return null;
	if (Array.isArray(data)) {
		return {
			items: data,
			total: data.length,
			page: 1,
			pages: 1,
			amount: null,
			legacy: true,
		};
	}
	const items = Array.isArray(data.items) ? data.items : [];
	const total = Number(data.total ?? items.length);
	const limit = Number(data.limit) || PAGE_SIZE;
	const pages = Math.max(1, Number(data.pages) || Math.ceil(total / limit) || 1);
	return {
		items,
		total,
		page: Number(data.page) || 1,
		pages,
		limit,
		amount: data.amount ?? null,
		legacy: false,
	};
}

export function pageOf(items, page, limit = PAGE_SIZE) {
	const total = items.length;
	const pages = Math.max(1, Math.ceil(total / limit) || 1);
	const safe = Math.min(Math.max(page, 1), pages);
	const start = (safe - 1) * limit;
	return {
		items: items.slice(start, start + limit),
		total,
		page: safe,
		pages,
		limit,
		amount: null,
		legacy: true,
	};
}

export function listParams({ page, filter, query }) {
	const params = { page, limit: PAGE_SIZE };
	if (filter && filter !== 'all') params.filter = filter;
	if (query) params.q = query;
	return params;
}

export function viewList(data, page, narrow, sum) {
	const raw = readList(data);
	if (!raw) return null;
	if (!raw.legacy) return raw;
	const narrowed = typeof narrow === 'function' ? narrow(raw.items) : raw.items;
	const paged = pageOf(narrowed, page);
	if (typeof sum === 'function') paged.amount = sum(narrowed);
	return paged;
}
