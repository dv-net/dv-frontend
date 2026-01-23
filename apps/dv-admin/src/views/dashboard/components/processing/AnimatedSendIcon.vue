<script setup lang="ts">
	import { UiTooltip } from "@dv.net/ui-kit";
	import IconWithdrawalFromProcessing from "@dv-admin/components/icons/dashboard/IconWithdrawalFromProcessing.vue";

	defineProps<{ blockchain: string }>();
</script>

<template>
	<ui-tooltip
		:title="`${$t('Withdrawal from processing')} ${$t('wallets.many3')}`"
		:text="$t('You can withdraw funds from the current processing ring')"
	>
		<icon-withdrawal-from-processing />
	</ui-tooltip>
</template>
