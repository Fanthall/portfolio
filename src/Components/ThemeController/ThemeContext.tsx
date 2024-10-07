// ThemeContext.tsx
import { NextUIProvider } from "@nextui-org/react";
import React, { createContext, ReactNode, useEffect, useState } from "react";

interface ThemeContextProps {
	theme: "light" | "dark";
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface ThemeProviderProps {
	children: ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
	const [theme, setTheme] = useState<"light" | "dark">(
		(localStorage.getItem("theme") as "light" | "dark") || "dark"
	);

	useEffect(() => {
		localStorage.setItem("theme", theme);
		document.documentElement.className = theme;
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
	};

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			<NextUIProvider
				className={`w-full h-full flex ${theme} overflow-auto p-[50px]`}
			>
				{children}
			</NextUIProvider>
		</ThemeContext.Provider>
	);
};

export { ThemeContext, ThemeProvider };
