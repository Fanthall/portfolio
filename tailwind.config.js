const { nextui } = require("@nextui-org/react");
/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/**/*.{html,js,tsx,ts}",
		"./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				"custom-light-bg": "#dee4e7", // Light mode arka plan rengi
				"custom-dark-bg": "#212121", // Dark mode arka plan rengi
				"custom-light-text": "#333333", // Light mode yazı rengi
				"custom-dark-text": "#e0e0e0", // Dark mode yazı rengi
			},
			backgroundColor: {
				light: "var(--custom-light-bg)", // Light mode için arka plan
				dark: "var(--custom-dark-bg)", // Dark mode için arka plan
			},
			textColor: {
				light: "var(--custom-light-text)", // Light mode için yazı rengi
				dark: "var(--custom-dark-text)", // Dark mode için yazı rengi
			},
		},
	},
	darkMode: "class",
	plugins: [nextui()],
};
