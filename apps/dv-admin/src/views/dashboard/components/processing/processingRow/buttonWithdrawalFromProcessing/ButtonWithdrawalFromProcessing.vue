<script setup lang="ts">
	import { UiIcon, UiTooltip } from "@dv.net/ui-kit";
	import IconWithdrawalFromProcessing from "@dv-admin/components/icons/dashboard/IconWithdrawalFromProcessing.vue";

	const { currencyId } = defineProps<{ currencyId: string }>();
	const emits = defineEmits(['close']);

	const isShowWithdrawalFromProcessing = defineModel<Record<string, boolean>>({ default: {}, required: true });

	const handleClose = () => {
		isShowWithdrawalFromProcessing.value[currencyId] = false;
		emits("close");
	};
</script>

<template>
	<div class="button-withdrawal-from-processing">
		<transition name="fade-scale" mode="out-in">
			<ui-icon
				v-if="isShowWithdrawalFromProcessing[currencyId]"
				key="close"
				type="400"
				name="close"
				size="lg"
				color="#444444"
				class="button-withdrawal-from-processing__close"
				@click="handleClose"
			/>
			<ui-tooltip
				v-else
				key="withdrawal"
				:title="`${$t('Withdrawal from processing')} ${$t('wallets.many3')}`"
				:text="$t('You can withdraw funds from the current processing ring')"
			>
				<icon-withdrawal-from-processing
					class="pointer flex-shrink-0"
					@click="isShowWithdrawalFromProcessing[currencyId] = true"
				/>
			</ui-tooltip>
		</transition>
	</div>
</template>

<style scoped lang="scss">
	.button-withdrawal-from-processing {
		display: flex;
		justify-content: flex-end;
		flex-grow: 1;
		&__close {
			transition: transform 0.3s ease-in-out;
			@media (hover: hover) {
				&:hover {
					cursor: pointer;
					transform: scale(1.01);
				}
			}
		}
		.fade-scale-enter-active {
			transition: all 0.2s ease-out;
		}
		.fade-scale-leave-active {
			transition: all 0.2s ease-in;
		}
		.fade-scale-enter-from {
			opacity: 0;
			transform: scale(0.8);
		}
		.fade-scale-leave-to {
			opacity: 0;
			transform: scale(0.8);
		}
	}
</style>