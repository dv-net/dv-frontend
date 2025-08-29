import { defineStore } from "pinia";
import { ref } from "vue";

export const useLayoutStore = defineStore("layout", () => {
	const isMenuCollapse = ref<boolean>(false);
	const isShowModalLanguage = ref<boolean>(false);

	const toggleMenu = () => {
		isMenuCollapse.value = !isMenuCollapse.value;
	};

	return {
		isMenuCollapse,
		isShowModalLanguage,
		toggleMenu
	};
});
