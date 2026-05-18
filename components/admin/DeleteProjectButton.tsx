"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteProjectButton({ id, title }: { id: string; title: string }) {
	const router = useRouter();
	const [pending, setPending] = useState(false);
	const [_isPending, startTransition] = useTransition();

	const handleDelete = async () => {
		if (!confirm(`"${title}" projesini silmek istediğine emin misin?`)) return;
		setPending(true);
		try {
			const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
			if (res.ok) {
				startTransition(() => router.refresh());
			}
		} finally {
			setPending(false);
		}
	};

	return (
		<Button
			size="sm"
			variant="ghost"
			className="text-destructive hover:text-destructive ml-auto"
			disabled={pending}
			onClick={handleDelete}
		>
			<Trash2 /> Sil
		</Button>
	);
}
