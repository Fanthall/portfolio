import { cache } from "react";
import { prisma } from "@/lib/db";

/**
 * AboutContent singleton'ı (id=1). React cache() ile sarılı — aynı istek
 * içinde layout/footer/sayfa kaç kez çağırırsa çağırsın tek DB sorgusu atılır.
 */
export const getAboutContent = cache(() =>
	prisma.aboutContent.findUnique({ where: { id: 1 } }),
);
