import React, { FunctionComponent } from "react";

interface SectionTitleProps {
	title: string;
	className?: string;
	style?: React.CSSProperties;
}
const SectionTitle: FunctionComponent<SectionTitleProps> = (props) => {
	return (
		<h2
			className={`text-3xl font-heading tracking-normal text-dark pb-4 
            relative before:absolute before:left-0 before:bottom-0 
            before:h-[5px] before:w-[55px] before:bg-black dark:before:bg-white after:absolute 
            after:left-0 after:bottom-[2px] after:h-[1px] after:w-[255px] after:bg-black dark:after:bg-white ${props.className}`}
			style={props.style}
		>
			{props.title}
		</h2>
	);
};

export default SectionTitle;
