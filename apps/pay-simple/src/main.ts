import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { WagmiPlugin } from "@wagmi/vue";
import "@pay-simple/assets/scss/index.scss";

import App from "./App.vue";
import router from "./router";
import i18n from "@pay-simple/utils/libs/i18n";
import { loadLocaleMessages } from "@pay-simple/utils/libs/i18n/helpers";
import { wagmiAdapter } from "@pay-shared/utils/constants/connectWallet/evm.ts";

const app = createApp(App);

app.use(createPinia());
app.use(i18n);
app.use(router);
app.use(VueQueryPlugin);
if (wagmiAdapter.wagmiConfig) {
	app.use(WagmiPlugin, { config: wagmiAdapter.wagmiConfig });
}

(async () => {
	try {
		await router.isReady();
		await loadLocaleMessages(i18n.global.locale.value);
	} catch (error: any) {
		console.error(error);
	}
	app.mount("#app");
})();
