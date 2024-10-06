import { Spinner } from "@nextui-org/react";
import React, {
	FunctionComponent,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { FaJava, FaReact } from "react-icons/fa";
import {
	IoExtensionPuzzleOutline,
	IoGameControllerOutline,
} from "react-icons/io5";
import { ImageContainer, SectionTitle, SocialMedia } from "../../Components";
import { LanguageContext } from "../../Components/LanguageController/LanguageController";
import AboutPanels from "../../Components/Panels/AboutPanels";
import getData, { AboutInterface, SocialsInterface } from "../../Data/data";
import sezer from "./../../Assets/sezer.png";
interface AboutProps {}
const About: FunctionComponent<AboutProps> = (props) => {
	const languageContext = useContext(LanguageContext);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [panels, setPanels] = useState<
		{
			title: ReactNode;
			content: ReactNode;
			icon: ReactNode;
			className?: string;
			style?: React.CSSProperties;
		}[]
	>([]);
	const [aboutData, setAboutData] = useState<
		| {
				about: AboutInterface;
				aboutTitle: AboutInterface;
		  }
		| undefined
	>(undefined);
	const [socials, setSocials] = useState<SocialsInterface | undefined>(
		undefined
	);
	const [loading, setLoading] = useState<boolean>(true);
	useEffect(() => {
		setLoading(true);
		const data = getData(languageContext?.language!);
		setAboutData({ about: data.about, aboutTitle: data.aboutTitle });
		setSocials(data.socials);
		setLoading(false);
	}, [languageContext?.language]);

	useEffect(() => {
		setLoading(true);
		setPanels([
			{
				icon: <FaReact size={30} />,
				title: aboutData?.aboutTitle.frontEnd,
				content: aboutData?.about.frontEnd,
			},
			{
				icon: <FaJava size={30} />,
				title: aboutData?.aboutTitle.backEnd,
				content: aboutData?.about.backEnd,
			},
			{
				icon: <IoGameControllerOutline size={30} />,
				title: aboutData?.aboutTitle.game,
				content: aboutData?.about.game,
			},
			{
				icon: <IoExtensionPuzzleOutline size={30} />,
				title: aboutData?.aboutTitle.hobby,
				content: aboutData?.about.hobby,
			},
		]);
		setTimeout(() => {
			setLoading(false);
		}, 1000);
	}, [aboutData]);
	return (
		<div className="flex flex-col justify-start items-start">
			{loading ? (
				<Spinner />
			) : (
				<>
					<div className="w-full h-full flex-wrap flex flex-row justify-start items-center pt-48 mb-40">
						<div className="w-full xl:w-[50%] h-full flex flex-col justify-start items-center relative dark:text-stone-400 text-stone-900">
							<ImageContainer
								image={sezer}
								width={300}
								height={400}
								radius="sm"
								title="Sezer Demir DEDEK"
								alt="Sezer Demir DEDEK"
							/>
						</div>
						<div className="w-[90%] xl:w-[40%] h-full flex flex-col justify-start items-start mt-10 xs:mt-0">
							<div className="mb-12 block font-semibold">
								<SectionTitle title={aboutData?.aboutTitle.main!} />
							</div>
							<div className="flex flex-col justify-around items-center">
								<p>{aboutData?.about.main}</p>
							</div>
							<SocialMedia
								instagram={socials?.instagram}
								linkedin={socials?.linkedin}
								github={socials?.github}
							/>
						</div>
					</div>
					<div className="w-[90%] flex flex-row justify-center items-start flex-wrap bg-transparent">
						{panels.map((item, index) => {
							return (
								<AboutPanels
									icon={item.icon}
									title={item.title}
									content={item.content}
									className={"text-sm md:text-base"}
									key={item.title + "-" + index}
								/>
							);
						})}
					</div>
				</>
			)}
		</div>
	);
};

export default About;
