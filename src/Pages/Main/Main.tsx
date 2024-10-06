import { Spinner } from "@nextui-org/react";
import React, {
	FunctionComponent,
	useContext,
	useEffect,
	useState,
} from "react";
import { ImageContainer } from "../../Components";
import { LanguageContext } from "../../Components/LanguageController/LanguageController";
import getData, { MainInterface } from "../../Data/data";
import sezer from "./../../Assets/sezer.png";
interface MainProps {}
const Main: FunctionComponent<MainProps> = (props) => {
	const languageContext = useContext(LanguageContext);
	const [mainData, setMainData] = useState<MainInterface | undefined>(
		undefined
	);
	const [loading, setLoading] = useState<boolean>(true);
	useEffect(() => {
		setLoading(true);
		const data = getData(languageContext?.language!);
		setMainData(data.mainTitles);
		setLoading(false);
	}, [languageContext?.language]);
	return (
		<div className="w-full h-[500px] flex flex-col-reverse md:flex-row justify-start items-center ">
			{loading ? (
				<Spinner />
			) : (
				<>
					<div className="w-full md:w-[50%] h-full text-2xl md:text-3xl flex flex-col justify-end items-center relative dark:text-stone-400 text-stone-900 font-semibold">
						<div className="w-fit">{mainData?.mainTitle}</div>
						<div className="text-lg md:text-xl">
							{mainData?.mainSubTitle}
						</div>
					</div>
					<div className="w-full md:w-[50%] mt-6 md:mt-0 h-full flex flex-col justify-end items-center">
						<ImageContainer
							image={sezer}
							width={300}
							height={400}
							radius="sm"
							title="Sezer Demir DEDEK"
							alt="Sezer Demir DEDEK"
						/>
					</div>
				</>
			)}
		</div>
	);
};

export default Main;
