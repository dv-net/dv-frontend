<script setup lang="ts">
	import IconDollarEth from "@dv-admin/components/icons/dashboard/IconDollarEth.vue";
	import { getDeclensionTransfers } from "@dv-admin/utils/helpers/declensions.ts";

	const { countMaxTransfers } = defineProps<{ countMaxTransfers: string }>();
</script>

<template>
	<div class="payments-count">
		<icon-dollar-eth class="payments-count__icon" />
		<span class="payments-count__text">
			{{ $t("Enough for") }} {{ countMaxTransfers }}
			{{ $t(getDeclensionTransfers(Number(countMaxTransfers))) }}
		</span>
	</div>
</template>

<style scoped lang="scss">
	.payments-count {
		display: flex;
		align-items: center;
		gap: 8px;
		color: $black;
		font-size: 14px;
		font-weight: 500;
		padding-left: 12px;
		line-height: 20px;
		&__icon {
			flex-shrink: 0;
		}
		&__text {
			word-break: break-word;
		}
	}
</style>