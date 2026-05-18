"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormStatus = "idle" | "sending" | "success" | "error";

export function ContactForm() {
	const t = useTranslations("contact");
	const [status, setStatus] = useState<FormStatus>("idle");
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const form = event.currentTarget;
		const data = new FormData(form);
		const payload = {
			name: String(data.get("name") ?? "").trim(),
			email: String(data.get("email") ?? "").trim(),
			subject: String(data.get("subject") ?? "").trim() || undefined,
			body: String(data.get("body") ?? "").trim(),
		};

		setStatus("sending");
		setErrors({});

		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				if (data?.details?.fieldErrors) {
					const fieldErrors: Record<string, string> = {};
					for (const [key, value] of Object.entries(data.details.fieldErrors)) {
						if (Array.isArray(value) && value.length > 0) {
							fieldErrors[key] = value[0] as string;
						}
					}
					setErrors(fieldErrors);
				}
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
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="name">{t("name")}</Label>
					<Input id="name" name="name" required minLength={2} maxLength={120} />
					{errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
				</div>
				<div className="space-y-2">
					<Label htmlFor="email">{t("email")}</Label>
					<Input id="email" name="email" type="email" required maxLength={254} />
					{errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
				</div>
			</div>
			<div className="space-y-2">
				<Label htmlFor="subject">{t("subject")}</Label>
				<Input id="subject" name="subject" maxLength={200} />
			</div>
			<div className="space-y-2">
				<Label htmlFor="body">{t("message")}</Label>
				<Textarea id="body" name="body" required minLength={5} maxLength={5000} rows={6} />
				{errors.body && <p className="text-sm text-destructive">{errors.body}</p>}
			</div>
			<div className="flex items-center gap-3">
				<Button type="submit" disabled={status === "sending"}>
					<Send /> {t("send")}
				</Button>
				{status === "success" && (
					<p className="text-sm text-emerald-500">{t("success")}</p>
				)}
				{status === "error" && (
					<p className="text-sm text-destructive">{t("error")}</p>
				)}
			</div>
		</form>
	);
}
