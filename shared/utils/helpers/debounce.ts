export const debounce = (callback: any, delay: number) => {
	let timeoutId: any;
	return (...args: any) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			timeoutId = null;
			callback(...args);
		}, delay);
	};
};
