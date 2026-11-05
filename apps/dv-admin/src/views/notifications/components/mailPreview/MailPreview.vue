<script setup lang="ts">
	import { computed, ref } from "vue";

	const { html } = defineProps<{ html: string }>();

	const frameRef = ref<HTMLIFrameElement | null>(null);

	// Never add `allow-scripts`: together with `allow-same-origin` it removes the sandbox entirely
	const SANDBOX = "allow-same-origin allow-popups allow-popups-to-escape-sandbox";

	const srcdoc = computed<string>(() => `<base target="_blank">${html}`);

	const syncHeight = () => {
		const doc = frameRef.value?.contentDocument;
		if (!frameRef.value || !doc?.body) return;
		frameRef.value.style.height = `${Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight)}px`;
	};
</script>

<template>
	<iframe
		ref="frameRef"
		class="mail-preview"
		:title="$t('Mail preview')"
		:sandbox="SANDBOX"
		:srcdoc="srcdoc"
		@load="syncHeight"
	/>
</template>

<style scoped lang="scss">
	.mail-preview {
		display: block;
		width: 100%;
		border: none;
	}
</style>
