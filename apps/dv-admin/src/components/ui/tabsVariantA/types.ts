import type { Component } from "vue";

export interface TabsVariantAItem<T extends string = string> {
	value: T;
	name: string;
	icon?: string | Component;
	iconProps?: Record<string, unknown>;
	disabled?: boolean;
}
