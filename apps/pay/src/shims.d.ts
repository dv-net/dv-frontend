declare module 'https://cdn.jsdelivr.net/npm/transliteration@2.3.5/dist/browser/bundle.esm.min.js' {
	export function transliterate(text: string, options?: any): string;
	export function slugify(text: string, options?: any): string;
}

declare global {
	interface Window {
		tronWeb: any;
		tronLink: any;
		ethereum: any;
		okxwallet: {
			tronLink?: {
				request?: (params: any) => Promise<any>;
				tronWeb?: any;
			};
		};
	}
}