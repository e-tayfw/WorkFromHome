import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const Home = () => {
  const [userType, setUserType] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setUserType(localStorage.getItem("userType"));
  }, []);

  useEffect(() => {
    // Check if the current path is "/" and userType is available
    if (router.pathname === "/" && userType) {
      router.push("/schedule");
    }

    // If userType is null, route them to "/auth"
    if (!userType) {
      router.push("/auth");
    }
  }, [router, userType]);

  // If already on a valid route or if no redirection is needed, return null
  return null;
};

export default Home;