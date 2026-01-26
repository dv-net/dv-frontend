<script setup lang="ts">
	import { UiTooltip } from "@dv.net/ui-kit";
	import IconDanger from "@dv-admin/components/icons/dashboard/IconDanger.vue";

	const { countMaxTransfers } = defineProps<{ countMaxTransfers: string }>();
</script>

<template>
	<div class="warning">
		<ui-tooltip
			mode="dark"
			position="top-start"
			is-gold-title
			:title="$t('We recommend to top up')"
			:text="$t('payments_dashboard', { count: countMaxTransfers })"
		>
			<icon-danger />
		</ui-tooltip>
		<span class="warning__text">{{ $t("We recommend to top up") }}</span>
	</div>
</template>

<style scoped lang="scss">
	.warning {
		display: flex;
		align-items: center;
		gap: 8px;
		color: $secondary;
		font-size: 14px;
		font-weight: 500;
		padding-left: 12px;
		line-height: 20px;
		&__text {
			word-break: break-word;
		}
	}
</style>