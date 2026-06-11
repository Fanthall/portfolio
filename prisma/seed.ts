/**
 * Bootstrap seed — sadece ilk deploy'da çalıştırılmalı.
 *
 * GÜVENLİK: Bu script ÜRETİMDE MEVCUT VERİYİ KORUR. Her tablo için "varsa
 * dokunma, yoksa oluştur" mantığı uygulanır. Bu sayede yanlışlıkla redeploy
 * sırasında çalıştırılsa bile admin'den girilen içerik silinmez.
 *
 * Bootstrap içeriği için (admin user dahil), tablolar boşken çalıştırılmalı.
 * Sonradan içeriği değiştirmek için: admin paneli (/admin/about, /admin/career, ...).
 *
 * Tekrar bootstrap'lemek istersen önce ilgili tabloyu manuel temizle.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
	const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@portfolio.local";
	const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "change-me-now";

	// --- AdminUser: yalnız hiç admin yoksa oluştur -------------------------
	const adminCount = await prisma.adminUser.count();
	if (adminCount === 0) {
		const passwordHash = await bcrypt.hash(adminPassword, 12);
		await prisma.adminUser.create({
			data: { email: adminEmail, passwordHash },
		});
		console.log(`✓ AdminUser created: ${adminEmail}`);
	} else {
		console.log(`· AdminUser skipped (${adminCount} mevcut)`);
	}

	// --- AboutContent: yalnız boşsa oluştur --------------------------------
	const aboutExists = await prisma.aboutContent.findUnique({ where: { id: 1 } });
	if (!aboutExists) {
		await prisma.aboutContent.create({
			data: {
				id: 1,
				siteTitle: "Sezer Demir DEDEK",
				siteDescription: "Front-End focused software engineer — portfolio",
				titleTr: "Ben Sezer Demir DEDEK",
				titleEn: "I'm Sezer Demir DEDEK",
				bioTr:
					"Bilgisayar Mühendisliği mezunu, front-end odaklı bir yazılım mühendisiyim. " +
					"Pamukkale Üniversitesi'nde Bilgisayar Programcılığı ön lisansımı okul birinciliği ile tamamladıktan sonra " +
					"Eskişehir Osmangazi Üniversitesi Bilgisayar Mühendisliği bölümünden mezun oldum.\n\n" +
					"Kariyerime AVKAR Yazılım'da stajyer olarak başladım; yarı zamanlı ve sonrasında Junior Software Engineer " +
					"rollerinde sağlık ve eğitim sektörü için React.js, React Native ve Java/Spring Boot ile uçtan uca " +
					"projeler geliştirdim. Devamında Boxbilet'te Software Engineer olarak konser ve etkinlik biletleme " +
					"ekosisteminde CMS ve yönetim arayüzleri kurdum, Paribu Biletleme'de Web App Engineer olarak " +
					"etkinlik biletleme platformunun yönetim panelini hayata geçirdim.\n\n" +
					"Temiz mimari, TypeScript ile tip güvenli kod ve kullanıcı odaklı arayüzler üzerine çalışmayı seviyorum. " +
					"Boş zamanlarımda puzzle çözüyor, hikayeli oyunlar oynuyor ve film/dizi izliyorum.",
				bioEn:
					"I am a Computer Engineering graduate and a front-end focused software engineer. " +
					"I completed my associate degree in Computer Programming at Pamukkale University as the valedictorian, " +
					"then earned my Bachelor's in Computer Engineering at Eskişehir Osmangazi University.\n\n" +
					"I began my career as an intern at AVKAR Yazılım; through part-time and then Junior Software Engineer " +
					"roles I built end-to-end products for the healthcare and education sectors using React.js, React Native " +
					"and Java/Spring Boot. I then joined Boxbilet as a Software Engineer, shipping CMS and management " +
					"interfaces for the concert and event ticketing ecosystem, and continued at Paribu Biletleme as a " +
					"Web App Engineer, building the admin panel of an event ticketing platform.\n\n" +
					"I focus on clean architecture, type-safe code with TypeScript and user-centered interfaces. " +
					"In my free time I enjoy puzzles, story-driven games and films/series.",
				photoUrl: "/assets/sezer.png",
				socialLinks: {
					github: "https://github.com/Fanthall",
					linkedin: "https://www.linkedin.com/in/sezer-demir-d-a8084b1b0/",
					instagram: "https://www.instagram.com/sezerdemirdedek/",
					gmail: "sezerddedek@gmail.com",
				},
			},
		});
		console.log("✓ AboutContent created");
	} else {
		console.log("· AboutContent skipped (mevcut)");
	}

	// --- WorkExperience: yalnız tablo boşsa CV verisini yaz ----------------
	const careerCount = await prisma.workExperience.count();
	if (careerCount === 0) {
		await prisma.workExperience.createMany({
			data: [
				{
					companyName: "Paribu Biletleme A.Ş.",
					roleTr: "Web App Engineer",
					roleEn: "Web App Engineer",
					descTr:
						"Etkinlik biletleme ekosisteminde yönetim paneli ve web uygulaması geliştirme. " +
						"Stack: TypeScript · React.js · Git · REST · OOP.",
					descEn:
						"Built the admin panel and web application for an event ticketing ecosystem. " +
						"Stack: TypeScript · React.js · Git · REST · OOP.",
					startDate: new Date("2025-08-01"),
					endDate: new Date("2026-05-31"),
					order: 0,
				},
				{
					companyName: "Boxbilet Yazılım Medya A.Ş.",
					roleTr: "Software Engineer",
					roleEn: "Software Engineer",
					descTr:
						"Konser/etkinlik satış standları için CMS ve yönetim arayüzleri. " +
						"Stack: TypeScript · React.js · Git · REST · OOP.",
					descEn:
						"CMS and admin interfaces for concert/event sales stands. " +
						"Stack: TypeScript · React.js · Git · REST · OOP.",
					startDate: new Date("2024-07-01"),
					endDate: new Date("2025-08-31"),
					order: 1,
				},
				{
					companyName: "AVKAR Yazılım San. ve Tic. Ltd. Şti — Eskişehir/Odunpazarı",
					roleTr: "Junior Software Engineer",
					roleEn: "Junior Software Engineer",
					descTr:
						"Sağlık ve eğitim sektörü projeleri (RxMediaPharma, Osmangazi SEM, THD-TRD). " +
						"Stack: Java · TypeScript · React Native · React.js · Git · REST · OOP.",
					descEn:
						"Healthcare and education sector projects (RxMediaPharma, Osmangazi SEM, THD-TRD). " +
						"Stack: Java · TypeScript · React Native · React.js · Git · REST · OOP.",
					startDate: new Date("2022-07-01"),
					endDate: new Date("2024-05-31"),
					order: 2,
				},
				{
					companyName: "AVKAR Yazılım San. ve Tic. Ltd. Şti — Eskişehir/Odunpazarı",
					roleTr: "Yarı Zamanlı Software Engineer",
					roleEn: "Part-Time Software Engineer",
					descTr:
						"Üniversite eğitimi sırasında web ve mobil projelerde yarı zamanlı rol. " +
						"Stack: TypeScript · React Native · React.js · Git · REST · OOP.",
					descEn:
						"Part-time role on web and mobile projects during university. " +
						"Stack: TypeScript · React Native · React.js · Git · REST · OOP.",
					startDate: new Date("2021-08-01"),
					endDate: new Date("2022-07-31"),
					order: 3,
				},
				{
					companyName: "AVKAR Yazılım San. ve Tic. Ltd. Şti — Eskişehir/Odunpazarı",
					roleTr: "Stajyer",
					roleEn: "Intern",
					descTr: "20 iş günü zorunlu staj.",
					descEn: "20 business days mandatory internship.",
					startDate: new Date("2021-07-01"),
					endDate: new Date("2021-08-31"),
					order: 4,
				},
				{
					companyName: "Pamukkale Üniversitesi — Bilgi İşlem Daire Başkanlığı, Denizli",
					roleTr: "Stajyer",
					roleEn: "Intern",
					descTr: "15 iş günü zorunlu staj.",
					descEn: "15 business days mandatory internship.",
					startDate: new Date("2017-07-01"),
					endDate: new Date("2017-07-31"),
					order: 5,
				},
			],
		});
		console.log("✓ WorkExperience created (6 kayıt)");
	} else {
		console.log(`· WorkExperience skipped (${careerCount} mevcut)`);
	}

	// --- Project: yalnız tablo boşsa örnek projeler yaz --------------------
	const projectCount = await prisma.project.count();
	if (projectCount === 0) {
		await prisma.project.createMany({
			data: [
				{
					slug: "chat-view",
					titleTr: "Kick Chat View",
					titleEn: "Kick Chat View",
					summaryTr:
						"Kick canlı yayın sohbetini moderasyon panelleriyle birlikte gösteren masaüstü Electron uygulaması.",
					summaryEn:
						"Desktop Electron app that surfaces Kick live chat with moderation panels.",
					descTr:
						"React + Redux Toolkit + NextUI üzerine kurulu, Pusher WebSocket ile canlı chat dinleyen, " +
						"7TV emote desteği ve XSS-sertleştirilmiş render katmanı bulunan masaüstü istemci.",
					descEn:
						"React + Redux Toolkit + NextUI desktop client that listens to live chat via Pusher WebSocket, " +
						"supports 7TV emotes and ships an XSS-hardened render layer.",
					demoType: "DOWNLOAD_ONLY",
					repoUrl: "https://github.com/Fanthall/kick-chat-view",
					tags: ["Electron", "React", "TypeScript", "WebSocket"],
					isFeatured: true,
					order: 0,
				},
				{
					slug: "password-management",
					titleTr: "Password Management",
					titleEn: "Password Management",
					summaryTr:
						"NestJS + Prisma + Docker tabanlı modern parola kasası — AES-256-GCM ve Argon2id ile katmanlı şifreleme.",
					summaryEn:
						"Modern password vault built on NestJS + Prisma + Docker — layered crypto with AES-256-GCM and Argon2id.",
					descTr:
						"NestJS backend (helmet + throttler + CORS sertleştirme), Prisma + PostgreSQL veri katmanı, " +
						"client tarafında masaüstü Electron istemci.",
					descEn:
						"NestJS backend (helmet + throttler + CORS hardened), Prisma + PostgreSQL data layer, " +
						"Electron desktop client on the consumer side.",
					demoType: "GALLERY_ONLY",
					tags: ["NestJS", "Prisma", "PostgreSQL", "Docker", "Electron", "AES-256-GCM"],
					isFeatured: true,
					order: 1,
				},
			],
		});
		console.log("✓ Project created (2 kayıt)");
	} else {
		console.log(`· Project skipped (${projectCount} mevcut)`);
	}

	// --- PageSeo: 5 sayfa için boş kayıt (idempotent) ----------------------
	const pageKeys: Array<"HOME" | "ABOUT" | "CAREER" | "PROJECTS" | "CONTACT"> = [
		"HOME",
		"ABOUT",
		"CAREER",
		"PROJECTS",
		"CONTACT",
	];
	let pageSeoCreated = 0;
	for (const key of pageKeys) {
		const existing = await prisma.pageSeo.findUnique({ where: { pageKey: key } });
		if (!existing) {
			await prisma.pageSeo.create({ data: { pageKey: key } });
			pageSeoCreated++;
		}
	}
	if (pageSeoCreated > 0) {
		console.log(`✓ PageSeo ${pageSeoCreated} kayıt eklendi`);
	} else {
		console.log("· PageSeo skipped (hepsi mevcut)");
	}

	console.log("\nBootstrap completed.");
	console.log(`Admin email: ${adminEmail}`);
	console.log("Sonraki içerik güncellemeleri için: admin paneli (/admin)");
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
