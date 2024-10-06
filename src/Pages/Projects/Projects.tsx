import { Image } from "@nextui-org/react";
import React, { FunctionComponent } from "react";
import building from "./../../Assets/building.png";
interface ProjectsProps {}
const Projects: FunctionComponent<ProjectsProps> = (props) => {
	return (
		<div className="w-full flex flex-col justify-center items-center">
			<div className="w-full flex flex-row justify-center items-center text-3xl font-semibold">
				Page is building...
			</div>
			<Image removeWrapper src={building} className="w-fit" />
		</div>
	);
};

export default Projects;
