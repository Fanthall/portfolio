import { Switch } from "@nextui-org/react";
import React, { FunctionComponent, useContext } from "react";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import { ThemeContext } from "../../ThemeController/ThemeContext";

interface ThemeToggleProps {
	className?: string;
	size?: "sm" | "md" | "lg";
}
const ThemeToggle: FunctionComponent<ThemeToggleProps> = (props) => {
	const themeContext = useContext(ThemeContext);

	if (!themeContext) {
		throw new Error("ThemeContext must be used within a ThemeProvider");
	}

	const { toggleTheme } = themeContext;

	return (
		<Switch
			defaultSelected
			isSelected={themeContext.theme === "light"}
			className={`${props.className}`}
			size={props.size ?? "md"}
			color="primary"
			thumbIcon={({ isSelected, className }) =>
				isSelected ? (
					<MdOutlineLightMode className={className} size={22} />
				) : (
					<MdOutlineDarkMode className={className} size={22} />
				)
			}
			onValueChange={toggleTheme}
		/>
	);
};

export default ThemeToggle;
