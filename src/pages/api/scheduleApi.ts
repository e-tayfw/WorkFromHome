export const generateOwnSchedule = async (staffId: number) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8085/api/generateOwnSchedule/${staffId}`,
      {
        method: "GET", // Fetch defaults to GET, so this is optional
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to retrieve employee schedule. Status: ${response.status}`
      );
    }

    const data = await response.json(); // Parse the JSON response
    return data; // Return the employee data

    } 
  catch(error) {
        console.log(error);
        console.error(error);
        throw new Error("An error occurred while fetching employee schedule data.");
    }
}

export const generateTeamSchedule = async (staffId: number) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8085/api/generateOwnSchedule/${staffId}`,
      {
        method: "GET", // Fetch defaults to GET, so this is optional
      }
    );


    if (!response.ok) {
      throw new Error(
        `Failed to retrieve employee schedule. Status: ${response.status}`
      );
    }

    const data = await response.json(); // Parse the JSON response
    return data; // Return the employee data

  } catch (error) {
    console.log(error);
    console.error(error);
    throw new Error("An error occurred while fetching employee schedule data.");
  }
}
