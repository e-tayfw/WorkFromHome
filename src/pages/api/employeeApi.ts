import axios from 'axios';

export const getEmployeeDataByEmail = async (username: string) => {
    try {
        const response = await axios.get(
            `https://54.251.20.155.nip.io/api/employee/email/${username}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        // Axios automatically parses JSON responses
        return response.data; // Return the employee data
    } catch (error) {
        console.error(error);

        // Handle Axios errors
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(`Failed to retrieve employee data. Status: ${error.response.status}`);
        } else {
            throw new Error("An error occurred while fetching employee data.");
        }
    }
  };

export const getEmployeeFullNameByStaffID = async (staffID: string) => {
    try {
        const response = await axios.get(
            `https://54.251.20.155.nip.io/api/employee/name/${staffID}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        // Axios automatically parses JSON responses
        return response.data; // Return the employee name data
    } catch (error) {
        console.error(error);

        // Handle Axios errors
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(`Failed to retrieve employee name data. Status: ${error.response.status}`);
        } else {
            throw new Error("An error occurred while fetching employee name data.");
        }
    }
};