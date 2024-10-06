import React, { FunctionComponent, ReactNode } from "react";

interface AboutPanelsProps {
	icon: ReactNode;
	title: ReactNode;
	content: ReactNode;
	className?: string;
	style?: React.CSSProperties;
}
const AboutPanels: FunctionComponent<AboutPanelsProps> = (props) => {
	return (
		<div
			className={`basis-12/12 md:basis-6/12 xl:basis-3/12 service group relative flex px-3 py-5 rounded-md duration-300 before:absolute before:left-7 before:top-14 
                before:h-[calc(100%-80px)] before:w-[1px] before:bg-gray-300 
                after:absolute after:left-6 after:bottom-4 after:h-[10px] 
                after:w-[10px] after:rounded-full after:bg-gray-300 ${props.className}`}
			style={props.style}
		>
			<div className="mr-4 relative flex-shrink-0 self-start w-[50px] md:w-auto ">
				<div className="w-full">{props.icon}</div>
			</div>
			<div>
				<h2 className="font-semibold text-base mb-3">{props.title}</h2>
				<p>{props.content}</p>
			</div>
		</div>
	);
};

export default AboutPanels;
