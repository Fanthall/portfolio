"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const containerVariants = {
	hidden: {},
	show: {
		transition: { staggerChildren: 0.08 },
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 14 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: "easeOut" },
	},
};

interface StaggerProps {
	children: ReactNode;
	className?: string;
}

/** Çocukları (StaggerItem) sırayla beliren container. Reduced-motion'da düz render. */
export function Stagger({ children, className }: StaggerProps) {
	const reduceMotion = useReducedMotion();

	if (reduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			variants={containerVariants}
			initial="hidden"
			animate="show"
		>
			{children}
		</motion.div>
	);
}

export function StaggerItem({ children, className }: StaggerProps) {
	const reduceMotion = useReducedMotion();

	if (reduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div className={className} variants={itemVariants}>
			{children}
		</motion.div>
	);
}
