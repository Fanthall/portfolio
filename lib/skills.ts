import { z } from "zod";

/**
 * Beceri grupları AboutContent.skills (Json?) kolonunda tutulur.
 * Kolon null ise aşağıdaki DEFAULT_SKILLS kullanılır — böylece migration
 * sonrası içerik girilmeden de site dolu görünür.
 */

export const skillGroupSchema = z.object({
	titleTr: z.string().min(1).max(60),
	titleEn: z.string().min(1).max(60),
	items: z.array(z.string().min(1).max(60)).max(20),
});

export const skillsSchema = z.array(skillGroupSchema).max(8);

export type SkillGroup = z.infer<typeof skillGroupSchema>;

export const DEFAULT_SKILLS: SkillGroup[] = [
	{
		titleTr: "Front-End",
		titleEn: "Front-End",
		items: ["React.js", "React Native", "TypeScript", "Next.js", "Tailwind CSS"],
	},
	{
		titleTr: "AI & Ajan Geliştirme",
		titleEn: "AI & Agent Development",
		items: [
			"Claude Code",
			"Claude Agent SDK",
			"MCP",
			"LLM Integration",
			"Prompt Engineering",
		],
	},
	{
		titleTr: "Back-End",
		titleEn: "Back-End",
		items: ["Node.js", "Java · Spring Boot", "REST API", "PostgreSQL", "Supabase"],
	},
	{
		titleTr: "Araçlar & Pratikler",
		titleEn: "Tools & Practices",
		items: ["Git", "OOP", "Docker", "Linux"],
	},
];

/** DB'den gelen Json değerini güvenli şekilde SkillGroup[]'a çevirir; bozuksa default döner. */
export function parseSkills(value: unknown): SkillGroup[] {
	if (value == null) return DEFAULT_SKILLS;
	const parsed = skillsSchema.safeParse(value);
	return parsed.success && parsed.data.length > 0 ? parsed.data : DEFAULT_SKILLS;
}
