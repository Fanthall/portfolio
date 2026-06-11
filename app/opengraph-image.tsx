import { ImageResponse } from "next/og";

/**
 * Site geneli varsayılan OG görseli (1200×630). Sayfa bazlı override
 * admin > SEO'daki ogImage alanıyla yapılır (lib/seo.ts önceliği).
 * Tema: site ile aynı slate zemin + violet vurgu.
 */

export const alt = "Sezer Demir DEDEK — Front-End Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					backgroundColor: "#070b14",
					padding: "72px 80px",
					fontFamily: "sans-serif",
				}}
			>
				{/* Üst vurgu çizgisi */}
				<div
					style={{
						display: "flex",
						width: "120px",
						height: "10px",
						borderRadius: "9999px",
						backgroundColor: "#8b5cf6",
					}}
				/>

				<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
					<div
						style={{
							display: "flex",
							fontSize: "76px",
							fontWeight: 700,
							color: "#f8fafc",
							letterSpacing: "-2px",
						}}
					>
						Sezer Demir DEDEK
					</div>
					<div
						style={{
							display: "flex",
							fontSize: "36px",
							color: "#a78bfa",
							fontWeight: 500,
						}}
					>
						Front-End Software Engineer
					</div>
					<div
						style={{
							display: "flex",
							fontSize: "26px",
							color: "#94a3b8",
						}}
					>
						React.js · React Native · TypeScript · Next.js
					</div>
				</div>

				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<div style={{ display: "flex", fontSize: "28px", color: "#cbd5e1" }}>
						sezerdemirdedek.com
					</div>
					<div
						style={{
							display: "flex",
							width: "56px",
							height: "56px",
							borderRadius: "16px",
							backgroundColor: "#8b5cf6",
							color: "#ffffff",
							fontSize: "30px",
							fontWeight: 700,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						S
					</div>
				</div>
			</div>
		),
		size,
	);
}
