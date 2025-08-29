<script setup lang="ts">
	import { UiButton, UiInput, UiLink } from "@dv.net/ui-kit";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { storeToRefs } from "pinia";
	import { useWithdrawalStore } from "@dv-admin/stores/withdrawal";
	import { computed } from "vue";
	import { useAuthStore } from "@dv-admin/stores/auth";

	const { addressesTotp, isLoadingEditAddresses, isShowAuthentication } = storeToRefs(useWithdrawalStore());
	const { resetAddressAuthentication, patchWithdrawalWalletAddresses } = useWithdrawalStore();
	const { userData2Fa } = storeToRefs(useAuthStore());

	const disabledBtn = computed<boolean>(() => addressesTotp.value.length < 6);
</script>

<template>
	<block-section v-if="isShowAuthentication" class="authentication" mode="grey-border">
		<template v-if="userData2Fa?.is_confirmed">
			<h3 class="global-title-h3">{{ $t("Two-factor authentication") }}</h3>
			<div class="authentication__inner">
				<ui-input
					v-model="addressesTotp"
					type="tel"
					class="authentication__input"
					:placeholder="$t('Enter the code')"
					size="lg"
				/>
			</div>
			<div class="authentication__actions">
				<ui-button
					type="primary"
					size="lg"
					:loading="isLoadingEditAddresses"
					:disabled="disabledBtn"
					@click="patchWithdrawalWalletAddresses"
				>
					{{ $t("Confirm") }}
				</ui-button>
				<ui-button type="tertiary" size="lg" @click="resetAddressAuthentication">
					{{ $t("Cancel.noun") }}
				</ui-button>
			</div>
		</template>
		<div v-else class="message">
			<h3 class="global-title-h3">{{ $t("You don't have 2FA enabled") }}</h3>
			<p>{{ $t("Go to your profile to enable 2FA") }}</p>
			<ui-link class="message__link" :to="{ name: 'profile-personal-data' }">
				{{ $t("Go to profile") }}
			</ui-link>
		</div>
	</block-section>
</template>

<style scoped lang="scss">
	.authentication {
		display: flex;
		flex-direction: column;
		max-width: 504px;
		width: 100%;
		margin-top: 16px;
		&__inner {
			display: flex;
			align-items: center;
			gap: 24px;
		}
		&__input {
			margin: 24px 0 20px;
		}
		&__actions {
			display: flex;
			align-items: center;
			gap: 12px;
		}
	}
	.message {
		display: flex;
		align-items: center;
		flex-direction: column;
		gap: 8px;
		&__link {
			width: max-content;
			border-bottom: 1px solid;
		}
	}
</style>
