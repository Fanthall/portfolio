"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
	children: ReactNode;
	/** Saniye cinsinden gecikme (stagger için) */
	delay?: number;
	className?: string;
}

/**
 * Scroll'a girince bir kez oynayan yumuşak fade+yukarı kayma.
 * prefers-reduced-motion açıksa animasyon devre dışı kalır.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
	const reduceMotion = useReducedMotion();

	if (reduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, y: 16 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-40px" }}
			transition={{ duration: 0.45, delay, ease: "easeOut" }}
		>
			{children}
		</motion.div>
	);
}
