const SAFE_URL_PROTOCOLS = ["http:", "https:"];

/** Returns a normalized absolute http(s) URL; anything else (`javascript:`, `data:`, relative, invalid) → null */
export const getSafeUrl = (value?: string | null): string | null => {
	if (!value) return null;
	try {
		const url = new URL(value);
		return SAFE_URL_PROTOCOLS.includes(url.protocol) ? url.href : null;
	} catch {
		return null;
	}
};

/** Opens an http(s) URL in a new tab without giving it `window.opener`; unsafe URLs are ignored */
export const openExternal = (value?: string | null, { keepReferrer = false }: { keepReferrer?: boolean } = {}): void => {
	const url = getSafeUrl(value);
	if (!url) return;
	window.open(url, "_blank", keepReferrer ? "noopener" : "noopener,noreferrer");
};
