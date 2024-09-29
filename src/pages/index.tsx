import { useState, useEffect } from "react";
import { Auth } from "@/components/auth";

const Home = () => {
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    setUserType(localStorage.getItem("userType"));
  }, []);

  return (
    <div>
      {!userType && <Auth />} 
    </div> 
  );
}

export default Home;