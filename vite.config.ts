import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(() => {
	const appName = process.env.APP_NAME;
	if (!appName) {
		console.error("\x1b[31m", "❌ Error: APP_NAME variable is not set");
		process.exit(1);
	}
	const appRoot = `apps/${appName}`;

	return {
		plugins: [vue()],
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
		build: {
			outDir: `../../dist/${appName}`,
			emptyOutDir: true
		}
	};
});
