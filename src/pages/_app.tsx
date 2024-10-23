import "@/styles/globals.css";
import 'flowbite/dist/flowbite.min.css';
import React, { useState, useEffect, ReactNode } from "react";
import type { AppProps } from "next/app";
import { Provider } from 'react-redux';
import { store, persistor } from "@/redux/store"; 
import dynamic from "next/dynamic";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
import { PersistGate } from 'redux-persist/integration/react';
import { useRouter } from "next/router";
import Nav from "@/components/Nav";

export default function App({ Component, pageProps }: AppProps) {
  const [userType, setUserType] = useState<string | null>(null);
  const router = useRouter();  // useRouter to handle navigation

  useEffect(() => {
    const storedUserType = localStorage.getItem("userType");
    setUserType(storedUserType);

    // Redirect based on userType and path
    if (storedUserType) {
      if (router.pathname === "/") {
        router.push("/schedule");
      }
    } else {
      if (router.pathname === "/") {
        router.push("/auth");
      }
    }
  }, [router.pathname]);

  // Dynamically import SiteContainer (disable SSR)
  const SiteContainer = dynamic<{ children: ReactNode }>(
    () => import("../components/SiteContainer").then((mod) => mod.default),
    { ssr: false }
  );

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div className="h-full w-full">
          <SiteContainer>
            <ToastContainer />
            {userType && <Nav />}
            <Component {...pageProps} />
          </SiteContainer>
        </div>
      </PersistGate>
    </Provider>
  );
}