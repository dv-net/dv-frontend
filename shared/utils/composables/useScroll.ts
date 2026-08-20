import { onBeforeRouteLeave } from "vue-router";

export const useScroll = (namePage: string) => {
	const moveToSavedPositionScroll = () => {
		const saved = sessionStorage.getItem(`${namePage}-scroll-position`);
		const toPage = sessionStorage.getItem(`${namePage}-to-page`);
		const fromRoute = sessionStorage.getItem("fromRoute");

		if (saved && fromRoute === toPage) {
			const { top, left } = JSON.parse(saved);
			window.scrollTo({ top, left });
		}
	};

	onBeforeRouteLeave((to) => {
		const scroll = { top: window.scrollY, left: window.scrollX };
		sessionStorage.setItem(`${namePage}-scroll-position`, JSON.stringify(scroll));
		sessionStorage.setItem(`${namePage}-to-page`, to.fullPath);
	});

	return {
		moveToSavedPositionScroll
	};
};
