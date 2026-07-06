import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig(() => {
	const appName = process.env.APP_NAME;
	const __CACHES_NAME__ = "api";

	if (!appName) {
		console.error("Error: APP_NAME variable is not set");
		process.exit(1);
	}

	const appRoot = `apps/${appName}`;

	return {
		plugins: [
			vueDevTools(),
			vue(),
			{
				name: "inject-env-html",
				transformIndexHtml(html: string) {
					return html.replace(/__CACHES_NAME__/g, "" + __CACHES_NAME__);
				}
			}
		],
		resolve: {
			alias: {
				"@shared": fileURLToPath(new URL("./src", import.meta.url)),
				"@dv-admin": fileURLToPath(new URL(`./apps/dv-admin/src`, import.meta.url)),
				"@pay": fileURLToPath(new URL(`./apps/pay/src`, import.meta.url)),
				"@apps": fileURLToPath(new URL("./apps", import.meta.url))
			}
		},
		server: {
			port: 3333,
			open: `/${appName}/`
		},
		root: appRoot,
		base: appName,
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: `
						@use "@apps/${appName}/src/assets/scss/additional/vars" as *;
						@use "@shared/assets/scss/additional/media" as *;
						@use "@shared/assets/scss/additional/generate-classes" as *;
					`,
					api: "modern-compiler"
				}
			}
		},
		define: { __CACHES_NAME__: JSON.stringify(__CACHES_NAME__) },
		build: {
			outDir: `../../dist/${appName}`,
			emptyOutDir: true,
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (id.includes("node_modules")) {
							return id.toString().split("node_modules/")[1].split("/")[0].toString();
						}
					}
				}
			}
		}
	};
});
