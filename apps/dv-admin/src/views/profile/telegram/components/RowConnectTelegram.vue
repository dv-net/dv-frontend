<script setup lang="ts">
	import type { IProfileRowConnectTelegram } from "@dv-admin/utils/types/schemas";

	defineProps<{ item: IProfileRowConnectTelegram; code?: string | null }>();
</script>

<template>
	<div class="row">
		<span class="row__label"> {{ item.id }} {{ $t("Way") }} </span>
		<component class="row__icon" :is="item.icon" />
		<div class="row__content">
			<span class="row__title">{{ $t(item.title) }}</span>
			<span class="row__text">{{ $t(item.text) }} {{ code ? `«${code}»` : "" }}</span>
		</div>
		<div class="row__slot">
			<slot />
		</div>
	</div>
</template>

<style scoped lang="scss">
	.row {
		display: flex;
		align-items: center;
		gap: 20px;
		border-radius: 24px;
		padding: 24px 20px;
		background-color: $white;
		position: relative;
		&__label {
			position: absolute;
			left: 24px;
			top: -13px;
			@extend .center;
			padding: 4px 12px;
			border-radius: 40px;
			border: 1px solid $grey;
			background-color: $white;
			color: $blue;
			font-size: 12px;
			font-weight: 500;
			line-height: 16px;
		}
		&__icon {
			flex-shrink: 0;
		}
		&__content {
			display: flex;
			flex-direction: column;
			gap: 4px;
			max-width: 488px;
			width: 100%;
		}
		&__title {
			color: $black;
			font-size: 24px;
			font-weight: 600;
			line-height: 24px;
		}
		&__text {
			color: $secondary;
			font-size: 18px;
			font-weight: 400;
			line-height: 24px;
		}
		&__slot {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			flex-grow: 1;
		}
	}
</style>
