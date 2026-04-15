import { Html, Head, Main, NextScript } from "next/document";
import { SEOElements } from "@/components/SEO";

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <SEOElements />
        <link rel="icon" href="/b11.jpg?v=1" />
        <link rel="shortcut icon" href="/b11.jpg?v=1" />
        <link rel="apple-touch-icon" href="/b11.jpg?v=1" />
        <meta name="msapplication-TileImage" content="/b11.jpg?v=1" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
