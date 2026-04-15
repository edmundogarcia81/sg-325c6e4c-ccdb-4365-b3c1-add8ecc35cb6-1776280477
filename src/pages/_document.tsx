import { Html, Head, Main, NextScript } from "next/document";
import { SEOElements } from "@/components/SEO";

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <SEOElements />
        <link rel="icon" type="image/jpeg" href="/b11.jpg" />
        <link rel="apple-touch-icon" href="/b11.jpg" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
