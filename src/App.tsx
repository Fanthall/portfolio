import { Spinner } from "@nextui-org/react";
import React, { FunctionComponent, useEffect } from "react";
import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
	RouterProvider,
} from "react-router-dom";
import Layout from "./Layout";
import { About, Career, Contacts, Main, Projects } from "./Pages";

const App: FunctionComponent = () => {
	useEffect(() => {
		const update = (theme: string) => {
			const favicon = document.getElementById("favicon") as HTMLLinkElement;
			if (favicon) {
				favicon.href =
					theme === "dark"
						? "./logoDark/favicon.ico" // Karanlık tema için favicon
						: "./logoLight/favicon.ico"; // Açık tema için favicon
			}
			const appleTouchIcon = document.getElementById(
				"apple-touch-icon"
			) as HTMLLinkElement;
			if (appleTouchIcon) {
				appleTouchIcon.href =
					theme === "dark"
						? "./logoDark/apple-touch-icon.png" // Karanlık tema için favicon
						: "./logoLight/apple-touch-icon.png"; // Açık tema için favicon
			}
			const metaThemeColor = document.querySelector(
				"meta[name=theme-color]"
			);
			if (metaThemeColor) {
				metaThemeColor.setAttribute(
					"content",
					theme === "dark" ? "#000000" : "#ffffff"
				);
			}
		};
		const handle = (event: any) => {
			const newColorScheme = event.matches ? "dark" : "light";
			update(newColorScheme);
		};
		update(
			window.matchMedia &&
				window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light"
		);
		window
			.matchMedia("(prefers-color-scheme: dark)")
			.addEventListener("change", handle);
		return () => {
			window
				.matchMedia("(prefers-color-scheme: dark)")
				.removeEventListener("change", handle);
		};
	}, []);
	const router = createBrowserRouter(
		createRoutesFromElements(
			<Route element={<Layout />}>
				<Route index element={<Main />}></Route>
				<Route path="about" element={<About />}></Route>
				<Route path="career" element={<Career />}></Route>
				<Route path="projects" element={<Projects />}></Route>
				<Route path="contact" element={<Contacts />}></Route>v
			</Route>
		)
	);
	return <RouterProvider router={router} fallbackElement={<Spinner />} />;
};

export default App;
