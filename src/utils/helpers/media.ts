export const isDesktopDevice = (): boolean => {
	const canHover: boolean = window.matchMedia("(hover: hover)").matches;
	const finePointer: boolean = window.matchMedia("(pointer: fine)").matches;
	return canHover && finePointer;
};
