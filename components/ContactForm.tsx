"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type FormStatus = "idle" | "sending" | "success" | "error";

export function ContactForm() {
	const t = useTranslations("contact");
	const [status, setStatus] = useState<FormStatus>("idle");
	const [errors, setErrors] = useState<{ name?: boolean; email?: boolean; body?: boolean }>({});

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const form = event.currentTarget;
		const data = new FormData(form);
		const name = String(data.get("name") ?? "").trim();
		const email = String(data.get("email") ?? "").trim();
		const subject = String(data.get("subject") ?? "").trim();
		const body = String(data.get("body") ?? "").trim();

		// istemci validasyonu
		const nextErrors = {
			name: name.length < 2,
			email: !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email),
			body: body.length < 5,
		};
		setErrors(nextErrors);
		if (nextErrors.name || nextErrors.email || nextErrors.body) {
			setStatus("idle");
			return;
		}

		setStatus("sending");
		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, subject: subject || undefined, body }),
			});
			if (!res.ok) {
				setStatus("error");
				return;
			}
			setStatus("success");
			form.reset();
		} catch {
			setStatus("error");
		}
	};

	return (
		<form className="form si" onSubmit={handleSubmit} noValidate>
			{status === "success" && <div className="alert ok">✓ {t("success")}</div>}
			{status === "error" && <div className="alert bad">✕ {t("error")}</div>}

			<div className={`field${errors.name ? " err" : ""}`}>
				<label htmlFor="cf-name">{t("name")}</label>
				<input id="cf-name" name="name" type="text" autoComplete="name" maxLength={120} />
				<span className="msg">{t("errName")}</span>
			</div>
			<div className={`field${errors.email ? " err" : ""}`}>
				<label htmlFor="cf-email">{t("email")}</label>
				<input id="cf-email" name="email" type="email" autoComplete="email" maxLength={254} />
				<span className="msg">{t("errEmail")}</span>
			</div>
			<div className="field">
				<label htmlFor="cf-subject">
					{t("subject")}{" "}
					<span style={{ textTransform: "none", color: "var(--si-muted)" }}>({t("optional")})</span>
				</label>
				<input id="cf-subject" name="subject" type="text" maxLength={200} />
			</div>
			<div className={`field${errors.body ? " err" : ""}`}>
				<label htmlFor="cf-body">{t("message")}</label>
				<textarea id="cf-body" name="body" maxLength={5000} />
				<span className="msg">{t("errBody")}</span>
			</div>

			<button
				type="submit"
				className="btn primary"
				disabled={status === "sending"}
				style={{ width: "100%", justifyContent: "center" }}
			>
				{status === "sending" ? (
					<>
						<span className="spin" /> {t("sending")}
					</>
				) : (
					<>{t("send")} →</>
				)}
			</button>
		</form>
	);
}
