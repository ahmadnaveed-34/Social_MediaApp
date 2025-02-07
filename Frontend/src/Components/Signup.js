import React, { useState } from "react";
import Alert from "./Alert";

const Signup = ({
  userInfo,
  setUserInfo,
  sendOtp,
  chkUserNameExists,
  setStep,
}) => {
  const [alert, setAlert] = useState(null);
  const showAlert = (type, msg) => {
    setAlert({
      type: type,
      msg: msg,
    });
    setTimeout(() => {
      setAlert("");
    }, 2000);
  };

  const handleOnChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };
  const [disableBtn, setDisabledBtn] = useState(false);
  const handleBothChange = async (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });

    const response = await chkUserNameExists(e.target.value);
    if (response.success) {
      setDisabledBtn(false);
    } else if (
      response.success === false &&
      response.message === "Username is already taken!"
    ) {
      setDisabledBtn(true);
    }
  };
  const [loading, setLoading] = useState(false);
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (
      !userInfo.fullName ||
      !userInfo.userName ||
      !userInfo.email ||
      !userInfo.password
    ) {
      return showAlert("error", "Please fill all required field!");
    }
    if (userInfo.password.trim().length < 6) {
      return showAlert("error", "Password must be at least 6 characters long!");
    } else if (userInfo.userName.trim().length < 8) {
      return showAlert("error", "Username must be at least 8 characters long!");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(userInfo.email)) {
      setLoading(true);
      const response = await sendOtp(userInfo.email);
      if (response.success) {
        setStep(2);
      } else {
        showAlert("error", "Email is already registered!");
        setLoading(false);
      }
    } else {
      showAlert("error", "Invalid Email format!");
      setLoading(false);
    }
    setLoading(false);
  };
  return (
    <>
      <div>
        <div className="h-[26px]">
          <Alert alert={alert} />
        </div>

        <div className="mb-2">
          <label
            htmlFor="fullName"
            className="block mb-2 text-sm font-bold text-gray-900 dark:text-white"
          >
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            autoComplete="off"
            value={userInfo.fullName}
            onChange={handleOnChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="userName"
            className="block mb-2 text-sm font-bold text-gray-900 dark:text-white"
          >
            Username
          </label>
          <input
            type="text"
            name="userName"
            id="userName"
            autoComplete="off"
            value={userInfo.userName}
            onChange={handleBothChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Username must be unique"
            required
          />
          <div className="h-3">
            {disableBtn && (
              <p className="text-red-600 text-sm text-end">
                Username already taken!
              </p>
            )}
          </div>
        </div>
        <div className="mb-2">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-bold text-gray-900 dark:text-white"
          >
            Your email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            autoComplete="off"
            value={userInfo.email}
            onChange={handleOnChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="name@gmail.com"
            required
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-bold text-gray-900 dark:text-white"
          >
            Your password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={userInfo.password}
            onChange={handleOnChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          onClick={handleSendOTP}
          className={` ${
            disableBtn
              ? "bg-green-700 text-white"
              : "text-white bg-success dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 hover:bg-green-600 focus:ring-2 focus:outline-none focus:ring-green-900"
          }  font-bold rounded-lg text-sm w-full  px-5 py-2.5 text-center `}
          disabled={disableBtn || loading}
        >
          {disableBtn
            ? "Choose a unique username to complete signup."
            : loading
            ? "Processing your signup request..."
            : "Sign up"}
        </button>
      </div>
    </>
  );
};

export default Signup;
