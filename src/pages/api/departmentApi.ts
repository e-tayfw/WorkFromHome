export const getDepartmentList = async () => {
    try {
        const response = await fetch(`http://127.0.0.1:8085/api/generateHRScheduleByDepartment`, {
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
