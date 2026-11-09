<script setup lang="ts">
	import { UiButton } from "@dv.net/ui-kit";
	import WrapperBlock from "@pay-shared/components/payerForm/wrapperBlock/WrapperBlock.vue";
	import BannerInfo from "@pay-shared/components/payerForm/bannerInfo/BannerInfo.vue";
	import TransactionBlockInfo from "@pay-shared/components/payerForm/transactionBlockInfo/TransactionBlockInfo.vue";
	import IconAmlGauge from "@pay/components/icons/aml/IconAmlGauge.vue";
	import { buildRefundEntryPartialRoute } from "@pay/utils/helpers/refundEntry";
	import { computed } from "vue";
	import { useRouter } from "vue-router";
	import type { RouteLocationRaw } from "vue-router";
	import type { IPayerAddressResponse, IPayerStoreResponse } from "@pay-shared/utils/types/payer";
	import type { IWalletTransactionResponse } from "@pay-shared/utils/types/transaction";
	import type { IAmlBlockReason } from "@pay/utils/types/aml";
	import { AML_RISK_LEVEL_BY_RANK, AML_RISK_TYPE } from "@pay/utils/constants/aml";
	import { useI18n } from "vue-i18n";
	import amlCheckFailedIcon from "@pay/assets/images/aml-check-failed.png";

	const {
		currentTransaction = null,
		addresses,
		payerId = null,
		storeId = null,
		store = null,
		formattedFiatAmount,
		riskScore = null,
		blockReasons = []
	} = defineProps<{
		currentTransaction?: IWalletTransactionResponse | null;
		addresses: IPayerAddressResponse[];
		payerId?: string | null;
		storeId?: string | null;
		store?: IPayerStoreResponse | null;
		formattedFiatAmount: string;
		riskScore?: string | null;
		blockReasons?: IAmlBlockReason[];
	}>();

	const router = useRouter();
	const { t } = useI18n();

	const refundRoute = computed((): RouteLocationRaw | null => {
		if (!payerId || !storeId) return null;
		return buildRefundEntryPartialRoute({
			wallet_id: payerId,
			store_id: storeId
		});
	});

	const goToRefund = () => {
		if (!refundRoute.value) return;
		void router.push(refundRoute.value);
	};

	const formatPercent = (raw: string | null, fraction = false): string => {
		const value = Number(raw);
		if (raw === null || raw === "" || !Number.isFinite(value)) return "—";
		return `${Math.ceil(fraction && value <= 1 ? value * 100 : value)}%`;
	};

	const humanizeRiskType = (riskType: string): string => {
		const text = riskType.replace(/_/g, " ").trim().toLowerCase();
		return text.charAt(0).toUpperCase() + text.slice(1);
	};

	const displayedReasons = computed(() =>
		blockReasons
			.filter((reason) => reason.risk_type !== AML_RISK_TYPE.totalScore)
			.map((reason) => {
				if (reason.risk_type === AML_RISK_TYPE.riskLevel) {
					const level = AML_RISK_LEVEL_BY_RANK[Math.round(Number(reason.value))];
					return { key: reason.risk_type, label: t("Risk level"), value: level ? t(level) : "—" };
				}
				const label =
					reason.risk_type === AML_RISK_TYPE.sumOfSignals ? t("Sum of signals") : humanizeRiskType(reason.risk_type);
				return { key: reason.risk_type, label, value: formatPercent(reason.value) };
			})
	);
</script>

<template>
	<div v-if="currentTransaction" class="screen">
		<wrapper-block class="card">
			<div class="info">
				<div class="content">
					<img class="content__icon" :src="amlCheckFailedIcon" alt="" />
					<div class="content__inner">
						<h2 class="content__title">{{ $t("Payment did not pass the AML check") }}</h2>
						<p class="content__text">{{ $t("You can request a refund yourself by pressing «Refund the funds»") }}</p>
					</div>
				</div>
				<div class="details">
					<div class="cards">
						<div class="risk">
							<div class="risk__score">
								<div class="risk__mark" aria-hidden="true">
									<icon-aml-gauge />
								</div>
								<div class="risk__total">
									<span>{{ $t("Overall risk") }}:</span>
									<strong>{{ formatPercent(riskScore, true) }}</strong>
								</div>
							</div>
							<ul v-if="displayedReasons.length" class="risk__signals" :aria-label="$t('Block reasons')">
								<li v-for="reason in displayedReasons" :key="reason.key" class="risk__pill">
									<span>{{ reason.label }}</span>
									<strong>{{ reason.value }}</strong>
								</li>
							</ul>
						</div>
						<transaction-block-info
							:current-transaction="currentTransaction"
							:addresses="addresses"
							:store="store"
							:formatted-fiat-amount="formattedFiatAmount"
						/>
					</div>
					<ui-button
						v-if="refundRoute"
						class="info__action"
						type="primary"
						mode="accent"
						size="xl"
						left-icon-name="currency-exchange"
						left-icon-type="400"
						left-icon-size="md"
						left-icon-color="#ffffff"
						@click="goToRefund"
					>
						{{ $t("Refund the funds") }}
					</ui-button>
				</div>
			</div>
		</wrapper-block>
		<banner-info />
	</div>
</template>

<style scoped lang="scss">
	.screen {
		display: flex;
		flex-direction: column;
		gap: 20px;
		width: 100%;
		min-width: 0;
		max-width: 100%;
		@include mediamax(1024) {
			gap: 16px;
		}
		@include mediamax(768) {
			gap: 12px;
		}
		@include mediamax(480) {
			gap: 16px;
		}
		:deep(.block.card) {
			padding: 30px 24px 24px;
			border-radius: 24px;
			@include mediamax(480) {
				padding: 24px 16px 16px;
				border-radius: 16px;
			}
		}
		.info {
			display: flex;
			flex-direction: column;
			align-items: center;
			width: 100%;
			min-width: 0;
			max-width: 100%;
			gap: 54px;
			@include mediamax(768) {
				gap: 32px;
			}
			@include mediamax(480) {
				gap: 24px;
			}
		}
		.content {
			display: flex;
			align-items: center;
			flex-direction: column;
			gap: 12px;
			width: 100%;
			min-width: 0;
			max-width: 100%;
			&__icon {
				width: 110px;
				height: 110px;
				@include mediamax(480) {
					width: 88px;
					height: 88px;
				}
			}
			&__inner {
				display: flex;
				flex-direction: column;
				gap: 8px;
				align-items: center;
				width: 100%;
				min-width: 0;
				max-width: 100%;
			}
			&__title {
				margin: 0;
				max-width: 100%;
				text-align: center;
				font-size: 20px;
				font-weight: 600;
				line-height: 24px;
				letter-spacing: -0.01em;
				color: rgb(249, 57, 57);
				overflow-wrap: anywhere;
				@include mediamax(1024) {
					font-size: 18px;
					line-height: 22px;
				}
			}
			&__text {
				margin: 0;
				width: fit-content;
				max-width: 100%;
				padding: 8px 20px;
				border-radius: 722px;
				background: rgb(247, 249, 251);
				text-align: center;
				color: rgb(107, 109, 128);
				font-size: 16px;
				font-weight: 400;
				line-height: 20px;
				overflow-wrap: anywhere;
				@include mediamax(1024) {
					width: 100%;
				}
				@include mediamax(480) {
					padding: 8px 12px;
					font-size: 14px;
					line-height: 18px;
				}
			}
		}
		.details {
			display: flex;
			flex-direction: column;
			gap: 24px;
			width: 100%;
			min-width: 0;
			@include mediamax(480) {
				gap: 16px;
			}
		}
		.cards {
			display: flex;
			flex-direction: column;
			gap: 12px;
			width: 100%;
			min-width: 0;
			max-width: 100%;
		}
		.risk {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16px;
			padding: 16px;
			width: 100%;
			min-width: 0;
			max-width: 100%;
			border: 1px solid rgb(236, 240, 245);
			border-radius: 16px;
			@include mediamax(768) {
				flex-direction: column;
				align-items: stretch;
			}
			@include mediamax(480) {
				gap: 12px;
				padding: 12px;
			}
			&__score {
				display: flex;
				align-items: center;
				gap: 8px;
				flex-shrink: 0;
			}
			&__mark {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 44px;
				height: 44px;
				border-radius: 13.2px;
				background: rgba(249, 57, 57, 0.1);
				color: rgb(249, 57, 57);
			}
			&__total {
				display: flex;
				flex-direction: column;
				gap: 4px;
				color: rgb(48, 51, 69);
				font-size: 16px;
				font-weight: 400;
				line-height: 20px;
				@include mediamax(480) {
					font-size: 14px;
					line-height: 18px;
				}
				strong {
					font-weight: 700;
					color: rgb(249, 57, 57);
				}
			}
			&__signals {
				display: flex;
				flex-wrap: wrap;
				justify-content: flex-end;
				gap: 8px;
				margin: 0;
				padding: 0;
				list-style: none;
				@include mediamax(768) {
					justify-content: flex-start;
				}
			}
			&__pill {
				display: inline-flex;
				align-items: center;
				gap: 8px;
				padding: 8px 12px;
				border-radius: 1078px;
				background: rgb(247, 249, 251);
				color: rgb(48, 51, 69);
				font-size: 16px;
				font-weight: 400;
				line-height: 20px;
				@include mediamax(480) {
					gap: 6px;
					padding: 6px 10px;
					font-size: 14px;
					line-height: 18px;
				}
				strong {
					font-weight: 500;
					color: rgb(249, 57, 57);
				}
			}
		}
		.info__action {
			width: 100%;
			min-width: 0;
			max-width: 100%;
			@include mediamax(576) {
				height: 36px;
				min-height: 36px;
				padding: 0 16px;
				gap: 8px;
				border-radius: 10px;
				font-size: 14px;
				line-height: 18px;
			}
		}
	}
</style>
