import type { Component } from "vue";

export interface IUiSelectOptions {
	value: string;
	label: string;
}

export interface IUBlockTitleLinks {
	path: string;
	title: string;
}

export interface ISettingsItem {
	icon: Component;
	id: number;
	title: string;
	text: string;
	textBtn: string;
	path: string;
	isShow: boolean;
	isDisabled?: boolean;
}
