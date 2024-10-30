import axios from "axios";

export const generateOwnSchedule = async (staffId: number) => {
  try {
    const response = await axios.get(
      `https://54.251.20.155.nip.io/api/generateOwnSchedule/${staffId}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `Failed to retrieve employee schedule. Status: ${error.response.status}`
      );
    } else {
      throw new Error(
        "An error occurred while fetching employee schedule data."
      );
    }
  }
};

export const generateTeamSchedule = async (staffId: number) => {
  try {
    const response = await axios.get(
      `https://54.251.20.155.nip.io/api/generateTeamSchedule/${staffId}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `Failed to retrieve employee schedule. Status: ${error.response.status}`
      );
    } else {
      throw new Error(
        "An error occurred while fetching employee schedule data."
      );
    }
  }
};

export const generateManagerTeamSchedule = async (staffId: number) => {
  try {
    const response = await axios.get(
      `https://54.251.20.155.nip.io/api/generateTeamScheduleByManager/${staffId}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `Failed to retrieve director schedule. Status: ${error.response.status}`
      );
    } else {
      throw new Error(
        "An error occurred while fetching employee schedule data."
      );
    }
  }
};


export const generateDirectorTeamSchedule = async (staffId: number) => {
  try {
    const response = await axios.get(
      `https://54.251.20.155.nip.io/api/generateTeamScheduleByDirector/${staffId}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `Failed to retrieve director schedule. Status: ${error.response.status}`
      );
    } else {
      throw new Error(
        "An error occurred while fetching employee schedule data."
      );
    }
  }
};
