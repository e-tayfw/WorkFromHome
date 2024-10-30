export const getEmployeeDataByEmail = async (username: string) => {
    try {
        const response = await fetch(`https://54.251.20.155.nip.io/api/employee/email/${username}`, {
      method: 'GET', // Fetch defaults to GET, so this is optional
    }); 

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

export const getEmployeeFullNameByStaffID = async (staffID: string) => {
  try {
    const response = await fetch(`https://54.251.20.155.nip.io/api/employee/name/${staffID}`, {
      method: 'GET', // Fetch defaults to GET, so this is optional
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve employee name data. Status: ${response.status}`);
    };

    const data = await response.json(); // Parse the JSON response
    return data; // Return the employee name data
    }
    catch (error) {
        console.log(error)
        console.error(error)
        throw new Error("An error occurred while fetching employee name data.");
    }
}

