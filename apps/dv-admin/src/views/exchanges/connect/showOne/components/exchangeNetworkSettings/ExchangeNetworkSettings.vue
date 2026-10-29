<script setup lang="ts">
	import { computed, ref, watch } from "vue";
	import { storeToRefs } from "pinia";
	import { useI18n } from "vue-i18n";
	import { UiButton, UiForm, UiFormItem, UiIcon, UiInput, UiSelect, UiSkeleton, UiTooltip } from "@dv.net/ui-kit";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { useWithdrawalStore } from "@dv-admin/stores/withdrawal";
	import {
		getApiExchangeNetworkInterfaces,
		getApiExchangeNetworkSettings,
		putApiExchangeNetworkSettings
	} from "@dv-admin/utils/services/exchangeSettings";
	import type { IUiSelectOptions } from "@dv-admin/utils/types/general";
	import type {
		ExchangeSlugType,
		IExchangeNetworkInterface,
		IExchangeNetworkSettings,
		IExchangeNetworkSettingsRequest
	} from "@dv-admin/utils/types/api/apiGo";
	import type { IUiFormInstance } from "./types";

	const PROXY_SCHEMES = new Set(["http:", "https:", "socks5:", "socks5h:"]);
	const INVALID_PROXY_MESSAGE =
		"invalid proxy url: expected scheme://[user:password@]host:port with scheme http, https, socks5 or socks5h";

	const { slug } = defineProps<{ slug: ExchangeSlugType }>();

	const { t } = useI18n();
	const { connectedExchanges } = storeToRefs(useWithdrawalStore());

	const formRef = ref<IUiFormInstance | null>(null);
	const isOpen = ref(false);
	const isLoading = ref(false);
	const isSaving = ref(false);
	const interfacesLoaded = ref(false);
	const settingsLoaded = ref(false);
	const form = ref<IExchangeNetworkSettingsRequest>({ proxy_url: null, network_interface: null });
	const savedForm = ref<IExchangeNetworkSettingsRequest>({ proxy_url: null, network_interface: null });
	const interfaces = ref<IExchangeNetworkInterface[]>([]);
	const defaultInterface = ref("");

	const isExchangeConnected = computed(() => connectedExchanges.value.some((item) => item.slug === slug));

	const interfacePlaceholder = computed(() => {
		if (!defaultInterface.value) return t("System default route");
		return `${t("System default route")} (${defaultInterface.value})`;
	});

	const isProxyUrlValid = (value: string) => {
		try {
			const url = new URL(value);
			if (!PROXY_SCHEMES.has(url.protocol)) return false;
			if (!url.hostname || !url.port) return false;
			if ((url.pathname && url.pathname !== "/") || url.search || url.hash) return false;
			return true;
		} catch {
			return false;
		}
	};

	const emptyToNull = (value: string | null | undefined) => {
		const trimmed = value?.trim() ?? "";
		return trimmed || null;
	};

	const isDirty = computed(
		() =>
			emptyToNull(form.value.proxy_url) !== emptyToNull(savedForm.value.proxy_url) ||
			emptyToNull(form.value.network_interface) !== emptyToNull(savedForm.value.network_interface)
	);

	const interfaceOptions = computed<IUiSelectOptions[]>(() => {
		const options = interfaces.value.map((item) => {
			const ips = item.addresses.map((address) => address.ip).join(", ");
			return { value: item.name, label: ips ? `${item.name} (${ips})` : item.name };
		});
		if (form.value.network_interface && !options.some((option) => option.value === form.value.network_interface)) {
			options.push({ value: form.value.network_interface, label: form.value.network_interface });
		}
		return options;
	});

	const interfaceError = computed(() => {
		const name = form.value.network_interface;
		if (!name || interfaces.value.some((item) => item.name === name)) return "";
		return t("The saved network interface is no longer on the server");
	});

	const rules = computed<UiFormRules>(() => ({
		proxy_url: [
			{
				validator: () => {
					const proxy = emptyToNull(form.value.proxy_url);
					return !proxy || isProxyUrlValid(proxy);
				},
				message: t(INVALID_PROXY_MESSAGE)
			},
			{ max: 2048, message: t("Maximum 2048 characters") }
		],
		network_interface: [
			{
				validator: () => !interfaceError.value,
				message: t("The saved network interface is no longer on the server")
			}
		]
	}));

	const applySettings = (data: IExchangeNetworkSettings) => {
		form.value.proxy_url = data.proxy_url;
		form.value.network_interface = data.network_interface;
		savedForm.value = {
			proxy_url: data.proxy_url,
			network_interface: data.network_interface
		};
	};

	const loadInterfaces = async () => {
		if (interfacesLoaded.value) return;
		const data = await getApiExchangeNetworkInterfaces();
		interfaces.value = data.interfaces ?? [];
		defaultInterface.value = data.default ?? "";
		interfacesLoaded.value = true;
	};

	const loadSettings = async () => {
		if (!isExchangeConnected.value || settingsLoaded.value) return;
		const data = await getApiExchangeNetworkSettings(slug);
		applySettings(data);
		settingsLoaded.value = true;
	};

	const load = async () => {
		try {
			isLoading.value = true;
			await Promise.all([loadInterfaces(), loadSettings()]);
		} catch (error) {
			console.error(error);
		} finally {
			isLoading.value = false;
		}
	};

	const toggle = async () => {
		isOpen.value = !isOpen.value;
		if (isOpen.value) await load();
	};

	const save = async () => {
		if (!isExchangeConnected.value || isSaving.value || !settingsLoaded.value || !isDirty.value) return;
		if (formRef.value?.validate() !== true) return;
		const proxy = emptyToNull(form.value.proxy_url);
		try {
			isSaving.value = true;
			const data = await putApiExchangeNetworkSettings(slug, {
				proxy_url: proxy,
				network_interface: emptyToNull(form.value.network_interface)
			});
			applySettings(data);
			settingsLoaded.value = true;
		} catch (error) {
			console.error(error);
		} finally {
			isSaving.value = false;
		}
	};

	watch(isExchangeConnected, (connected) => {
		if (!connected) {
			settingsLoaded.value = false;
			return;
		}
		if (isOpen.value) void load();
	});
</script>

<template>
	<div class="advanced" :class="{ 'is-open': isOpen }">
		<button type="button" class="advanced__toggle" :aria-expanded="isOpen" @click="toggle">
			<span class="advanced__toggle-text">
				<span class="advanced__title">{{ $t("Advanced settings") }}</span>
				<span class="advanced__subtitle">{{ $t("Proxy or VPN for this exchange") }}</span>
			</span>
			<span class="advanced__chevron">
				<span class="advanced__chevron-icon" :class="{ 'is-open': isOpen }">
					<ui-icon type="400" name="keyboard-arrow-down" size="lg" color="#1968e5" />
				</span>
			</span>
		</button>
		<div class="advanced__panel" :class="{ 'is-open': isOpen }" :inert="!isOpen">
			<div class="advanced__panel-inner">
				<div class="advanced__body">
					<ui-skeleton
						v-if="isLoading && !interfacesLoaded && !settingsLoaded"
						:rows="2"
						:row-height="56"
						:rows-gap="24"
						:item-border-radius="8"
					/>
					<template v-else>
						<p v-if="!isExchangeConnected" class="advanced__hint">
							{{ $t("Connect the crypto exchange before changing the proxy or VPN") }}
						</p>
						<ui-form ref="formRef" class="advanced__form" :model="form" :rules="rules" @submit.prevent="save">
							<div class="advanced__field">
								<div class="advanced__label">
									<span>{{ $t("Proxy") }}</span>
									<ui-tooltip
										class="flex flex-y-start"
										mode="dark"
										position="top-start"
										is-gold-title
										:title="$t('Proxy')"
										:text="$t('Exchange proxy tooltip')"
									>
										<ui-icon type="400" name="help" />
									</ui-tooltip>
								</div>
								<ui-form-item name="proxy_url">
									<ui-input
										v-model="form.proxy_url"
										size="lg"
										filled
										is-empty-value-null
										:disabled="!isExchangeConnected || isLoading"
										placeholder="socks5://user:password@host:port"
									/>
								</ui-form-item>
							</div>
							<div class="advanced__field">
								<div class="advanced__label">
									<span>{{ $t("Interface") }}</span>
									<ui-tooltip
										class="flex flex-y-start"
										mode="dark"
										position="top-start"
										is-gold-title
										:title="$t('VPN or network interface')"
										:text="$t('Exchange network interface tooltip')"
									>
										<ui-icon type="400" name="help" />
									</ui-tooltip>
								</div>
								<ui-form-item name="network_interface" :error="interfaceError">
									<ui-select
										v-model="form.network_interface"
										:options="interfaceOptions"
										:placeholder="interfacePlaceholder"
										:disabled="!isExchangeConnected || isLoading"
										size="lg"
										filled
										clearable
										type="default"
									/>
								</ui-form-item>
							</div>
							<div class="advanced__actions">
								<ui-button
									mode="neutral"
									size="xl"
									native-type="submit"
									left-icon-name="check-circle"
									left-icon-type="400"
									left-icon-size="lg"
									:loading="isSaving"
									:disabled="!isExchangeConnected || isLoading || !settingsLoaded || !isDirty"
								>
									{{ $t("Save") }}
								</ui-button>
							</div>
						</ui-form>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.advanced {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border: 1px solid $grey;
		border-radius: 12px;
		&__toggle {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16px;
			width: 100%;
			padding: 12px 12px 12px 16px;
			border: none;
			background: none;
			cursor: pointer;
			text-align: left;
			&:focus {
				outline: none;
			}
			&:focus-visible {
				outline: 2px solid $blue;
				outline-offset: -2px;
			}
		}
		&__toggle-text {
			display: flex;
			flex-direction: column;
			gap: 2px;
		}
		&__title {
			color: $black;
			font-size: 16px;
			font-weight: 600;
			line-height: 24px;
		}
		&__subtitle {
			color: $secondary;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
		}
		&__chevron {
			display: flex;
			flex-shrink: 0;
			align-items: center;
			justify-content: center;
			width: 32px;
			height: 32px;
			border-radius: 8px;
			background: $blue-opacity;
			color: $blue;
		}
		&__chevron-icon {
			display: flex;
			transition: transform 0.28s ease;
			&.is-open {
				transform: rotate(180deg);
			}
		}
		&__panel {
			display: grid;
			grid-template-rows: 0fr;
			opacity: 0;
			transition:
				grid-template-rows 0.28s ease,
				opacity 0.2s ease;
			&.is-open {
				grid-template-rows: 1fr;
				opacity: 1;
			}
		}
		&__panel-inner {
			overflow: hidden;
		}
		&__body {
			display: flex;
			flex-direction: column;
			gap: 8px;
			padding: 4px 16px 16px;
		}
		&__form {
			display: flex;
			flex-direction: column;
			gap: 8px;
		}
		&__hint {
			color: $secondary;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
		}
		&__field {
			display: grid;
			grid-template-columns: 200px 1fr;
			gap: 55px;
		}
		&__label {
			display: flex;
			gap: 4px;
			color: $secondary;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
		}
		&__actions {
			display: flex;
			justify-content: flex-end;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.advanced__chevron-icon,
		.advanced__panel {
			transition: none;
		}
	}
</style>
