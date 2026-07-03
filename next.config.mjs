import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Görseller Supabase Storage'tan gelir (public bucket). next/image için o
// host'a izin ver — URL env'den türetilir (local: 127.0.0.1:54341, prod: proje domaini).
const remotePatterns = [];
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const u = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    remotePatterns.push({
      protocol: u.protocol.replace(":", ""),
      hostname: u.hostname,
      port: u.port || undefined,
      pathname: "/storage/v1/object/public/**",
    });
  } catch {
    // geçersiz URL — pattern eklenmez
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // standalone yalniz Docker/VPS build'i icin; Netlify kendi Next runtime'ini
  // kullandigindan orada devre disi (NETLIFY env'i build sirasinda set edilir).
  output: process.env.NETLIFY ? undefined : "standalone",
  serverExternalPackages: ["unzipper"],
  images: { remotePatterns },
};

export default withNextIntl(nextConfig);
