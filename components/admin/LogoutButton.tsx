"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
	const router = useRouter();
	const [pending, startTransition] = useTransition();

	const handleLogout = () =>
		startTransition(async () => {
			await fetch("/api/auth/logout", { method: "POST" });
			router.push("/admin/login");
			router.refresh();
		});

	return (
		<Button
			variant="ghost"
			size="sm"
			className="w-full justify-start"
			disabled={pending}
			onClick={handleLogout}
		>
			<LogOut /> Çıkış
		</Button>
	);
}
