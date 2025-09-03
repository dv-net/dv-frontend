import pluginVue from "eslint-plugin-vue";
import vueTsEslintConfig from "@vue/eslint-config-typescript";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";

export default [
	{
		name: "app/files-to-lint",
		files: ["**/*.{ts,mts,tsx,vue}"]
	},

	{
		name: "app/files-to-ignore",
		ignores: ["**/dist/**", "**/dist-ssr/**", "**/coverage/**"]
	},

	...pluginVue.configs["flat/essential"],
	...vueTsEslintConfig(),
	skipFormatting,

	{
		name: "app/rules",
		rules: {
			"no-useless-catch": "off",
			"vue/multi-word-component-names": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unused-expressions": "off"
		}
	}
];
