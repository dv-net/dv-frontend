<script setup lang="ts">
	import { computed, toRefs } from "vue";
	import { storeToRefs } from "pinia";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { useHotWalletsStore } from "@dv-admin/stores/hotWallets";
	import { UiLink, UiModal } from "@dv.net/ui-kit/dist";
	import AuthenticationForm from "@dv-admin/views/hotWallets/components/savePhrasesDialog/authenticationForm/AuthenticationForm.vue";
	import TextAreaPasswordCopy from "@dv-admin/views/hotWallets/components/savePhrasesDialog/textareaPasswordCopy/TextAreaPasswordCopy.vue";

	type RequestType = "seeds" | "keys";

	const props = defineProps<{ modelValue: boolean; type?: RequestType }>();
	const emits = defineEmits(["update:model-value"]);

	const { modelValue, type } = toRefs(props);

	const { userData2Fa } = storeToRefs(useAuthStore());
	const { walletSeeds, walletKeys } = storeToRefs(useHotWalletsStore());

	const isOpen = computed<boolean>({
		get: () => modelValue.value,
		set: (value: boolean) => emits("update:model-value", value)
	});

	const handleCloseDialog = () => {
		walletSeeds.value = {};
		walletKeys.value = {};
	};
</script>

<template>
	<ui-modal v-model="isOpen" width="800" @close="handleCloseDialog">
		<div class="wrapper">
			<div v-if="userData2Fa?.is_confirmed" class="form">
				<h3 class="form__title global-title-h3">
					<span>{{ $t("Send code to receive") }}</span>
					<span v-if="type === 'keys'">{{ $t("private keys") }}</span>
					<span v-if="type === 'seeds'">{{ $t("seed phrases") }}</span>
				</h3>
				<authentication-form is-check-code :type="type" />

				<div v-if="Object.values(walletSeeds).length && type === 'seeds'" class="form__code">
					<text-area-password-copy v-if="walletSeeds.mnemonic" label="Mnemonica" v-model="walletSeeds.mnemonic" />
					<text-area-password-copy
						v-if="walletSeeds.pass_phrase"
						label="Passphrase"
						v-model="walletSeeds.pass_phrase"
					/>
				</div>

				<div v-if="Object.values(walletKeys).length && type === 'keys'" class="form__code">
					<text-area-password-copy v-if="walletKeys.keys" label="Keys" v-model="walletKeys.keys" />
				</div>
			</div>
			<div class="banner" v-else>
				<h3 class="global-title-h3">{{ $t("You don't have 2FA enabled") }}</h3>
				<p>{{ $t("Go to your profile to enable 2FA") }}</p>
				<ui-link class="banner__link" :to="{ name: 'profile-personal-data' }">
					{{ $t("Go to profile") }}
				</ui-link>
			</div>
		</div>
	</ui-modal>
</template>

<style scoped lang="scss">
	.wrapper {
		display: flex;
		padding: 10px 0;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 20px;
		flex-grow: 1;

		&__title {
			display: flex;
			align-items: center;
			gap: 4px;
		}

		&__code {
			width: 100%;
			display: flex;
			flex-direction: column;
			gap: 8px;
		}
	}

	.banner {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		align-items: center;
		gap: 20px;

		&__link {
			width: max-content;
			border-bottom: 1px solid;
		}
	}
</style>
