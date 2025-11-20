import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin } from '@tanstack/vue-query'
import { WagmiPlugin } from '@wagmi/vue'
import "@pay/assets/scss/index.scss";

import App from "./App.vue";
import router from "./router";
import { intiRequests } from "@pay/utils/helpers/init";
import i18n from "@pay/utils/plugins/i18n";
import { wagmiAdapter } from "@pay/utils/constants/connectWallet/evm.ts";

const app = createApp(App);

app.use(createPinia());
app.use(i18n);
app.use(router);
app.use(VueQueryPlugin)
if (wagmiAdapter.wagmiConfig) {
	app.use(WagmiPlugin, { config: wagmiAdapter.wagmiConfig })
}

intiRequests().then(() => app.mount("#app"));
