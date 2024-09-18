import { useState, useEffect } from 'react';
import { Auth } from "@/components/Auth";
import Schedule from "@/components/Schedule";

const Home = () => {
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    setUserType(localStorage.getItem("userType"));
  }, []);

  return (
    <div>
      {!userType && <Auth />} {/* Render Auth only if userType is null */}
    </div> 
  );
}

export default Home;