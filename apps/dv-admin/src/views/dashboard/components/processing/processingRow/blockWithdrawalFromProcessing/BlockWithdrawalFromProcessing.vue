<script setup lang="ts">
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import { UiButton, UiForm, UiFormItem, UiInput } from "@dv.net/ui-kit";
	import { computed, nextTick, ref, watch } from "vue";
	import type {
		IProcessingWalletsResponse,
		IWithdrawalFromProcessingRequest
	} from "@dv-admin/utils/types/api/apiGo.ts";
	import {
		formatAmountBlockchain,
		formatDollars,
		generateUUID,
		getCurrentCoin
	} from "@shared/utils/helpers/general.ts";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import type { IProcessingWalletsAssets } from "@dv-admin/utils/types/api/apiGo.ts";
	import { useDashboardStore } from "@dv-admin/stores/dashboard";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { useI18n } from "vue-i18n";
	import { useNotifications } from "@shared/utils/composables/useNotifications.ts";

	const { t } = useI18n();
	const { notify } = useNotifications();
	const { postWithdrawalFromProcessing } = useDashboardStore();

	const { data } = defineProps<{ data: IProcessingWalletsResponse }>();

	const formRef = ref<HTMLFormElement | null>(null);
	const tokensRef = ref<HTMLElement | null>(null);
	const tokenRefs = ref<HTMLButtonElement[]>([]);
	const indicatorReady = ref(false);
	const indicatorStyle = ref<Record<string, string>>({ opacity: "0" });
	const selectedAsset = ref<IProcessingWalletsAssets | null>(null);
	const amountUsdWithdrawProcessing = ref<number | null>(null);
	const defaultFormValues = {
		address_to: "",
		amount: null,
		currency_id: "",
		totp: "",
		request_id: ""
	};
	const form = ref<IWithdrawalFromProcessingRequest>({ ...defaultFormValues });

	const isDisabledAllAmount = computed<boolean>(() => !Boolean(selectedAsset.value));
	const isDisabledBtnWithdraw = computed<boolean>(() => !Boolean(selectedAsset.value));
	const rulesForm = computed<UiFormRules>(() => {
		return {
			address_to: [{ required: true, message: t("Enter address") }],
			amount: [
				{ required: true, message: t("Enter the amount") },
				{
					validator: () => Boolean(Number(form.value.amount) <= Number(selectedAsset.value?.amount)),
					message: t("Enter correct amount")
				}
			]
		};
	});

	const showTokenSelect = computed<boolean>(() => data.assets.length > 1);

	const tokenAmountLabel = (asset: IProcessingWalletsAssets) =>
		formatAmountBlockchain(asset.amount, { currencyId: asset.currency_id });

	const isZeroAsset = (asset: IProcessingWalletsAssets) => tokenAmountLabel(asset) === "0";

	const tokenBalanceLabel = (asset: IProcessingWalletsAssets) => {
		const amount = tokenAmountLabel(asset);
		const fiatAmount = formatDollars(asset.amount_usd, { currency: "", countPartMoreOneDollar: 2 });
		if (amount === "0" || fiatAmount === "0") return amount;
		return `${amount} • ${formatDollars(asset.amount_usd, { countPartMoreOneDollar: 2 })}`;
	};

	const updateAmounts = (asset: IProcessingWalletsAssets) => {
		form.value.amount = parseFloat(formatAmountBlockchain(asset.amount, { currencyId: asset.currency_id }));
		amountUsdWithdrawProcessing.value = parseFloat(asset.amount_usd);
	};

	const setTokenRef = (element: Element | null, index: number) => {
		if (element instanceof HTMLButtonElement) {
			tokenRefs.value[index] = element;
			return;
		}
		delete tokenRefs.value[index];
	};

	const placeIndicator = () => {
		const container = tokensRef.value;
		const index = data.assets.findIndex((asset) => asset.currency_id === selectedAsset.value?.currency_id);
		const button = tokenRefs.value[index];
		if (!container || !button) {
			indicatorReady.value = false;
			indicatorStyle.value = { opacity: "0" };
			return;
		}
		const containerRect = container.getBoundingClientRect();
		const rect = button.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) {
			indicatorReady.value = false;
			indicatorStyle.value = { opacity: "0" };
			return;
		}
		indicatorStyle.value = {
			opacity: "1",
			width: `${rect.width}px`,
			height: `${rect.height}px`,
			transform: `translate(${rect.left - containerRect.left}px, ${rect.top - containerRect.top}px)`
		};
		if (!indicatorReady.value) {
			requestAnimationFrame(() => {
				indicatorReady.value = true;
			});
		}
	};

	const selectAsset = (asset: IProcessingWalletsAssets) => {
		if (isZeroAsset(asset) || selectedAsset.value?.currency_id === asset.currency_id) return;
		form.value.currency_id = asset.currency_id;
		selectedAsset.value = asset;
		form.value.amount = null;
		amountUsdWithdrawProcessing.value = null;
	};

	const preselectAsset = () => {
		const selectable = data.assets.filter((asset) => !isZeroAsset(asset));
		if (!selectable.length) {
			selectedAsset.value = null;
			form.value.currency_id = "";
			form.value.amount = null;
			amountUsdWithdrawProcessing.value = null;
			return;
		}
		const current = selectable.find((asset) => asset.currency_id === selectedAsset.value?.currency_id);
		if (current) {
			selectedAsset.value = current;
			return;
		}
		const native = selectable.find((asset) => asset.currency_id === data.currency.id);
		selectAsset(native ?? selectable[0]);
	};

	const selectAllAmount = () => {
		if (!selectedAsset.value) return;
		updateAmounts(selectedAsset.value);
	};

	const handleChangeAmount = () => {
		if (!selectedAsset.value || form.value.amount === null) {
			amountUsdWithdrawProcessing.value = null;
			return;
		}
		const assetAmount = parseFloat(selectedAsset.value.amount);
		const assetAmountUsd = parseFloat(selectedAsset.value.amount_usd);
		if (assetAmount === 0 || isNaN(assetAmount) || isNaN(assetAmountUsd)) {
			amountUsdWithdrawProcessing.value = null;
			return;
		}
		const exchangeRate: number = assetAmountUsd / assetAmount;
		amountUsdWithdrawProcessing.value = form.value.amount * exchangeRate;
	};

	const withdrawHandler = async () => {
		try {
			if (!formRef.value || !(await formRef.value.validate())) return;
			if (!form.value?.currency_id) {
				notify(t("Select a coin for withdrawal"));
				return;
			}
			form.value.request_id = generateUUID();
			await postWithdrawalFromProcessing(form.value, clearForm);
		} catch (error: any) {
			console.error(error);
		}
	};

	const clearForm = () => {
		form.value = { ...defaultFormValues };
		selectedAsset.value = null;
		amountUsdWithdrawProcessing.value = null;
		formRef.value?.resetValidate();
		preselectAsset();
	};

	watch(
		() => data.assets,
		() => {
			preselectAsset();
			void nextTick(placeIndicator);
		},
		{ immediate: true }
	);
	watch(
		() => selectedAsset.value?.currency_id,
		() => {
			void nextTick(placeIndicator);
		}
	);
	watch(tokensRef, (element, _, onCleanup) => {
		if (!element) return;
		const observer = new ResizeObserver(() => placeIndicator());
		observer.observe(element);
		void nextTick(placeIndicator);
		onCleanup(() => observer.disconnect());
	});

	defineExpose({
		clearForm
	});
</script>

<template>
	<div class="block">
		<div v-if="showTokenSelect" class="block__column">
			<span class="block__label">{{ $t("Select a token") }}</span>
			<div ref="tokensRef" class="block__tokens">
				<span class="token-indicator" :class="{ 'token-indicator--ready': indicatorReady }" :style="indicatorStyle" />
				<button
					v-for="(item, index) in data.assets"
					:key="item.currency_id"
					:ref="(element) => setTokenRef(element as Element | null, index)"
					type="button"
					class="item"
					:class="{ selected: selectedAsset?.currency_id === item.currency_id }"
					:disabled="isZeroAsset(item)"
					@click="selectAsset(item)"
				>
					<span class="item__content">
						<blockchain-icon :type="item.currency_id as BlockchainType" width="16px" height="16px" />
						<span>{{ getCurrentCoin(item.currency_id) }}</span>
					</span>
					<span class="item__price">
						<span class="item__price-inner">{{ tokenBalanceLabel(item) }}</span>
					</span>
				</button>
			</div>
		</div>
		<ui-form class="form" ref="formRef" @submit.prevent="withdrawHandler" :rules="rulesForm" :model="form">
			<ui-form-item class="input-sum" name="amount" :label="$t('Transfer amount')">
				<ui-input
					v-model="form.amount"
					type="number"
					is-empty-value-null
					@input="handleChangeAmount"
					:placeholder="$t('Enter the amount')"
				>
					<template #append>
						<div class="input-sum__inner">
							<span v-if="amountUsdWithdrawProcessing" class="input-sum__amount">
								≈ {{ formatDollars(amountUsdWithdrawProcessing, { countPartMoreOneDollar: 2 }) }}
							</span>
							<ui-button type="secondary" size="lg" :disabled="isDisabledAllAmount" @click="selectAllAmount">
								{{ $t("All") }}
							</ui-button>
						</div>
					</template>
				</ui-input>
			</ui-form-item>
			<ui-form-item name="address_to" :label="$t('Where to withdraw')">
				<ui-input v-model="form.address_to" :placeholder="$t('Enter address')" />
			</ui-form-item>
			<ui-button
				class="w-full mt-28"
				native-type="submit"
				mode="neutral"
				size="xl"
				left-icon-name="send"
				left-icon-type="400"
				:disabled="isDisabledBtnWithdraw"
			>
				{{ $t("Withdraw") }}
			</ui-button>
		</ui-form>
	</div>
</template>

<style scoped lang="scss">
	.block {
		display: flex;
		flex-direction: column;
		gap: 20px;
		margin: 16px 8px 0;
		padding: 16px 0 0;
		border-top: 1px solid $grey;
		&__label {
			color: $secondary;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
		}
		&__column {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}
		&__tokens {
			position: relative;
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 6px;
			.token-indicator {
				position: absolute;
				top: 0;
				left: 0;
				z-index: 1;
				border-radius: 12px;
				pointer-events: none;
				box-shadow: inset 0 0 0 1px $blue;
				&--ready {
					transition:
						transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
						width 0.45s cubic-bezier(0.22, 1, 0.36, 1),
						height 0.45s cubic-bezier(0.22, 1, 0.36, 1),
						opacity 0.2s ease;
				}
			}
			.item {
				position: relative;
				z-index: 0;
				display: flex;
				align-items: center;
				padding: 4px 12px;
				border-radius: 12px;
				border: 1px solid $grey;
				background-color: $white;
				min-height: 40px;

				&:disabled {
					cursor: not-allowed;
					opacity: 0.45;
				}

				@media (hover: hover) {
					&:not(.selected):not(:disabled):hover {
						border-color: $blue;
					}
				}

				&.selected {
					border-color: transparent;
				}
				&__content {
					display: flex;
					align-items: center;
					gap: 4px;
					color: $black;
					font-size: 14px;
					font-weight: 700;
					line-height: 24px;
					:deep(svg) {
						transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
					}
				}
				&.selected &__content :deep(svg) {
					transform: scale(1.12);
				}
				&__price {
					display: grid;
					margin-left: 8px;
				}
				&__price-inner {
					overflow: hidden;
					min-width: 0;
					color: $grey-opacity;
					font-size: 14px;
					font-weight: 400;
					line-height: 20px;
					white-space: nowrap;
					transition: color 0.35s ease;
				}
				&.selected &__price-inner {
					color: $black;
				}
			}
		}
		.form {
			flex-grow: 1;
			display: grid;
			grid-template-columns: 300px 1fr 280px;
			gap: 20px;
			.input-sum {
				&:deep(.ui-input) {
					justify-content: space-between;
					.ui-input__inner {
						width: 100px;
					}
				}
				&__inner {
					display: flex;
					align-items: center;
					gap: 12px;
				}
				&__amount {
					overflow: hidden;
					display: flex;
					align-items: center;
					flex-shrink: 0;
					color: $secondary;
					font-size: 14px;
					font-weight: 500;
					line-height: 16px;
					max-width: 100px;
					white-space: nowrap;
				}
			}
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.token-indicator--ready {
			transition: none;
		}
	}
</style>
