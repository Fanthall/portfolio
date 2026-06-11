import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigasyon primitifleri. Public taraftaki TÜM iç linkler
 * next/link yerine buradaki Link'i kullanmalı — EN'deyken /en prefix'ini korur.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
	createNavigation(routing);
