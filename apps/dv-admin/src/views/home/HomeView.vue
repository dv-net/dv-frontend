<script setup lang="ts">
	import { UiButton } from "@dv.net/ui-kit/dist";
	import { useRouter } from "vue-router";

	const router = useRouter();
</script>

<template>
	<div class="page">
		<ui-button mode="neutral" @click="router.push({ name: 'sign-in' })">
			{{ $t("Login to account") }}
		</ui-button>
		<ui-button type="tertiary" @click="router.push({ name: 'sign-up' })">
			{{ $t("Sing up") }}
		</ui-button>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		align-items: center;
		gap: 8px;
	}
</style>
