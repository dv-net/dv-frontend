<script setup lang="ts">
const uniqueId: string = "uniqueId-sand-ethereum"
</script>

<template>
	<svg :width="24" :height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<defs>
			<linearGradient :id="`paint0_linear_${uniqueId}`" x1="5.1456" y1="4.2648" x2="20.0976" y2="21.1368" gradientUnits="userSpaceOnUse">
				<stop stop-color="#00ADEF"/>
				<stop offset="1" stop-color="#0084FF"/>
			</linearGradient>
		</defs>
		<path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" :fill="`url(#paint0_linear_${uniqueId})`"/>
		<path d="M7.96788 5.66372L6.67188 6.95972V12.0957L7.96788 13.3917H13.1039V15.9837H10.5599V14.6877H6.67188V17.2797L7.96788 18.5757H15.6959L16.9919 17.2797V12.0957L15.6959 10.7997H10.5599V8.20772H13.1519V9.50372H17.0399V6.91172L15.7439 5.61572H7.96788V5.66372Z" fill="white"/>
		<rect x="14.5" y="14.5" width="9" height="9" rx="4.5" stroke="white"/>
		<circle cx="19" cy="19" r="4" fill="#EDEFF1"/>
		<path d="M17.334 19.0494L19.0002 20.017V18.3053V16.3333L17.334 19.0494Z" fill="#898989"/>
		<path d="M19 16.3333V18.3053V20.017L20.6662 19.0494L19 16.3333Z" fill="#323232"/>
		<path d="M19 18.3057L20.6657 19.0495L19 20.0168V18.3057Z" fill="#141414"/>
		<path d="M19.0002 18.3054L19.0007 18.3056V20.0166L19.0002 20.0171L17.334 19.0495L19.0002 18.3054Z" fill="#373737"/>
		<path d="M17.334 19.3599L19.0002 21.6666V20.327L17.334 19.3599Z" fill="#898989"/>
		<path d="M19 20.327V21.6666L20.6672 19.3599L19 20.327Z" fill="#323232"/>
	</svg>
</template>
