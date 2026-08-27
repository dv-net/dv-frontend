<script setup lang="ts">
	import { UiButton, UiDropdown, UiIconButton } from "@dv.net/ui-kit";
	import type { IHotWalletsItem } from "@dv-admin/utils/types/api/apiGo";
	import { computed, ref } from "vue";
	import type { UiButtonSize } from "@dv.net/ui-kit/dist/components/UiButton/types";
	import type { UiPlacementType } from "@dv.net/ui-kit/dist/components/UiTooltip/types";
	import IconCursor from "@dv-admin/components/icons/IconCursor.vue";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";
	import {
		postApiWithdrawManual,
		postApiWithdrawProcessing,
		postApiWalletAddressesMarkIsDirty
	} from "@dv-admin/utils/services/hotWallets";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import { useI18n } from "vue-i18n";
	import { getApiWithdrawalCurrencyRules } from "@dv-admin/utils/services/withdrawal.ts";
	import { storeToRefs } from "pinia";
	import { useHotWalletsStore } from "@dv-admin/stores/hotWallets";
	import { useGeneralStore } from "@dv-admin/stores/general";

	const { notify } = useNotifications();
	const { t } = useI18n();
	const hotWalletsStore = useHotWalletsStore();
	const { includedWallets } = storeToRefs(hotWalletsStore);
	const { postWalletKeysHot, getWallets } = hotWalletsStore;
	const { openOtpGlobalModal } = useGeneralStore();

	const props = withDefaults(
		defineProps<{
			data: IHotWalletsItem;
			sizeButton?: UiButtonSize;
			placement?: UiPlacementType;
			isCard?: boolean;
		}>(),
		{
			sizeButton: "lg",
			placement: "bottom-start",
			isCard: false
		}
	);

	const isShowDropdown = ref<Record<string, boolean>>({});

	const isShowDownloadKeys = computed<boolean>(() => !includedWallets.value.length);

	const postWithdrawManualOrProcessing = async (
		type: "rules" | "processing",
		currency_id: string,
		wallet_address_id: string
	) => {
		try {
			if (type === "rules") {
				const data = await getApiWithdrawalCurrencyRules(currency_id);
				if (!data?.addressees || !data?.addressees?.length) {
					notify(t("You have not added the address to the withdrawal rules"));
					return;
				}
				await postApiWithdrawManual(currency_id, wallet_address_id);
				notify(t("Money sent according to withdrawal rules"), "success");
			} else if (type === "processing") {
				await postApiWithdrawProcessing(currency_id, wallet_address_id);
				notify(t("Money has been sent to the processing wallet"), "success");
			}
		} catch (error: any) {
			console.error(error);
		}
	};

	const handleSendWallet = async (item: IHotWalletsItem, type: "rules" | "processing") => {
		isShowDropdown.value[item.id] = false;
		await postWithdrawManualOrProcessing(type, item.currency_id, item.id);
	};

	const handleMarkIsDirty = async (item: IHotWalletsItem) => {
		isShowDropdown.value[item.id] = false;
		try {
			await postApiWalletAddressesMarkIsDirty({ address: item.address });
			notify(t("Address marked as dirty"), "success");
			await getWallets("pagination");
		} catch (error: any) {
			console.error(error);
		}
	};

	const handleDownloadKeys = (typeFile: "json" | "csv") => {
		isShowDropdown.value[props.data.id] = false;
		openOtpGlobalModal(() => postWalletKeysHot(typeFile, undefined, [props.data.id]));
	};
</script>

<template>
	<ui-dropdown
		trigger="click"
		popper-class="global-dropdown__wallets"
		:placement="placement"
		v-model="isShowDropdown[data.id]"
	>
		<template #reference>
			<span v-if="isCard" class="icon">
				<ui-icon-button icon-name="more-vert" />
			</span>

			<ui-button v-else type="secondary" :size="sizeButton">
				{{ $t("Send") }}
			</ui-button>
		</template>

		<template #default>
			<div class="global-dropdown__wallets-list">
				<div class="global-dropdown__wallets-item" @click="handleSendWallet(data, 'rules')">
					<icon-cursor class="clickable-sm" />
					<span>{{ $t("According to the withdrawal rules") }}</span>
					<tooltip-helper
						:title="$t('According to the withdrawal rules')"
						:text="$t('Forced withdrawal from the wallet to the address you specified.')"
					/>
				</div>

				<div class="global-dropdown__wallets-item" @click="handleSendWallet(data, 'processing')">
					<ui-icon-button icon-name="send" container-small size="lg" />
					<span>{{ $t("To the processing") }}</span>
					<tooltip-helper :title="$t('To the processing')" :text="$t('Forced withdrawal to the processing wallet.')" />
				</div>

				<div class="global-dropdown__wallets-item" @click="handleMarkIsDirty(data)">
					<ui-icon-button icon-name="cancel" container-small size="lg" />
					<span>{{ $t("Mark address as dirty") }}</span>
					<tooltip-helper
						:title="$t('Mark address as dirty')"
						:text="
							$t(
								'This address has been marked as dirty and permanently removed from automatic allocation. Any funds received to this wallet require manual withdrawal processing.'
							)
						"
					/>
				</div>

				<div v-if="isShowDownloadKeys" class="download-keys">
					<div class="download-keys__title">
						<ui-icon-button icon-name="key" container-small size="lg" />
						<span>{{ $t("Download keys in format") }}</span>
						<tooltip-helper
							:title="$t('Download keys')"
							:text="$t('Download private keys for this wallet.')"
						/>
					</div>
					<div class="download-keys__formats">
						<ui-button type="secondary" size="sm" @click="handleDownloadKeys('json')">json</ui-button>
						<ui-button type="secondary" size="sm" @click="handleDownloadKeys('csv')">csv</ui-button>
					</div>
				</div>
			</div>
		</template>
	</ui-dropdown>
</template>

<style scoped lang="scss">
	.icon {
		@extend .center;
		width: 24px;
		height: 24px;
		border-radius: 4px;
		border: 1px solid $grey;
		background-color: $blue-opacity;
	}
	.clickable-sm {
		@media (hover: hover) {
			&:hover {
				transition: transform 0.3s ease-in-out;
				transform: scale(1.05);
			}
		}
	}

	.download-keys {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 10px 16px;
		align-self: stretch;
		width: 100%;
		box-sizing: border-box;
		color: #000;
		font-weight: 400;
		font-size: 14px;

		&__title {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16px;

			span {
				flex: 1;
			}
		}

		&__formats {
			display: flex;
			align-items: center;
			gap: 8px;
			width: 100%;
		}

		:deep(.ui-button) {
			flex: 1 1 0;
			width: 100%;
			min-width: 0;
		}
	}
</style>
