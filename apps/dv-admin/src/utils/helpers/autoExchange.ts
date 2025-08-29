export const hasExchangeCycle = (pairs: string[]): boolean => {
	const graph: any = {};
	pairs.forEach((pair) => {
		const [from, to] = pair.split("/");
		if (!graph[from]) graph[from] = [];
		if (!graph[to]) graph[to] = [];
		graph[from].push(to);
		graph[to].push(from);
	});
	const visited: Set<any> = new Set();
	function dfs(node: any, parent: any) {
		if (visited.has(node)) return true;
		visited.add(node);
		for (const neighbor of graph[node]) {
			if (neighbor !== parent) {
				if (dfs(neighbor, node)) return true;
			}
		}
		return false;
	}
	for (const node in graph) {
		if (!visited.has(node)) {
			if (dfs(node, null)) return true;
		}
	}
	return false;
};
