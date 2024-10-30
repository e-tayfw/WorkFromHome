import axios from "axios";

export const getDepartmentList = async () => {
  try {
    const response = await axios.get(
      "https://54.251.20.155.nip.io/api/generateHRScheduleByDepartment"
    );
    return response.data; // Axios automatically parses JSON responses
  } catch (error) {
    console.error(error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `Failed to retrieve employee data. Status: ${error.response.status}`
      );
    } else {
      throw new Error("An error occurred while fetching employee data.");
    }
  }
};
