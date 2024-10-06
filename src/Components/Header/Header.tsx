import { Button, Image, Spinner } from "@nextui-org/react";
import React, {
	FunctionComponent,
	useContext,
	useEffect,
	useState,
} from "react";
import { IoMenu } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import getData, { PageHeaderInterface } from "../../Data/data";
import LanguageChange from "../Buttons/LanguageChange/LanguageChange";
import ThemeToggle from "../Buttons/ThemeToggle/ThemeToggle";
import { LanguageContext } from "../LanguageController/LanguageController";
import { ThemeContext } from "../ThemeController/ThemeContext";
import logoDark from "./../../Assets/darkLogo.png";
import logoLight from "./../../Assets/lightLogo.png";
interface HeaderProps {}
const Header: FunctionComponent<HeaderProps> = () => {
	const navigate = useNavigate();
	const themeContext = useContext(ThemeContext);
	const languageContext = useContext(LanguageContext);
	const [pageData, setPageData] = useState<PageHeaderInterface | undefined>(
		undefined
	);
	const [loading, setLoading] = useState<boolean>(true);
	const [openMenu, setOpenMenu] = useState<boolean>(false);
	useEffect(() => {
		setLoading(true);
		const headerData = getData(languageContext?.language!).headers;
		setPageData(headerData);
		setLoading(false);
	}, [languageContext?.language]);
	return (
		<div className="w-full h-[80px] flex flex-row justify-between items-center  ">
			{loading ? (
				<Spinner />
			) : (
				<>
					<div className="w-full sm:w-[10%] h-full flex flex-row justify-center sm:justify-start items-center ">
						<Image
							src={
								themeContext?.theme === "light" ? logoLight : logoDark
							}
							width={100}
							className="cursor-pointer hidden sm:block"
							onClick={() => {
								navigate("/");
							}}
						/>
						<div className="absolute top-2 right-2 sm:hidden">
							<Button
								radius="none"
								size="sm"
								isIconOnly
								className="bg-transparent "
								onClick={() => {
									setOpenMenu(true);
								}}
							>
								<IoMenu size={25} />
							</Button>
						</div>
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

					{openMenu && (
						<div className="w-[50%]  h-full absolute right-0 top-0 flex sm:hidden flex-col justify-start items-center dark:bg-black bg-white z-50 pt-20">
							<div className="w-full mb-8 h-[60px] flex flex-row justify-center  items-center">
								<Image
									removeWrapper
									src={
										themeContext?.theme === "light"
											? logoLight
											: logoDark
									}
									width={100}
									height={100}
									className="cursor-pointer"
									onClick={() => {
										navigate("/");
									}}
								/>
							</div>
							<div className="absolute top-2 right-2">
								<Button
									radius="none"
									size="sm"
									isIconOnly
									className="bg-transparent "
									onClick={() => {
										setOpenMenu(false);
									}}
								>
									<IoMenu size={25} />
								</Button>
							</div>
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
					)}
				</>
			)}
		</div>
	);
};

export default Header;
