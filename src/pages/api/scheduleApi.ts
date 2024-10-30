export const generateOwnSchedule = async (staffId: number) => {
  try {
    const response = await fetch(
      `https://54.251.20.155.nip.io/api/generateOwnSchedule/${staffId}/`,
      {
        method: "GET", // Fetch defaults to GET, so this is optional
        mode: "no-cors",
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
      `https://54.251.20.155.nip.io/api/generateTeamSchedule/${staffId}`,
      {
        method: "GET", // Fetch defaults to GET, so this is optional
        mode: "no-cors",
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

export const generateManagerTeamSchedule = async (staffId: number) => {
  try {
    const response = await fetch(
      `https://54.251.20.155.nip.io/api/generateTeamScheduleByManager/${staffId}`,
      {
        method: "GET", // Fetch defaults to GET, so this is optional
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to retrieve director schedule. Status: ${response.status}`
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



export const generateDirectorTeamSchedule = async (staffId: number) => {
  try {
    const response = await fetch(
      `https://54.251.20.155.nip.io/api/generateTeamScheduleByDirector/${staffId}`,
      {
        method: "GET", // Fetch defaults to GET, so this is optional
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to retrieve director schedule. Status: ${response.status}`
      );
    }

    const data = await response.json(); // Parse the JSON response
    return data; // Return the employee data
  } catch (error) {
    console.log(error);
    console.error(error);
    throw new Error("An error occurred while fetching employee schedule data.");
  }
};
