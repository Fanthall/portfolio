interface StructuredDataProps {
	data: object;
}

export function StructuredData({ data }: StructuredDataProps) {
	return (
		<script
			type="application/ld+json"
			// JSON.stringify çıktısı üzerinde sadece kontrolümüzdeki şema veri var.
			// Yine de </script> gibi sequence'leri yutmak için escape uygulanır.
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(data).replace(/</g, "\\u003c"),
			}}
		/>
	);
}
