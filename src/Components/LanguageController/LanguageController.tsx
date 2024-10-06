// LanguageController.tsx
import React, { createContext, ReactNode, useEffect, useState } from "react";

interface LanguageContextProps {
	language: "tr" | "en";
	toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(
	undefined
);

interface LanguageProviderProps {
	children: ReactNode;
}

const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
	const [language, setLanguage] = useState<"tr" | "en">(
		(localStorage.getItem("language") as "tr" | "en") || "en"
	);

	useEffect(() => {
		localStorage.setItem("language", language);
	}, [language]);

	const toggleLanguage = () => {
		setLanguage((prevLanguage) => (prevLanguage === "tr" ? "en" : "tr"));
	};

	return (
		<LanguageContext.Provider value={{ language, toggleLanguage }}>
			{children}
		</LanguageContext.Provider>
	);
};

export { LanguageContext, LanguageProvider };
