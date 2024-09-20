async function getUserTypeFromServer() {
    const response = await fetch('/api/userType');
    const data = await response.json();
    return data.userType;
  }
  
  export default getUserTypeFromServer;