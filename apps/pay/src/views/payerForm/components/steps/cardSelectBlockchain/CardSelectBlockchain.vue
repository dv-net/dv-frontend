<script setup lang="ts">
	import type { IProps } from "@pay/views/payerForm/components/steps/cardSelectBlockchain/types.ts";
	import { UiIcon, UiLink } from "@dv.net/ui-kit";
	import { computed } from "vue";
	import { storeToRefs } from "pinia";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { blockchainCurrencyId } from "@shared/utils/constants/blockchain";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import CurrencyIcon from "@pay/components/ui/currencyIcon/CurrencyIcon.vue";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import { getCurrentBlockchain } from "@shared/utils/helpers/general.ts";

	const { addresses, currentStep } = storeToRefs(usePayerFormStore());
	const { getAmountRate } = usePayerFormStore();

	const { type, currency, currencyId } = defineProps<IProps>();

	const isTypeCurrency = computed<boolean>(() => Boolean(type === 'currency' && currency))
	const isTypeBlockchain = computed<boolean>(() => Boolean(type === 'blockchain' && currencyId))

	const currentBlockchain = computed<{ code: string, label: string }>(() => {
		if (isTypeCurrency.value) {
			const find = addresses.value.find((item) => item.currency.code === currency);
			if (!find) return { code: "—", label: "" };
			return {
				code: currency as string,
				label: find.currency.currency_label ? `(${find.currency.currency_label})` : ''
			}
		} else if (isTypeBlockchain.value) {
			const find = addresses.value.find((item) => item.currency.id === currencyId);
			if (!find) return { code: "—", label: "" };
			return {
				code: getCurrentBlockchain(find.currency.id),
				label: find.currency.token_label ? `(${find.currency.token_label})` : ''
			}
		}
		return { code: "—", label: "" };
	});

	const goToBack = () => {
		if (isTypeCurrency.value) {
			currentStep.value = 1
		} else if (isTypeBlockchain.value) {
			currentStep.value = 2
		}
	}
</script>

<template>
	<div class="blockchain">
		<div class="blockchain__block">
			<ui-icon name="check-circle" type="filled" color="#1F9649" size="lg" />
			<div class="content">
				<span>{{ $t(isTypeCurrency ? "Selected currency" : 'Selected chain') }}</span>
				<ui-link @click="goToBack">{{ $t('Change') }}</ui-link>
			</div>
		</div>
		<div class="blockchain__block blockchain__block-center">
			<currency-icon
				v-if="isTypeCurrency"
				width="32px"
				height="32px"
				:type="currency!"
			/>
			<blockchain-icon
				v-else-if="isTypeBlockchain"
				width="32px"
				height="32px"
				:type="blockchainCurrencyId[getCurrentBlockchain(currencyId!)?.toLowerCase()]"
			/>
			<blockchain-icon v-else :type="'IconDefault' as BlockchainType" />
			<div class="content">
				<span>{{ currentBlockchain.code }} {{ currentBlockchain.label }}</span>
				<span v-if="isTypeCurrency">≈ {{ getAmountRate(currency!) }}</span>
				<span v-if="isTypeBlockchain">{{ $t('Commission') }} —</span>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.blockchain {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		border-radius: 8px;
		padding: 16px 20px;
		background-color: #F6F6F6;
		min-height: 76px;
		&__block {
			display: flex;
			gap: 8px;
			&-center {
				align-items: center;
			}
			.content {
				display: flex;
				flex-direction: column;
				gap: 4px;
				color: $main-subtitle-color;
				font-weight: 500;
			}
		}
	}
</style>
