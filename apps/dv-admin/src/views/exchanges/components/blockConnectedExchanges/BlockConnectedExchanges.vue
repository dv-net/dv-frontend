<script setup lang="ts">
	import { UiButton, UiLink, UiRadio, UiRadioGroup } from "@dv.net/ui-kit";
	import { storeToRefs } from "pinia";
	import { useWithdrawalStore } from "@dv-admin/stores/withdrawal";
	import { useExchangeSettingsStore } from "@dv-admin/stores/exchangeSettings";
	import { useRouter } from "vue-router";
	import { UiIcon } from "@dv.net/ui-kit/dist";
	import { getDeclensionWallets } from "@dv-admin/utils/helpers/declensions";
	import { exchangeLogoSmall } from "@dv-admin/utils/constants/exchange";
	import { ref } from "vue";
	import ChangeExchangeModal from "@dv-admin/views/exchanges/components/blockConnectedExchanges/components/ChangeExchangeModal.vue";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse.ts";

	const { connectedExchanges, withdrawalRules, depositAddresses } = storeToRefs(useWithdrawalStore());
	const { exchangeList } = storeToRefs(useExchangeSettingsStore());
	const router = useRouter();

	const isOpenModal = ref(false);

	const getCountUseWallets = (): number => {
		if (!exchangeList.value?.current_exchange) return 0;
		const depositEntry = depositAddresses.value.find((item) => item.slug === exchangeList.value?.current_exchange);
		if (!depositEntry) return 0;
		const addresses = new Set(depositEntry.addresses.map((item) => item.address));
		const addressesWithdrawal = withdrawalRules.value.flatMap((item) => item.addressees.map((item) => item.address));
		let count: number = 0;
		for (const address of addressesWithdrawal) {
			if (addresses.has(address)) count++;
		}
		return count;
	};
</script>

<template>
	<div v-if="connectedExchanges.length" class="connect">
		<div class="connect__content">
			<span class="connect__content-text">{{ $t("You have connected crypto exchanges") }}</span>
		</div>
		<div class="connect__exchanges">
			<ui-radio-group
				class="connect__list"
				v-model="exchangeList!.current_exchange as string"
				@update:model-value="isOpenModal = true"
			>
				<div
					v-for="item in connectedExchanges"
					:key="item.slug"
					class="item"
					:class="{ blackout: exchangeList?.current_exchange !== item.slug }"
				>
					<div class="item__inner">
						<div class="item__radio">
							<ui-radio :value="item.slug" />
						</div>
						<div class="item__info">
							<div class="item__content">
								<component :is="exchangeLogoSmall[item.slug]" />
								<span class="item__content-title">{{ item.slug }}</span>
								<span class="item__content-point">·</span>
								<span>{{ $t("Connection date") }}: {{ formatDate(item.exchange_connected_at) }}</span>
							</div>
							<ui-button
								type="outline-light"
								size="sm"
								@click="router.push({ name: 'exchanges-connect-one', params: { slug: item.slug } })"
							>
								{{ $t("Change") }}
							</ui-button>
						</div>
					</div>
					<div v-if="exchangeList?.current_exchange === item.slug" class="item__bottom">
						<span class="item__bottom-label">
							{{
								`${$t("Used in withdrawal rules")} ${getCountUseWallets()} ${$t(getDeclensionWallets(getCountUseWallets()))}`
							}}
						</span>
						<ui-link
							:to="{ name: 'exchanges-withdrawal', params: { slug: exchangeList?.current_exchange } }"
							size="md"
							class="flex flex-y-center gap-2"
						>
							<span>{{ $t("Set up withdrawal to the crypto exchange") }}</span>
							<ui-icon name="arrow-forward 1" type="400" size="sm" />
						</ui-link>
					</div>
				</div>
			</ui-radio-group>
		</div>

		<change-exchange-modal v-model:is-open-modal="isOpenModal" />
	</div>
</template>

<style scoped lang="scss">
	.connect {
		padding: 24px;
		background-color: $white;
		display: grid;
		grid-template-columns: 354px 1fr;
		gap: 32px;

		&__content {
			display: flex;
			align-items: center;
			border-right: 1px solid $grey-light;

			&-text {
				color: $secondary;
				font-size: 16px;
				font-weight: 500;
				line-height: 20px;
			}
		}

		&__exchanges {
			display: flex;
			align-items: center;
		}

		&__list {
			display: flex;
			flex-direction: column;
			gap: 8px;
			flex-grow: 1;

			.item {
				width: 100%;
				display: flex;
				flex-direction: column;
				position: relative;
				border-radius: 8px;
				border: 1px solid $grey;
				overflow: hidden;

				&.blackout {
					&::after {
						content: "";
						position: absolute;
						inset: 0;
						background-color: rgba(255, 255, 255, 0.5);
						pointer-events: none;
						border-radius: 8px;
					}
				}

				&__inner {
					display: grid;
					grid-template-columns: 40px 1fr;
					gap: 12px;
					background-color: $white;
					padding: 12px;
				}

				&__bottom {
					border-top: 1px solid $grey;
					background-color: $blue-opacity;
					padding: 8px 12px;
					display: flex;
					align-items: center;
					gap: 12px;
					justify-content: space-between;

					&-label {
						color: #1f9649;
						font-size: 12px;
						font-weight: 400;
						line-height: 12px;
					}
				}

				&__radio {
					display: flex;
					align-items: center;
					border-right: 1px solid $grey;
				}

				&__info {
					display: flex;
					align-items: center;
					justify-content: space-between;
				}

				&__content {
					display: flex;
					align-items: center;
					gap: 4px;
					color: $secondary;
					font-size: 11px;
					font-weight: 400;
					line-height: 20px;

					&-title {
						color: $black;
						font-size: 14px;
						font-weight: 500;
						text-transform: uppercase;
					}

					&-point {
						font-size: 16px;
						font-weight: 600;
					}
				}
			}
		}
	}
</style>
