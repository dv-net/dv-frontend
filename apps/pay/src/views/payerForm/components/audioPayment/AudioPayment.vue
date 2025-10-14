<script setup lang="ts">
	import moneyCameAudio from "@pay/assets/audio/moneyCame.mp3";
	import paymentFoundAudio from "@pay/assets/audio/paymentFound.mp3";
	import { storeToRefs } from "pinia";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { onMounted, onUnmounted } from "vue";

	const { moneyCameAudioRef, paymentFoundAudioRef } = storeToRefs(usePayerFormStore());

	const startAudio = () => {
		try {
			if (moneyCameAudioRef.value && paymentFoundAudioRef.value) {
				moneyCameAudioRef.value.currentTime = 0;
				paymentFoundAudioRef.value.currentTime = 0;
				window.removeEventListener('click', startAudio);
			}
			clearEventAudio()
		} catch (error: any) {
			console.error(error)
		}
	}

	const clearEventAudio = () => {
		window.removeEventListener('click', startAudio);
	}

	onMounted(() => {
		startAudio()
	})

	onUnmounted(() => {
		clearEventAudio()
	})
</script>

<template>
	<audio ref="moneyCameAudioRef" :src="moneyCameAudio" preload="auto" />
	<audio ref="paymentFoundAudioRef" :src="paymentFoundAudio" preload="auto" />
</template>