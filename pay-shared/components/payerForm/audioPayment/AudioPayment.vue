<script setup lang="ts">
	import moneyCameAudio from "@pay-shared/assets/audio/moneyCame.mp3";
	import paymentFoundAudio from "@pay-shared/assets/audio/paymentFound.mp3";
	import { onMounted, onUnmounted } from "vue";

	const moneyCameAudioRef = defineModel<HTMLAudioElement | null>("moneyCameAudioRef", { required: true });
	const paymentFoundAudioRef = defineModel<HTMLAudioElement | null>("paymentFoundAudioRef", { required: true });

	const startAudio = () => {
		try {
			if (moneyCameAudioRef.value && paymentFoundAudioRef.value) {
				moneyCameAudioRef.value.currentTime = 0;
				paymentFoundAudioRef.value.currentTime = 0;
				window.removeEventListener("click", startAudio);
			}
			clearEventAudio();
		} catch (error: any) {
			console.error(error);
		}
	};

	const clearEventAudio = () => {
		window.removeEventListener("click", startAudio);
	};

	onMounted(() => {
		startAudio();
	});

	onUnmounted(() => {
		clearEventAudio();
	});
</script>

<template>
	<audio ref="moneyCameAudioRef" :src="moneyCameAudio" preload="auto" />
	<audio ref="paymentFoundAudioRef" :src="paymentFoundAudio" preload="auto" />
</template>
