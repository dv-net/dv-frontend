import { onUnmounted, ref } from "vue";

// If error occurs, it turns off
// The next polling request doesn't start until the previous one completes
// autoStopOnUnmounted - pass if you don't need to stop polling after component unmount
export const usePolling = (autoStopOnUnmounted: boolean = true) => {
	const isActivePolling = ref<boolean>(false);
	let timeout: ReturnType<typeof setTimeout> | null = null;

	const startPolling = async (callback: () => Promise<void>, interval: number = 3000) => {
		isActivePolling.value = true;

		const execute = async () => {
			try {
				if (!isActivePolling.value) return;
				await callback();
			} catch (error: any) {
				console.error("Polling error:", error);
				stopPolling();
			} finally {
				if (isActivePolling.value) {
					timeout = setTimeout(execute, interval);
				}
			}
		};

		await execute();
	};

	const stopPolling = () => {
		isActivePolling.value = false;
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
	};

	if (autoStopOnUnmounted) {
		onUnmounted(() => {
			stopPolling();
		});
	}

	return {
		isActivePolling,
		startPolling,
		stopPolling
	};
};
