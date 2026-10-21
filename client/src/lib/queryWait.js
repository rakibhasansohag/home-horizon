export function gateQuery(query) {
	if (query.data != null) return 'ready';
	if (query.isError && !query.isFetching) return 'error';
	return 'loading';
}
