export interface AboutInterface {
	main: string;
	hobby: string;
	game: string;
	frontEnd: string;
	backEnd: string;
}
export interface SocialsInterface {
	github: string;
	linkedin: string;
	instagram: string;
}
export interface ContactsInterface {
	gmail: string;
	outlook: string;
}
export interface MainInterface {
	mainTitle: string;
	mainSubTitle: string;
}
export interface DataInterface {
	mainTitles: MainInterface;
	about: AboutInterface;
	aboutTitle: AboutInterface;
	socials: SocialsInterface;
	contacts: ContactsInterface;
	headers: PageHeaderInterface;
}

export interface PageHeaderInterface {
	home: string;
	about: string;
	career: string;
	project: string;
	contact: string;
}

export const trHeaderData: PageHeaderInterface = {
	home: "Anasayfa",
	about: "Hakkımda",
	career: "Kariyerim",
	project: "Projelerim",
	contact: "İletişim",
};
export const enHeaderData: PageHeaderInterface = {
	home: "Home",
	about: "About",
	career: "Career",
	project: "Projects",
	contact: "Contact",
};
const trAboutData: {
	about: AboutInterface;
	aboutTitle: AboutInterface;
} = {
	about: {
		main: `Ben Sezer Demir Dedek, Bilgisayar Mühendisliği mezunu ve Front-End alanında uzmanlaşmış bir yazılımcıyım. Pamukkale Üniversitesi'nde Bilgisayar Programcılığı ön lisansımı okul birinciliği ile tamamladım ve ardından 
        Eskişehir Osmangazi Üniversitesi Bilgisayar Mühendisliği bölümünden mezun oldum. Profesyonel kariyerime yarı zamanlı olarak başladım ve daha sonra Junior Software Engineer pozisyonuna geçtim.`,
		hobby: `Boş zamanlarımda puzzle yapmak hobilerim arasında önemli bir yer tutuyor. Puzzle yapmak, hem zihinsel odaklanma becerilerimi geliştirmeme yardımcı oluyor hem de rahatlamamı sağlıyor. 
        Her fırsatta yeni ve zorlu puzzle'lar çözerek odaklanma pratiği yapmaya çalışıyorum.`,
		game: `Genel yorgunluğumu ve stresimi azaltmak için boş zamanlarımda video oyunları oynamayı tercih ediyorum. Arkadaşlarımla birlikte veya hikayeli türdeki oyunları keşfetmek, 
        benim için hem eğlenceli bir aktivite hem de dinlenme ve stres atma fırsatı sağlıyor. Oyunlar sayesinde yeni dünyalar keşfetmek ve arkadaşlarla birlikte vakit geçirmek benim için çok değerli.`,
		frontEnd: `Front-End geliştirme konusunda geniş bir bilgi birikimine sahibim. Özellikle React.js ve React Native frameworklerini Typescript kullanarak kullanıcı dostu ve etkileşimli arayüzler geliştirme konusunda uzmanlaştım. 
        Sağlık sektöründe etkileşimli mobil uygulamalar ve müşteri takip sistemleri gibi çeşitli projelerde yer aldım. Projelerimde verilerin REST API aracılığıyla çekilmesini ve gösterilmesini sağladım.`,
		backEnd: `Back-End geliştirme alanında Java ve Spring Boot teknolojilerini kullanarak sunucu tarafı uygulamalar geliştirdim. PostgreSQL veritabanı ile çalışarak verilerin işlenmesi ve saklanmasını sağladım.  
        REST API kullanarak bu verilerin front-end tarafında kullanıcılar tarafından kolayca erişilmesini sağladım.`,
	},
	aboutTitle: {
		main: "Hakkımda",
		hobby: "Hobilerim",
		game: "Oyunlar",
		frontEnd: "Front-End",
		backEnd: "Back-End",
	},
};
const enAboutData: {
	about: AboutInterface;
	aboutTitle: AboutInterface;
} = {
	about: {
		main: `I am Sezer Demir Dedek, a Computer Engineering graduate and a developer specialized in Front-End. I completed my associate degree in Computer Programming at Pamukkale University as the top of my class, 
        and then graduated from Eskişehir Osmangazi University with a degree in Computer Engineering. 
        I began my professional career part-time and later transitioned into a Junior Software Engineer position.`,
		hobby: `In my free time, doing puzzles holds an important place among my hobbies. Solving puzzles helps me improve my mental focus skills and allows me to relax. 
        I try to practice concentration by solving new and challenging puzzles whenever I get the chance.`,
		game: `To reduce my overall fatigue and stress, I prefer playing video games in my spare time. Whether playing with friends or exploring story-based games, 
        it provides me with an enjoyable activity, as well as an opportunity to relax and relieve stress. Discovering new worlds through games and spending time with friends is very valuable to me.`,
		frontEnd: `I have a broad knowledge of front-end development. I am particularly specialized in developing user-friendly and interactive interfaces using React.js and React Native frameworks. 
        I have been involved in various projects such as interactive mobile applications in the healthcare sector and customer tracking systems. I developed user-friendly mobile applications using TypeScript and React Native, 
        and I created effective and user-friendly interfaces with React.js. In these projects, I enabled data to be fetched and displayed via REST API.`,
		backEnd: `I also have a strong knowledge of back-end development. I developed reliable and scalable server-side applications using Java and Spring Boot technologies. I worked with the PostgreSQL database to process and store data. 
        In my projects, I used Java and Spring Boot to ensure the secure processing and storage of data on the server side. Using REST API, I made this data easily accessible to users on the front-end. Through this, 
        I gained experience in creating user-friendly and reliable systems.`,
	},
	aboutTitle: {
		main: "About Me",
		hobby: "Hobbies",
		game: "Video Games",
		frontEnd: "Front-End",
		backEnd: "Back-End",
	},
};

const trMainData: MainInterface = {
	mainTitle: "Ben Sezer Demir DEDEK",
	mainSubTitle: "React.js Geliştirici",
};
const enMainData = {
	mainTitle: "I'm Sezer Demir DEDEK",
	mainSubTitle: "React.js Developer",
};

const getData = (language: "tr" | "en"): DataInterface => {
	return {
		...(language === "tr" ? trAboutData : enAboutData),
		mainTitles: language === "tr" ? trMainData : enMainData,
		headers: language === "tr" ? trHeaderData : enHeaderData,
		socials: {
			github: "https://github.com/Fanthall",
			linkedin: "https://www.linkedin.com/in/sezer-demir-d-a8084b1b0/",
			instagram: "https://www.instagram.com/sezerdemirdedek/",
		},
		contacts: {
			gmail: "sezerddedek@gmail.com",
			outlook: "sezerdemirdedek@outlook.com",
		},
	};
};
export default getData;
