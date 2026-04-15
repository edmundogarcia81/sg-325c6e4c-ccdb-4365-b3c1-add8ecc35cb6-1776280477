import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { SurveyProvider } from "@/contexts/SurveyContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <SurveyProvider>
        <Component {...pageProps} />
      </SurveyProvider>
    </ThemeProvider>
  );
}
