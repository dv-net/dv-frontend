<script setup lang="ts">
	import { UiSelect, UiInput, UiButton, UiCopyText, UiIcon } from "@dv.net/ui-kit";
	import type { IUiSelectOptions } from "@dv-admin/utils/types/general.ts";
	import { computed, onMounted, ref } from "vue";
	import { useI18n } from "vue-i18n";
	import { getApiMnemonicGenerate } from "@dv-admin/services/api/general.ts";
	import { storeToRefs } from "pinia";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { postApiProcessingRegisterOwner } from "@dv-admin/services/api/auth.ts";
	import { useNotifications } from "@shared/utils/composables/useNotifications.ts";
	import { useRouter } from "vue-router";

	const { t } = useI18n();
	const { notify } = useNotifications();
	const router = useRouter();
	const { initStore, getUser } = useAuthStore();
	const { isShowMainLoader } = storeToRefs(useAuthStore());

	const countWord = ref<string>("24");
	const mnemonic = ref(Array(Number(countWord.value)).fill(""));
	const mnemonicCopy = ref(Array(Number(countWord.value)).fill(""));
	const isShowMnemonic = ref<boolean>(false);
	const isCloud = ref<boolean>(window.location.host === "cloud.dv.net");
	const options = computed<IUiSelectOptions[]>(() => {
		return [
			{ label: t("12-word phrase"), value: "12" },
			{ label: t("24-word phrase"), value: "24" }
		];
	});

	const getMnemonicGenerate = async () => {
		try {
			const data = await getApiMnemonicGenerate(countWord.value);
			if (data) {
				const mnemonicGenerateBackend: string[] = data.split(" ");
				countWord.value = mnemonicGenerateBackend.length < 24 ? "12" : "24";
				mnemonic.value = [...mnemonicGenerateBackend];
				mnemonicCopy.value = [...mnemonicGenerateBackend];
			}
		} catch (error: any) {
			console.error(error);
		}
	};

	const handlePaste = (event: ClipboardEvent) => {
		const text = event.clipboardData?.getData("text");
		if (!text) return;
		const words = text.trim().split(/\s+/);
		const expectedLength = Number(countWord.value);
		for (let i = 0; i < expectedLength; i++) {
			mnemonic.value[i] = words[i] || "";
		}
		event.preventDefault();
	};

	const clearMnemonic = () => {
		mnemonic.value = Array(Number(countWord.value)).fill("");
	};

	const postProcessingRegisterOwner = async () => {
		try {
			const arrayValidValues = mnemonic.value.filter(Boolean);
			if (arrayValidValues.length < Number(countWord.value)) {
				notify(t("Incorrect mnemonics"));
				return;
			}
			isShowMainLoader.value = true;
			await postApiProcessingRegisterOwner(mnemonic.value.join(" "));
			await getUser();
			await initStore();
			await router.push({ name: "quick-start" });
		} catch (error: any) {
			isShowMainLoader.value = false;
			console.error(error);
		}
	};

	onMounted(async () => {
		await getMnemonicGenerate();
		isShowMainLoader.value = false;
	});
</script>

<template>
	<div class="page">
		<div class="mnemonic">
			<h1 class="global-title-h1 mb-40">{{ $t("Generate seed phrase") }}</h1>
			<div v-if="isCloud" class="warning">
				<div class="flex flex-y-center gap-4">
					<ui-icon name="error" type="filled" color="#ff9e00" />
					<span>{{ $t("Important: You are using a trial cloud version") }}</span>
				</div>
				<span class="warning__text">
					{{
						$t(
							"Remember that DV.net is an open-source solution. The cloud version should be used only for getting acquainted with the system and for test integrations. We do not make any profit from the cloud version and are not responsible for your funds. For full independence and security, we recommend deploying it on your own server"
						)
					}}
				</span>
				<span>
					{{ $t("You can find detailed instructions and source code on our") }}
					<a href="https://github.com/dv-net" class="warning__link" target="_blank">GitHub</a>
				</span>
			</div>
			<div class="mnemonic__top">
				<ui-select v-model="countWord" :options="options" @change="getMnemonicGenerate" />
				<div class="flex flex-y-center gap-8">
					<ui-button size="xl" type="secondary" @click="isShowMnemonic = !isShowMnemonic">
						{{ $t(isShowMnemonic ? "Hide" : "Show") }}
					</ui-button>
					<ui-button size="xl" type="secondary" @click="clearMnemonic">
						{{ $t("Clear") }}
					</ui-button>
				</div>
			</div>
			<form class="mnemonic__form" @paste="handlePaste">
				<div class="mnemonic__inputs">
					<ui-input
						v-for="(word, index) in mnemonic"
						:key="index"
						:type="isShowMnemonic ? 'text' : 'password'"
						v-model="mnemonic[index]"
						class="mnemonic__input"
					>
						<template #prepend>
							<span class="mnemonic__input-index">{{ index + 1 }}.</span>
						</template>
					</ui-input>
				</div>
				<div class="flex flex-y-center flex-x-between">
					<div class="flex flex-y-center gap-20">
						<ui-button type="secondary" size="xl" @click="getMnemonicGenerate">
							{{ t("Generate mnemonics") }}
						</ui-button>
						<ui-copy-text class="mt-4" size-icon="md" color-icon="#070707" :copied-text="mnemonic.join(' ')" />
					</div>
					<ui-button size="xl" mode="neutral" @click="postProcessingRegisterOwner">
						{{ t("Confirm") }}
					</ui-button>
				</div>
			</form>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.page {
		@extend .center;
		flex-grow: 1;
		.warning {
			display: flex;
			flex-direction: column;
			gap: 8px;
			border: 1px solid #ff9e00;
			background-color: #fff3e0;
			padding: 16px;
			margin-bottom: 32px;
			border-radius: 12px;
			color: $black;
			font-weight: 500;
			font-size: 14px;
			line-height: 20px;
			&__text {
				font-size: 12px;
				font-weight: 400;
				line-height: 16px;
			}
			&__link {
				color: $blue;
				@media (hover: hover) {
					&:hover {
						text-decoration: underline;
						cursor: pointer;
					}
				}
			}
		}
		.mnemonic {
			display: flex;
			flex-direction: column;
			max-width: 700px;
			width: 100%;
			&__top {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 24px;
				margin-bottom: 24px;
				&:deep(.ui-select__wrapper) {
					width: 300px;
				}
			}
			&__form {
				display: flex;
				flex-direction: column;
				gap: 24px;
			}
			&__inputs {
				display: grid;
				grid-template-columns: repeat(4, 1fr);
				gap: 12px;
			}
			&__input {
				&-index {
					font-size: 12px;
					color: $secondary;
				}
			}
		}
	}
</style>
