import React, { FunctionComponent, PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Components/Header/Header";
interface LayoutProps extends PropsWithChildren {}
const Layout: FunctionComponent<LayoutProps> = (props) => {
	return (
		<div className="w-full h-full flex-grow flex flex-row justify-center items-start ">
			<div className="h-full w-full container flex flex-col justify-start items-start">
				<Header />
				<div className="h-full f w-full flex flex-row justify-center items-start">
					<Outlet />
				</div>
			</div>
		</div>
	);
};

export default Layout;
