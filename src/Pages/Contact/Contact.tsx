import { Button, Input, Spinner, Textarea } from "@nextui-org/react";
import React, {
	FunctionComponent,
	useContext,
	useEffect,
	useState,
} from "react";
import { SectionTitle, SocialMedia } from "../../Components";
import { LanguageContext } from "../../Components/LanguageController/LanguageController";
import getData, { ContactsInterface, SocialsInterface } from "../../Data/data";

interface ContactProps {}
const Contact: FunctionComponent<ContactProps> = (props) => {
	const languageContext = useContext(LanguageContext);
	const [socials, setSocials] = useState<SocialsInterface | undefined>(
		undefined
	);
	const [contacts, setContacts] = useState<ContactsInterface | undefined>(
		undefined
	);
	const [loading, setLoading] = useState<boolean>(true);
	useEffect(() => {
		setLoading(true);
		const data = getData(languageContext?.language!);
		setSocials(data.socials);
		setContacts(data.contacts);
		setLoading(false);
	}, [languageContext?.language]);

	return (
		<div className="w-full h-[80%] flex flex-col justify-start items-start  ">
			{loading ? (
				<Spinner />
			) : (
				<>
					<SectionTitle
						title={getData(languageContext?.language!).headers.contact}
						className="mt-20"
					/>
					<div className="w-full h-full flex flex-col-reverse lg:flex-row  justify-center items-center pt-10 mb-40 ">
						<div className="w-full lg:w-[30%] h-full flex flex-col justify-center items-start relative dark:text-stone-200 text-stone-900 mt-10 lg:mt-0 pb-8 md:pb-0">
							<div className="w-full flex flex-col justify-start items-start mt-8 md:mt-0 text-base md:text-xl">
								<p>{contacts?.gmail}</p>
								<p>{contacts?.outlook}</p>
							</div>
							<SocialMedia
								instagram={socials?.instagram}
								linkedin={socials?.linkedin}
								github={socials?.github}
							/>
						</div>

						<div className="w-full lg:w-[30%] h-full flex flex-col justify-start items-start mt-48 ">
							<div className="w-full  border-2 border-default-200  rounded-br-xl">
								<form
									className="w-full border-2 p-8 rounded-br-4xl shadow-lg"
									style={{ borderBottomRightRadius: 50 }}
								>
									<Input
										radius="none"
										className="w-full mb-4"
										label="Name"
									></Input>
									<Input
										radius="none"
										className="w-full  mb-4"
										label="E-Mail"
									></Input>
									<Input
										radius="none"
										className="w-full mb-4"
										label="Phone"
									></Input>
									<Textarea
										radius="none"
										className="w-full  mb-4"
										label="Message"
										maxRows={3}
									></Textarea>
									<Button
										radius="none"
										className="w-full border-stone-600 dark:border-stone-200"
										variant="bordered"
									>
										Send
									</Button>
								</form>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default Contact;
