<script setup lang="ts">
const uniqueId: string = "uniqueId-pol-polygon"
</script>

<template>
	<svg :width="24" :height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<defs>
			<linearGradient
				:id="`paint0_linear_${uniqueId}`"
				x1="-4.38944"
				y1="1.94891"
				x2="20.3594"
				y2="17.1265"
				gradientUnits="userSpaceOnUse"
			>
				<stop stop-color="#A229C5" />
				<stop offset="1" stop-color="#7B3FE4" />
			</linearGradient>
			<clipPath :id="`clip0_${uniqueId}`">
				<rect width="24" height="24" fill="white" />
			</clipPath>
			<clipPath :id="`clip1_${uniqueId}`">
				<rect width="24" height="24" fill="white" />
			</clipPath>
		</defs>
		<g :clip-path="`url(#clip0_${uniqueId})`">
			<g :clip-path="`url(#clip1_${uniqueId})`">
				<path
					d="M12 24C18.6048 24 24 18.5952 24 12C24 5.3952 18.5952 0 12 0C5.3952 0 0 5.4048 0 12C0 18.6048 5.4048 24 12 24Z"
					:fill="`url(#paint0_linear_${uniqueId})`"
				/>
				<path
					d="M15.475 14.592L18.8734 12.6336C19.0558 12.528 19.1614 12.336 19.1614 12.1248V8.20802C19.1614 7.99682 19.0462 7.80482 18.8734 7.69922L15.475 5.74082C15.2926 5.63522 15.0718 5.63522 14.8894 5.74082L11.491 7.69922C11.3086 7.80482 11.203 7.99682 11.203 8.20802V15.216L8.82222 16.5888L6.44142 15.216V12.4704L8.82222 11.0976L10.3966 12V10.1568L9.11982 9.41762C9.03342 9.36962 8.92782 9.34082 8.83182 9.34082C8.72622 9.34082 8.63022 9.36962 8.54382 9.41762L5.14542 11.376C4.96302 11.4816 4.85742 11.6736 4.85742 11.8848V15.8016C4.85742 16.0128 4.97262 16.2048 5.14542 16.3104L8.54382 18.2688C8.72622 18.3744 8.94702 18.3744 9.12942 18.2688L12.5278 16.3104C12.7102 16.2048 12.8158 16.0128 12.8158 15.8016V8.79362L12.8542 8.76482L15.1966 7.41122L17.5774 8.78402V11.5296L15.1966 12.9024L13.6318 12V13.8432L14.9086 14.5824C15.091 14.688 15.3118 14.688 15.4942 14.5824L15.475 14.592Z"
					fill="white"
				/>
			</g>
		</g>
	</svg>
</template>

