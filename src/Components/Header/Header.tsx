import { Button, Image, Spinner } from "@nextui-org/react";
import React, {
	FunctionComponent,
	useContext,
	useEffect,
	useState,
} from "react";
import { useNavigate } from "react-router-dom";
import getData, { PageHeaderInterface } from "../../Data/data";
import LanguageChange from "../Buttons/LanguageChange/LanguageChange";
import ThemeToggle from "../Buttons/ThemeToggle/ThemeToggle";
import { LanguageContext } from "../LanguageController/LanguageController";
import { ThemeContext } from "../ThemeController/ThemeContext";
interface HeaderProps {}
const Header: FunctionComponent<HeaderProps> = () => {
	const navigate = useNavigate();
	const themeContext = useContext(ThemeContext);
	const languageContext = useContext(LanguageContext);
	const [pageData, setPageData] = useState<PageHeaderInterface | undefined>(
		undefined
	);
	const [loading, setLoading] = useState<boolean>(true);
	useEffect(() => {
		setLoading(true);
		const headerData = getData(languageContext?.language!).headers;
		setPageData(headerData);
		setLoading(false);
	}, [languageContext?.language]);
	return (
		<div className="w-full h-[80px] flex flex-row justify-between items-center ">
			{loading ? (
				<Spinner />
			) : (
				<>
					<div className="w-[10%] h-full flex flex-row justify-start items-center ">
						<Image
							src={
								themeContext?.theme === "light"
									? "/logoLight/android-chrome-512x512.png"
									: "/logoDark/android-chrome-512x512.png"
							}
							width={100}
							className="cursor-pointer"
							onClick={() => {
								navigate("/");
							}}
						/>
					</div>
					<div className="w-[80%] md:w-[60%] lg:w-[40%] h-full hidden sm:flex flex-row justify-around items-center bg-transparent ">
						<Button
							radius="none"
							size="sm"
							className="bg-transparent hover:bg-[#3F3F46] hover:text-white"
							onClick={() => {
								navigate("/");
							}}
						>
							{pageData?.home}
						</Button>
						<Button
							radius="none"
							className="bg-transparent hover:bg-[#3F3F46] hover:text-white"
							onClick={() => {
								navigate("/about");
							}}
						>
							{pageData?.about}
						</Button>
						<Button
							radius="none"
							className="bg-transparent hover:bg-[#3F3F46] hover:text-white"
							onClick={() => {
								navigate("/career");
							}}
						>
							{pageData?.career}
						</Button>
						<Button
							radius="none"
							className="bg-transparent hover:bg-[#3F3F46] hover:text-white"
							onClick={() => {
								navigate("/projects");
							}}
						>
							{pageData?.project}
						</Button>
						<Button
							radius="none"
							className="bg-transparent hover:bg-[#3F3F46] hover:text-white"
							onClick={() => {
								navigate("/contact");
							}}
						>
							{pageData?.contact}
						</Button>
						<LanguageChange />
						<ThemeToggle />
					</div>
				</>
			)}
		</div>
	);
};

export default Header;
