import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  serverExternalPackages: ["unzipper"],
  // Tüm görseller local (public/assets, public/uploads) — remote pattern izni yok.
  // Harici CDN gerekirse hostname buraya explicit eklenir.
};

export default withNextIntl(nextConfig);
