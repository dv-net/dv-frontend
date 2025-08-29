<script setup lang="ts">
	import notFoundAvif from "@dv-admin/assets/images/notFound/1.avif";
	import notFoundWebp from "@dv-admin/assets/images/notFound/1.webp";
</script>

<template>
	<div class="notfound">
		<picture>
			<source :srcset="notFoundAvif" type="image/avif" />
			<source :srcset="notFoundWebp" type="image/webp" />
			<img :src="notFoundWebp" alt="not found" loading="lazy" />
		</picture>
		<h3 class="notfound__title global-title-h3">{{ $t("Nothing found matching your data") }}</h3>
	</div>
</template>

<style scoped lang="scss">
	.notfound {
		display: flex;
		flex-direction: column;
		align-items: center;
		&__title {
			max-width: 480px;
			width: 100%;
			text-align: center;
		}
		img {
			width: 200px;
		}
	}
</style>
