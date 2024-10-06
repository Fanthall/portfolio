import { Button, Tooltip } from "@nextui-org/react";
import React, { FunctionComponent, useContext } from "react";
import { IoLanguage } from "react-icons/io5";
import { LanguageContext } from "../../LanguageController/LanguageController";
interface LanguageToggleProps {
	className?: string;
	size?: "sm" | "md" | "lg";
}
const LanguageChange: FunctionComponent<LanguageToggleProps> = (props) => {
	const languageContext = useContext(LanguageContext);

	if (!languageContext) {
		throw new Error("LanguageContext must be used within a LanguageProvider");
	}

	const { toggleLanguage } = languageContext;

	return (
		<Tooltip placement="bottom" content={"TR/EN"}>
			<Button
				isIconOnly
				variant="light"
				size={props.size ?? "md"}
				className="w-fit px-2"
				onClick={() => {
					toggleLanguage();
				}}
				startContent={<IoLanguage />}
			>
				|{languageContext.language.toUpperCase()}
			</Button>
		</Tooltip>
	);
};

export default LanguageChange;
