"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
	redirectTo: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const payload = {
			email: String(data.get("email") ?? "").trim(),
			password: String(data.get("password") ?? ""),
		};

		setError(null);
		setPending(true);

		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!res.ok) {
				setError(res.status === 401 ? "E-posta veya şifre hatalı." : "Giriş başarısız.");
				return;
			}

			router.push(redirectTo);
			router.refresh();
		} catch {
			setError("Bağlantı hatası.");
		} finally {
			setPending(false);
		}
	};

	return (
		<Card>
			<CardContent className="p-6">
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">E-posta</Label>
						<Input id="email" name="email" type="email" required autoComplete="email" />
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Şifre</Label>
						<Input
							id="password"
							name="password"
							type="password"
							required
							minLength={8}
							autoComplete="current-password"
						/>
					</div>
					{error && <p className="text-sm text-destructive">{error}</p>}
					<Button type="submit" disabled={pending} className="w-full">
						<LogIn /> Giriş yap
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
