export const getTeamList = async () => {
    try {
        const response = await fetch(
          `https://54.251.20.155.nip.io/api/generateHRScheduleByTeam`,
          {
            method: "GET", // Fetch defaults to GET, so this is optional
            headers: {
              "Content-Type": "application/json",
            },
          }
        ); 

    if (!response.ok) {
      throw new Error(`Failed to retrieve employee data. Status: ${response.status}`);
    };

    const data = await response.json(); // Parse the JSON response
    return data; // Return the employee data
    }
    catch (error) {
        console.log(error)
        console.error(error)
        throw new Error("An error occurred while fetching employee data.");
    }
}
