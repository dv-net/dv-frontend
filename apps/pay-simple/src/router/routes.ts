import type { RouteRecordRaw } from "vue-router";
import payerFormInvoice from "@pay-simple/router/modules/payerFormInvoice.ts";
import notFound from "@pay-simple/router/modules/notFound.ts";

export const routes: Array<RouteRecordRaw> = [...payerFormInvoice, ...notFound];
