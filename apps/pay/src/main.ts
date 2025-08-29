import { createApp } from "vue";
import { createPinia } from "pinia";
import "@pay/assets/scss/index.scss";

import App from "./App.vue";
import router from "./router";
import { intiRequests } from "@pay/utils/helpers/init";
import i18n from "@pay/utils/plugins/i18n";

const app = createApp(App);

app.use(createPinia());
app.use(i18n);
app.use(router);

intiRequests().then(() => app.mount("#app"));
