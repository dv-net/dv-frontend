<script setup lang="ts">
	import type { IAddressBookList, IMapAddressBookRow } from "@dv-admin/utils/types/schemas";
	import { ADDRESS_BOOK_TYPES } from "@dv-admin/utils/constants/addressBook";
	import { getCurrentBlockchain, getCurrentCoin } from "@shared/utils/helpers/general.ts";
	import { UiIcon, UiTooltip } from "@dv.net/ui-kit";
	import { useAddressBookStore } from "@dv-admin/stores/addressBook";
	import { computed } from "vue";
	import { useI18n } from "vue-i18n";

	const { t } = useI18n();

	const { mapAddressBookRow } = useAddressBookStore();

	const { row } = defineProps<{ row: IAddressBookList }>();

	const mappedRow = computed<IMapAddressBookRow | null>(() => {
		return row.type !== ADDRESS_BOOK_TYPES.REGULAR ? mapAddressBookRow(row) : null;
	});

	const tooltipText = computed<string>(() => {
		if (row.type === ADDRESS_BOOK_TYPES.REGULAR) {
			return row.withdrawal_rule_exists
				? t("address-book-tooltip-text", {
						blockchain: row.currency_id
							? `${getCurrentCoin(row.currency_id)} (${getCurrentBlockchain(row.currency_id)})`
							: ""
					})
				: t("The address is missing from the withdrawal rules");
		}
		if (mappedRow.value) {
			if (mappedRow.value.hasAllWithdrawalRules) {
				return row.type === ADDRESS_BOOK_TYPES.UNIVERSAL
					? t("The address is specified in the output rules in all tokens")
					: t("The address is specified in the output rules in all blockchains");
			}
			if (mappedRow.value.hasAnyWithdrawalRule) {
				return t("address-book-tooltip-text", {
					blockchain: mappedRow.value.withdrawalCurrencies
						.map((item) => `${getCurrentCoin(item.currency_id)} (${getCurrentBlockchain(item.currency_id)})`)
						.join(", ")
				});
			}
			return t("The address is missing from the withdrawal rules");
		}
		return "";
	});

	const iconConfig = computed<{ name: string; color: string } | null>(() => {
		if (row.type === ADDRESS_BOOK_TYPES.REGULAR) {
			return row.withdrawal_rule_exists
				? { name: "check-circle", color: "#1f9649" }
				: { name: "cancel", color: "#dd4c1e" };
		}
		if (mappedRow.value) {
			if (mappedRow.value.hasAllWithdrawalRules) return { name: "check-circle", color: "#1f9649" };
			if (mappedRow.value.hasAnyWithdrawalRule) return { name: "check-circle", color: "#ff9e00" };
			return { name: "cancel", color: "#dd4c1e" };
		}
		return null;
	});
</script>

<template>
	<ui-tooltip
		v-if="
			row.type === ADDRESS_BOOK_TYPES.REGULAR ||
			row.type === ADDRESS_BOOK_TYPES.UNIVERSAL ||
			row.type === ADDRESS_BOOK_TYPES.EVM
		"
		:title="$t('Presence of address in withdrawal rules')"
		:text="tooltipText"
	>
		<ui-icon v-if="iconConfig" :name="iconConfig.name" type="400" size="lg" :color="iconConfig.color" class="pointer" />
	</ui-tooltip>
	<span v-else>—</span>
</template>
