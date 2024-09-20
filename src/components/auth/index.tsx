import { toast } from "react-toastify";
import React, { useState } from "react";
import { useRouter } from "next/router";
export function Auth() {
  const userTypes = ["--select--", "HR", "Director", "Manager", "Employee"];
  const [username, setUsername] = useState<string>("");
  const [userType, setUserType] = useState("");
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "username") {
      setUsername(value);
    } else if (name === "userType") {
      setUserType(value);
    }
  };

  const router = useRouter();
  const submitForm = async (username: string, userType: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("success");
      }, 2000);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (username.trim() === "" || userType === "") {
      toast.error("Please fill in all fields");
    } else {
      try {
        submitForm(username, userType);
        localStorage.setItem("userType", userType);
        router.push("/schedule");
      } catch (error) {
        toast.error("An error occurred during submission");
      }
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center align-middle py-12 sm:px-6 lg:px-8">
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white border-solid border-1 border-border-300 px-6 py-12 shadow-lg sm:rounded-lg sm:px-12">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>
          <form className="space-y-6 mt-10" action="#" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium leading-6 text-black"
              >
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  onChange={handleChange}
                  value={username}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-primary-500 focus:ring-inset sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="flex flex-col w-full text-black">
              Select your User Type
              <span className="text-red-600">*</span>
              <select
                name="userType"
                value={userType}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm hover:border-aion-primary-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">--Select--</option>
                {userTypes.map((uTypes) => (
                  <option key={uTypes} value={uTypes}>
                    {uTypes}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full bg-background text-text dark:bg-dark-background dark:text-dark-text justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
