import { defineStore } from "pinia";
import { ref } from "vue";
import { USER } from "@dv-admin/utils/constants/user";

export const useLayoutStore = defineStore("layout", () => {
	const getInitialMenuState = (): boolean => {
		const stored = localStorage.getItem(USER.IS_SHOW_MAIN_SIDEBAR);
		if (stored === null) return false;
		try {
			return JSON.parse(stored);
		} catch {
			return false;
		}
	};

	const isMenuCollapse = ref<boolean>(getInitialMenuState());
	const isShowModalLanguage = ref<boolean>(false);

	const toggleMenu = () => {
		isMenuCollapse.value = !isMenuCollapse.value;
		localStorage.setItem(USER.IS_SHOW_MAIN_SIDEBAR, JSON.stringify(isMenuCollapse.value))
	};

	return {
		isMenuCollapse,
		isShowModalLanguage,
		toggleMenu,
	};
});