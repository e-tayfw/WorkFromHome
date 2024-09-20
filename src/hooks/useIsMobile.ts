import { useState, useEffect, useMemo } from "react";

const useCheckMobileScreen = () => {
  const isClient = typeof window === "object"; // Check if we are on the client-side

  const [width, setWidth] = useState(isClient ? window.innerWidth : 0);


  useEffect(() => {
    const handleWindowSizeChange = () => {
      if (isClient) {
        setWidth(window.innerWidth);
      }
    };

    if (isClient) {
      window.addEventListener("resize", handleWindowSizeChange);

      return () => {
        window.removeEventListener("resize", handleWindowSizeChange);
      };
    }
  }, [isClient]);

  return useMemo(() => {
    return width <= 1024;
  }, [width]);
};

export { useCheckMobileScreen };
