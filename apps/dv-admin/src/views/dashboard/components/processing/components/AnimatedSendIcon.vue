<script setup lang="ts">
	import { UiIconButton, UiTooltip } from "@dv.net/ui-kit";

	defineProps<{ blockchain: string }>();
</script>

<template>
	<ui-tooltip
		:title="`${$t('Withdrawal from processing')} ${$t('wallets.many3')}`"
		:text="
			$t('In the Withdrawal from Processing Wallet section, you can withdraw funds from the processing wallet.', {
				blockchain: blockchain.toUpperCase()
			})
		"
	>
		<ui-icon-button
			size="lg"
			icon-name="send"
			:to="{ name: 'withdraw-from-processing', params: { blockchain } }"
			container-small
		/>
	</ui-tooltip>
</template>
