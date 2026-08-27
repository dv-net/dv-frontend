import type { RouteRecordRaw } from "vue-router";
import payerFormWallet from "@pay/router/modules/payerFormWallet.ts";
import payerFormStore from "@pay/router/modules/payerFormStore.ts";
import refund from "@pay/router/modules/refund.ts";
import notFound from "@pay/router/modules/notFound.ts";

export const routes: Array<RouteRecordRaw> = [...payerFormWallet, ...payerFormStore, ...refund, ...notFound];
