<script setup lang="ts">
	import { computed, onMounted } from "vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { storeToRefs } from "pinia";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import Authentication from "@dv-admin/views/profile/personalData/components/authentication/Authentication.vue";
	import ChangePassword from "@dv-admin/views/profile/personalData/components/changePassword/ChangePassword.vue";
	import ChangeEmail from "@dv-admin/views/profile/personalData/components/emailBlock/ChangeEmail.vue";
	import ConfirmEmail from "@dv-admin/views/profile/personalData/components/emailBlock/ConfirmEmail.vue";
	import ConnectTelegram from "@dv-admin/views/profile/personalData/components/connectTelegram/ConnectTelegram.vue";
	import { useAuthEmailSectionStore } from "@dv-admin/stores/auth/authEmailSection";

	const { user } = storeToRefs(useAuthStore());
	const { emailCodeLastSentAt } = storeToRefs(useAuthEmailSectionStore());
	const { readWhenEmailCodeSent, calculateRemaining, startEmailCodeTimer, clearEmailCodeTimer } =
		useAuthEmailSectionStore();

	const isConfirmedEmail = computed<boolean>(() => !!user.value?.email_verified_at);

	onMounted(async () => {
		emailCodeLastSentAt.value = readWhenEmailCodeSent();
		const remaining = calculateRemaining(emailCodeLastSentAt.value);

		if (remaining > 0) {
			startEmailCodeTimer(emailCodeLastSentAt.value);
		} else if (emailCodeLastSentAt.value) {
			clearEmailCodeTimer();
		}
	});
</script>

<template>
	<div class="personal-data">
		<block-section class="personal-data__data" :title="$t('Personal data')">
			<confirm-email v-if="!isConfirmedEmail" />
			<change-email v-else />
			<change-password />
		</block-section>
		<authentication />
		<connect-telegram />
	</div>
</template>
<style scoped lang="scss">
	.personal-data {
		display: flex;
		flex-direction: column;
		gap: 24px;
		max-width: 720px;
		width: 100%;
		&__data {
			display: flex;
			flex-direction: column;
			padding: 0 !important;
		}
	}
</style>
