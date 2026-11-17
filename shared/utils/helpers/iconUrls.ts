const iconModules = import.meta.glob("../../assets/images/blockchains/*.svg", {
	eager: true,
	query: "?url&no-inline",
	import: "default"
}) as Record<string, string>;

const urlByFileName = new Map<string, string>(
	Object.entries(iconModules).map(([path, url]) => [path.split("/").pop() ?? path, url])
);

export const getIconUrl = (fileName: string): string => {
	const url = urlByFileName.get(fileName);
	if (!url) {
		throw new Error(`Missing blockchain icon: ${fileName}`);
	}
	return url;
};
