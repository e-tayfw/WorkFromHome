import "@/styles/globals.css";
import React from "react";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
import { ReactNode, useState, useEffect } from "react";
import Nav from "@/components/Nav";

export default function App({ Component, pageProps }: AppProps) {
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    setUserType(localStorage.getItem("userType"));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setUserType(localStorage.getItem("userType"));
    }, 1000); // Check every second

    // Cleanup interval on component unmount
    return () => {
      clearInterval(timer);
    };
  }, []);

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
        {userType && <Nav />}
        <Component {...pageProps} />
      </SiteContainer>
    </div>
  );
}