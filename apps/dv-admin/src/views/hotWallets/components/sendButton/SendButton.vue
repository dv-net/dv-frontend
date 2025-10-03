<script setup lang="ts">
	import { UiButton, UiDropdown, UiIconButton } from "@dv.net/ui-kit";
	import type { IHotWalletsItem } from "@dv-admin/utils/types/api/apiGo";
	import { ref } from "vue";
	import type { UiButtonSize } from "@dv.net/ui-kit/dist/components/UiButton/types";
	import type { UiPlacementType } from "@dv.net/ui-kit/dist/components/UiTooltip/types";
	import IconCursor from "@dv-admin/components/icons/IconCursor.vue";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";
	import { postApiWithdrawManual, postApiWithdrawProcessing } from "@dv-admin/services/api/hotWallets";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import { useI18n } from "vue-i18n";
	import { getApiWithdrawalCurrencyRules } from "@dv-admin/services/api/withdrawal.ts";

	const { notify } = useNotifications();
	const { t } = useI18n();

	withDefaults(
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
</style>
