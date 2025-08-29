<script setup lang="ts">
	import { computed, ref } from "vue";
	import { UiCopyText, UiTextarea, UiIconButton } from "@dv.net/ui-kit/dist";
	import GlobalInput from "@dv-admin/components/ui/globalInput/GlobalInput.vue";

	const props = defineProps<{ label: string; modelValue: string | undefined }>();

	const isShowModelValue = ref<boolean>(false);
	const computedModelvalue = computed(() =>
		isShowModelValue.value ? props.modelValue : props.modelValue?.replace(/./g, "*")
	);
</script>

<template>
	<global-input class="code" :title="label">
		<ui-textarea v-if="modelValue" v-model="computedModelvalue" readonly size="auto" @click.prevent>
			<template #append>
				<ui-icon-button
					@click.prevent="isShowModelValue = !isShowModelValue"
					:icon-name="isShowModelValue ? 'visibility' : 'visibility-off'"
					icon-type="400"
					icon-color="var(--color-icon-secondary)"
					no-size
					size="sm"
				/>
				<ui-copy-text :copied-text="modelValue" color-icon="#6b6d80" size-icon="sm" />
			</template>
		</ui-textarea>
	</global-input>
</template>

<style scoped lang="scss"></style>
