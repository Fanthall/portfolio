import { Image } from "@nextui-org/react";
import React, { FunctionComponent } from "react";

interface ImageContainerProps {
	image: string;
	title?: string;
	alt?: string;
	width?: number;
	height?: number;
	radius?: "sm" | "md" | "lg" | "none" | "full";
	containerClassName?: string;

	imageClassName?: string;
	containerStyle?: React.CSSProperties;
	imageStyle?: React.CSSProperties;
}
const ImageContainer: FunctionComponent<ImageContainerProps> = (props) => {
	return (
		<div
			className={`inline-block md:block leading-none drop-shadow-thumb relative 
        sm:before:absolute sm:before:bottom-[-20px] lg:before:bottom-[-45px] sm:before:right-[-25px] 
        sm:before:border-2 sm:before:border-default-400 sm:before:h-full sm:before:w-[calc(100%-20px)] sm:before:rounded-br-3xl ${props.containerClassName}`}
			style={props.containerStyle}
		>
			<Image
				src={props.image}
				width={props.width ?? 300}
				height={props.height ?? 400}
				radius={props.radius ?? "sm"}
				title={props.title}
				alt={props.alt}
				style={props.imageStyle}
				className={props.imageClassName}
			/>
		</div>
	);
};

export default ImageContainer;
