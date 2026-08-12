import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";

export const useTimer = (startDateIso?: string) => {
	const { t } = useI18n();
	const counter = ref<number>(0);
	let intervalId: ReturnType<typeof setInterval> | null = null;

	const formattedTime = computed<string>(() => {
		const minutes = Math.floor(counter.value / 60);
		const seconds = counter.value % 60;
		const secondsStr = seconds < 10 ? `0${seconds}` : seconds;
		return minutes > 0
			? `${minutes} ${t("staticStrings.min")} ${secondsStr} ${t("staticStrings.s")}`
			: `${secondsStr} ${t("staticStrings.s")}`;
	});

	onMounted(() => {
		if (startDateIso) {
			const startTime = new Date(startDateIso).getTime();
			if (!isNaN(startTime)) {
				counter.value = Math.floor((Date.now() - startTime) / 1000);
			}
		}
		intervalId = setInterval(() => {
			counter.value++;
		}, 1000);
	});

	onUnmounted(() => {
		if (intervalId) clearInterval(intervalId);
	});

	return {
		counter,
		formattedTime
	};
};
