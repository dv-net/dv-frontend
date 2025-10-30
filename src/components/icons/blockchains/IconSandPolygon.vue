<script setup lang="ts">
const uniqueId: string = "uniqueId-sand-polygon"
</script>

<template>
	<svg :width="24" :height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<defs>
			<linearGradient :id="`paint0_linear_${uniqueId}`" x1="5.1456" y1="4.2648" x2="20.0976" y2="21.1368" gradientUnits="userSpaceOnUse">
				<stop stop-color="#00ADEF"/>
				<stop offset="1" stop-color="#0084FF"/>
			</linearGradient>
			<linearGradient :id="`paint1_linear_${uniqueId}`" x1="13.5369" y1="15.6496" x2="21.7865" y2="20.7088" gradientUnits="userSpaceOnUse">
				<stop stop-color="#A229C5"/>
				<stop offset="1" stop-color="#7B3FE4"/>
			</linearGradient>
			<clipPath :id="`clip0_${uniqueId}`">
				<rect x="15" y="15" width="8" height="8" rx="4" fill="white"/>
			</clipPath>
			<clipPath :id="`clip1_${uniqueId}`">
				<rect width="8" height="8" fill="white" transform="translate(15 15)"/>
			</clipPath>
		</defs>
		<path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" :fill="`url(#paint0_linear_${uniqueId})`"/>
		<path d="M7.96788 5.66372L6.67188 6.95972V12.0957L7.96788 13.3917H13.1039V15.9837H10.5599V14.6877H6.67188V17.2797L7.96788 18.5757H15.6959L16.9919 17.2797V12.0957L15.6959 10.7997H10.5599V8.20772H13.1519V9.50372H17.0399V6.91172L15.7439 5.61572H7.96788V5.66372Z" fill="white"/>
		<g :clip-path="`url(#clip0_${uniqueId})`">
			<g :clip-path="`url(#clip1_${uniqueId})`">
				<path d="M19 23C21.2016 23 23 21.1984 23 19C23 16.7984 21.1984 15 19 15C16.7984 15 15 16.8016 15 19C15 21.2016 16.8016 23 19 23Z" :fill="`url(#paint1_linear_${uniqueId})`"/>
				<path d="M20.1583 19.864L21.2911 19.2112C21.3519 19.176 21.3871 19.112 21.3871 19.0416V17.736C21.3871 17.6656 21.3487 17.6016 21.2911 17.5664L20.1583 16.9136C20.0975 16.8784 20.0239 16.8784 19.9631 16.9136L18.8303 17.5664C18.7695 17.6016 18.7343 17.6656 18.7343 17.736V20.072L17.9407 20.5296L17.1471 20.072V19.1568L17.9407 18.6992L18.4655 19V18.3856L18.0399 18.1392C18.0111 18.1232 17.9759 18.1136 17.9439 18.1136C17.9087 18.1136 17.8767 18.1232 17.8479 18.1392L16.7151 18.792C16.6543 18.8272 16.6191 18.8912 16.6191 18.9616V20.2672C16.6191 20.3376 16.6575 20.4016 16.7151 20.4368L17.8479 21.0896C17.9087 21.1248 17.9823 21.1248 18.0431 21.0896L19.1759 20.4368C19.2367 20.4016 19.2719 20.3376 19.2719 20.2672V17.9312L19.2847 17.9216L20.0655 17.4704L20.8591 17.928V18.8432L20.0655 19.3008L19.5439 19V19.6144L19.9695 19.8608C20.0303 19.896 20.1039 19.896 20.1647 19.8608L20.1583 19.864Z" fill="white"/>
			</g>
		</g>
		<rect x="14.5" y="14.5" width="9" height="9" rx="4.5" stroke="white"/>
	</svg>
</template>
