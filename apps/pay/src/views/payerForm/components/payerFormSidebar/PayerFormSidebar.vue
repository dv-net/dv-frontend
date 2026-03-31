<script setup lang="ts">
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { UiCopyText, UiIcon, UiLink } from "@dv.net/ui-kit";
	import { formatDollars, truncateHash } from "@shared/utils/helpers/general.ts";
	import { computed, nextTick, ref } from "vue";
	import BlockAdvertising from "@pay/views/payerForm/components/blockAdvertising/BlockAdvertising.vue";
	import WrapperBlock from "@pay/views/payerForm/components/wrapperBlock/WrapperBlock.vue";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery.ts";
	import BlockLatestTransactions from "@pay/views/payerForm/components/blockLatestTransactions/BlockLatestTransactions.vue";
	import { useRoute, useRouter } from "vue-router";
	import { useI18n } from "vue-i18n";

	const { t } = useI18n();

	const { payerId, store, amount, errorStore, currentStep, isShowAdvertising, isShowBlockLatestTransactions } =
		storeToRefs(usePayerFormStore());
	const isMediaMax480 = useMediaQuery("(max-width: 480px)");
	const route = useRoute();
	const router = useRouter();

	const isEditAmount = ref<boolean>(false);
	const amountDraft = ref<string>("");
	const amountInputRef = ref<HTMLInputElement | null>(null);
	const amountError = ref<string>("");

	const isShowSidebar = computed<boolean>(() => ![3, 4, 5].includes(currentStep.value));
	const isShowDetails = computed<boolean>(() => !errorStore.value && isShowSidebar.value);
	const isAmountChanged = computed<boolean>(() => {
		const normalizedAmount = amountDraft.value.replace(",", ".").trim();
		const parsedAmount = parseFloat(normalizedAmount);
		if (!Number.isFinite(parsedAmount) || !Number.isFinite(Number(amount.value))) return false;
		return parsedAmount !== Number(amount.value);
	});

	const updateAmountInQuery = async (newAmount: number) => {
		await router.replace({
			query: {
				...route.query,
				amount: newAmount.toString()
			}
		});
	};

	const startEditAmount = async () => {
		amountError.value = "";
		amountDraft.value = amount.value ? amount.value.toString() : store.value?.minimal_payment || "0";
		isEditAmount.value = true;
		await nextTick();
		amountInputRef.value?.focus();
		amountInputRef.value?.select();
	};

	const cancelEditAmount = () => {
		amountError.value = "";
		isEditAmount.value = false;
	};

	const saveEditAmount = async () => {
		if (!isAmountChanged.value) {
			cancelEditAmount();
			return;
		}
		const normalizedAmount = amountDraft.value.replace(",", ".").trim();
		const parsedAmount = parseFloat(normalizedAmount);
		const minimalPayment = parseFloat(String(store.value?.minimal_payment || "0"));
		if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
			amountError.value = t("Invalid amount");
			return;
		}
		if (Number.isFinite(minimalPayment) && parsedAmount < minimalPayment) {
			amountError.value = t("The minimum deposit amount is {amount}", { amount: `$${store.value?.minimal_payment}` || "$0" });
			return;
		}
		amount.value = parsedAmount;
		await updateAmountInQuery(parsedAmount);
		amountError.value = "";
		isEditAmount.value = false;
	};

	const sanitizeAmountDraft = () => {
		let nextValue = amountDraft.value.replace(/,/g, ".");
		nextValue = nextValue.replace(/[^0-9.]/g, "");
		const dotIndex = nextValue.indexOf(".");
		if (dotIndex !== -1) {
			nextValue = `${nextValue.slice(0, dotIndex + 1)}${nextValue.slice(dotIndex + 1).replace(/\./g, "")}`;
		}
		amountDraft.value = nextValue;
	};
</script>

<template>
	<div v-if="isShowSidebar" class="sidebar">
		<wrapper-block v-if="isShowDetails">
			<div class="details">
				<h2 class="global-title-h2">{{ $t("Payment details") }}</h2>
				<div class="details__content">
					<div class="row">
						<span class="row__label">{{ $t("Payment ID") }}</span>
						<div v-if="payerId" class="flex flex-y-center gap-8">
							<span>{{ truncateHash(payerId, 12) }}</span>
							<ui-copy-text :copied-text="payerId" color-icon="#A4A5B1" />
						</div>
						<span v-else>—</span>
					</div>
					<div v-if="store?.name && store?.site_url" class="row">
						<span class="row__label">{{ $t("Site") }}</span>
						<ui-link
							:href="store.site_url"
							target="_blank"
							:size="isMediaMax480 ? 'lg' : 'xl'"
							class="flex flex-y-center gap-8"
						>
							<span>{{ store.name }}</span>
							<ui-icon name="new-windows" type="400" />
						</ui-link>
					</div>
					<div v-else-if="store?.name && !store?.site_url" class="row">
						<span class="row__label">{{ $t("Site") }}</span>
						<span>{{ store.name }}</span>
					</div>
				</div>
				<div class="details__bottom">
					<span class="details__bottom-label">{{ $t("Sum") }}:</span>
					<div class="price">
						<template v-if="!isEditAmount">
							<span class="price__number">{{ formatDollars(amount, "$", "—", 2) }}</span>
							<button class="price__text" type="button" @click="startEditAmount">
								{{ $t("Change") }}
							</button>
						</template>
						<template v-else>
							<input
								ref="amountInputRef"
								v-model="amountDraft"
								type="tel"
								inputmode="decimal"
								class="price__input"
								@input="sanitizeAmountDraft"
								@keydown.enter.prevent="saveEditAmount"
								@keydown.esc.prevent="cancelEditAmount"
							/>
							<div class="price__actions">
								<button
									v-if="isAmountChanged"
									class="price__text price__text--active"
									type="button"
									@click="saveEditAmount"
								>
									{{ $t("Save") }}
								</button>
								<button class="price__text" type="button" @click="cancelEditAmount">
									{{ $t("Back") }}
								</button>
							</div>
							<span v-if="amountError" class="price__error">{{ amountError }}</span>
						</template>
					</div>
				</div>
			</div>
		</wrapper-block>
		<block-latest-transactions v-if="isShowBlockLatestTransactions" class="sidebar__latest-transactions" />
		<block-advertising v-if="isShowAdvertising" class="sidebar__advertising" />
	</div>
</template>

<style scoped lang="scss">
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 24px;
		width: 492px;
		flex-shrink: 0;
		@include mediamax(1180) {
			width: 400px;
		}
		@include mediamax(1024) {
			width: 100%;
		}
		.details {
			display: flex;
			flex-direction: column;
			&__content {
				display: flex;
				flex-direction: column;
				gap: 12px;
				padding: 20px 0 44px;
				border-bottom: 1px solid $main-border-color;
				@include mediamax(480) {
					gap: 8px;
					padding: 12px 0 20px;
				}
				.row {
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 12px;
					color: $main-text-grey-color;
					font-size: 16px;
					font-weight: 400;
					line-height: 130%;
					@include mediamax(480) {
						display: flex;
						align-items: unset;
						justify-content: unset;
						flex-direction: column;
						gap: 4px;
						font-size: 14px;
					}
					&__label {
						@include mediamax(480) {
							font-size: 14px;
							opacity: 0.6;
						}
					}
					&__site {
						color: $main-text-link-and-price-color;
					}
				}
			}
			&__bottom {
				padding-top: 20px;
				display: flex;
				align-items: flex-start;
				justify-content: space-between;
				@include mediamax(480) {
					padding-top: 16px;
				}
				&-label {
					font-size: 20px;
					font-weight: 500;
					@include mediamax(480) {
						font-size: 16px;
					}
				}
				.price {
					display: flex;
					flex-direction: column;
					align-items: flex-end;
					gap: 4px;
					&__number {
						color: $main-text-link-and-price-color;
						font-size: 32px;
						line-height: 40px;
						@include mediamax(480) {
							font-size: 24px;
						}
						font-weight: 700;
					}
					&__text {
						padding: 0;
						border: none;
						background: transparent;
						color: #a4a5b1;
						font-size: 16px;
						font-weight: 400;
						line-height: 19px;
						text-decoration: underline;
						text-decoration-style: dotted;
						text-underline-offset: 3px;
						cursor: pointer;
						&--active {
							color: $main-text-link-and-price-color;
						}
					}
					&__input {
						width: 180px;
						padding: 0;
						border: none;
						outline: none;
						text-align: right;
						color: $main-text-link-and-price-color;
						font-size: 32px;
						line-height: 40px;
						font-weight: 700;
						background: transparent;
						@include mediamax(480) {
							font-size: 24px;
						}
					}
					&__actions {
						display: flex;
						gap: 8px;
					}
					&__error {
						color: #dd4c1e;
						font-size: 12px;
						line-height: 16px;
					}
				}
			}
		}
		&__advertising,
		&__latest-transactions {
			@include mediamax(1024) {
				display: none;
			}
		}
	}
</style>
