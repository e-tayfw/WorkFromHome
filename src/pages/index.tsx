import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

const Home = () => {
  const [userType, setUserType] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    setUserType(localStorage.getItem("userType"));
  }, []);

  // Check if the current path is "/" and userType is available
  if (location.pathname === "/" && userType) {
    return <Navigate to="/schedule" />;
  }

  // If userType is null, route them to "/auth"
  if (!userType) {
    return <Navigate to="/auth" />;
  }

  // If already on a valid route or if no redirection is needed, return null
  return null;
};

export default Home;
