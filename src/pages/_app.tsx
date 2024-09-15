import "@/styles/globals.css";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { ToastContainer } from "react-toastify";
import { ReactNode } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const SiteContainer = dynamic<{ children: ReactNode }>(
    () =>
      import("../components/SiteContainer").then(
        (SiteContainer) => SiteContainer
      ),
    {
      ssr: false,
    }
  );
  return (
    <div className={`h-full w-full`}>
      <SiteContainer>
        <ToastContainer />
        <Component {...pageProps} />
      </SiteContainer>
  </div>
  );
}
