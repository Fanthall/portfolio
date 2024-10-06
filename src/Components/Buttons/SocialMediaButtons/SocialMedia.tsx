import React, { FunctionComponent, useContext } from "react";
import { BiLogoLinkedin } from "react-icons/bi";
import { BsGithub } from "react-icons/bs";
import { FiInstagram } from "react-icons/fi";
import { LanguageContext } from "../../LanguageController/LanguageController";

interface SocialMediaProps {
	instagram?: string;
	linkedin?: string;
	github?: string;
}
const SocialMedia: FunctionComponent<SocialMediaProps> = (props) => {
	const languageContext = useContext(LanguageContext);
	return (
		<div className="flex items-center mt-10">
			<h5 className="text-sm md:text-base mr-5 leading-none">
				{languageContext?.language === "tr" ? "Sosyal Medya:" : "Share:"}
			</h5>
			<ul className="flex space-x-4">
				{props.instagram && (
					<li>
						<a href={props.instagram}>
							<FiInstagram />
						</a>
					</li>
				)}
				{props.linkedin && (
					<li>
						<a href={props.linkedin}>
							<BiLogoLinkedin />
						</a>
					</li>
				)}
				{props.github && (
					<li>
						<a href={props.github}>
							<BsGithub />
						</a>
					</li>
				)}
			</ul>
		</div>
	);
};

export default SocialMedia;
