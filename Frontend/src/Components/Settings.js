import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import vividlyContext from "../Context/vividlyContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import Avatar from "../Images/Avatar.jpeg";
import OTPVerification from "./OTPVerification";
import Alert from "./Alert";
import SkeletonLoader from "./SkeletonLoader";

const Settings = ({ setUpdateTheme }) => {
  const theme2 = JSON.parse(localStorage.getItem("theme"));
  const navigate = useNavigate();
  const context = useContext(vividlyContext);
  const { sendOTPForUpdSettings, verifyOTPFORUpdSettings, changeTheme } =
    context;
  const ENDPOINT = process.env.REACT_APP_ENDPOINT;
  const [step, setStep] = useState(1);

  const [showSkeleton, setShowSkeleton] = useState(false);
  const [countLoading, setCountLoading] = useState(0);
  const [themeLoading, setThemeLoading] = useState(false);

  const [uSetting, setUSetting] = useState("");
  const userSetting = async () => {
    if (countLoading === 0) {
      setShowSkeleton(true);
    }
    const id = localStorage.getItem("id");
    const parsedId = JSON.parse(id);

    const token = localStorage.getItem("token");
    const parsedToken = JSON.parse(token);

    try {
      const response = await fetch(
        `${ENDPOINT}/api/user/userSetting/${parsedId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setUSetting(data);
      } else {
        console.log("Error");
      }
      setCountLoading(1);
      setShowSkeleton(false);
    } catch (error) {
      console.log("Error:", error.message);
      setCountLoading(1);
      setShowSkeleton(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    userSetting();
  }, [isModalOpen, themeLoading]);

  const [updSettings, setUpdSettings] = useState({
    fullName: "",
    password: "",
    gender: "",
    dob: "",
    picture: "",
  });

  const handleSettingsOnChange = (e) => {
    setUpdSettings({
      ...updSettings,
      [e.target.name]: e.target.value,
    });
  };
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formdata = new FormData();
      formdata.append("image", file);
      try {
        const data = await fetch(`${ENDPOINT}/api/user/signupPic`, {
          method: "POST",
          body: formdata,
        });
        const response = await data.json();
        if (response.success) {
          setUpdSettings({ ...updSettings, picture: response.url });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleOpenModelFunc = () => {
    setUpdSettings({
      fullName: uSetting.moreUserDetails.fullName,
      password: uSetting.settings.password,
      gender: uSetting.moreUserDetails.gender,
      dob: uSetting.moreUserDetails.DOB,
      picture: uSetting.moreUserDetails.picture,
    });

    setIsModalOpen(true);
  };

  const [passError, showPassError] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    const min_Age = 12;
    const today = new Date();
    const birthDate = new Date(updSettings.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    if (
      month < birthDate.getMonth() ||
      (month === birthDate.getMonth() && day < birthDate.getDate())
    ) {
      age--;
    }
    if (age < min_Age) {
      return showAlert("error", "You must be at least 12 years old.");
    }
    if (updSettings.password.trim().length < 6) {
      return showPassError(true);
    }
    await sendOTPForUpdSettings(uSetting.moreUserDetails.email);
    setStep(2);
  };

  const [timeLeft, setTimeLeft] = useState(3600);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

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

  const [showerror, setShowError] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleChange = (e, index) => {
    const newOtp = [...otp];
    newOtp[index] = e.target.value.slice(0, 1);
    setOtp(newOtp);

    if (e.target.value) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "") {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const JoinOtp = otp.join("");
    if (JoinOtp.length < 6) {
      setShowError(true);
      return;
    }
    const response = await verifyOTPFORUpdSettings(
      updSettings.fullName,
      uSetting.moreUserDetails.email,
      updSettings.password,
      updSettings.gender,
      updSettings.dob,
      updSettings.picture,
      JoinOtp
    );

    if (response.success) {
      setStep(1);
      showPassError(false);
      setOtp(["", "", "", "", "", ""]);

      setIsModalOpen(false);
      setTimeLeft(3600);
    } else {
      showAlert("error", "Invalid or expired OTP!");
    }
  };

  const handleChangeTheme = async () => {
    setThemeLoading(true);
    const response = await changeTheme();
    if (response.success) {
      localStorage.setItem("theme", JSON.stringify(response.updateTheme.theme));
      setUpdateTheme(Math.random() * 10000);
    }
    setThemeLoading(false);
  };

  return (
    <div
      className={`min-h-screen ${
        theme2 === "dark" ? "bg-gray-900" : "bg-white"
      } sm:pl-72 sm:pt-24 max-w-8xl mx-auto p-6`}
    >
      {showSkeleton && <SkeletonLoader />}
      {!showSkeleton && (
        <>
          {uSetting && (
            <>
              {/* Account Settings */}
              <div
                className={`p-6 ${
                  theme2 === "dark"
                    ? "bg-gray-800 border border-white"
                    : "bg-white"
                } shadow-lg rounded-lg max-w-8xl mx-auto mb-4`}
              >
                <h2
                  className={`text-2xl font-bold ${
                    theme2 === "dark" ? "text-white" : "text-gray-800"
                  } mb-6`}
                >
                  User Settings
                </h2>
                <div className="flex items-center mb-4">
                  <img
                    src={uSetting.moreUserDetails.picture || Avatar}
                    alt="Profile"
                    className={`w-20 h-20 ${
                      theme2 === "dark" ? "border-2 border-gray-500" : ""
                    } rounded-full border`}
                  />
                  <FontAwesomeIcon
                    icon={faEdit}
                    className={`ml-4 cursor-pointer text-xl ${
                      theme2 === "dark" ? "text-gray-200" : "text-gray-500"
                    }  hover:text-blue-500`}
                    onClick={handleOpenModelFunc}
                  />
                </div>

                <p
                  className={`${
                    theme2 === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  <strong
                    className={`${
                      theme2 === "dark" ? "text-white font-bold" : "text-black"
                    }`}
                  >
                    Full Name:{"  "}
                  </strong>
                  {uSetting.moreUserDetails.fullName}
                </p>
                <p
                  className={`${
                    theme2 === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  <strong
                    className={`${
                      theme2 === "dark" ? "text-white font-bold" : "text-black"
                    }`}
                  >
                    Username:{"  "}
                  </strong>
                  {uSetting.moreUserDetails.userName}
                </p>
                <p
                  className={`${
                    theme2 === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  <strong
                    className={`${
                      theme2 === "dark" ? "text-white font-bold" : "text-black"
                    }`}
                  >
                    Password:{"  "}
                  </strong>
                  {"*".repeat(uSetting.settings.password.length)}
                </p>

                <p
                  className={`${
                    theme2 === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  <strong
                    className={`${
                      theme2 === "dark" ? "text-white font-bold" : "text-black"
                    }`}
                  >
                    Gender:{" "}
                  </strong>
                  {uSetting.moreUserDetails.gender.charAt(0).toUpperCase() +
                    uSetting.moreUserDetails.gender.slice(1)}
                </p>
                <p
                  className={`${
                    theme2 === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  <strong
                    className={`${
                      theme2 === "dark" ? "text-white font-bold" : "text-black"
                    }`}
                  >
                    Date of Birth:{" "}
                  </strong>

                  {uSetting.moreUserDetails.DOB !== null
                    ? new Date(
                        uSetting.moreUserDetails.DOB
                      ).toLocaleDateString()
                    : "No set!"}
                </p>

                {isModalOpen && (
                  <div
                    className={`fixed inset-0 p-3 flex items-center justify-center bg-black bg-opacity-50 z-50`}
                  >
                    <div
                      className={`${
                        theme2 === "dark" ? "bg-gray-900" : "bg-white"
                      } p-6 rounded-lg shadow-lg w-96 sm:w-[400px] relative z-50`}
                    >
                      <h3
                        className={`text-lg font-semibold ${
                          theme2 === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        Edit Profile
                      </h3>
                      <form
                        className="max-h-[85vh] overflow-y-auto p-2"
                        onSubmit={handleSendOTP}
                      >
                        {step === 1 && (
                          <>
                            <div className="h-[26px] mt-[-10px]">
                              <Alert alert={alert} />
                            </div>
                            <label
                              className={`block mb-1 ${
                                theme2 === "dark" ? "text-white" : "text-black"
                              }`}
                            >
                              Full Name
                            </label>
                            <input
                              type="text"
                              name="fullName"
                              value={updSettings.fullName}
                              onChange={handleSettingsOnChange}
                              className={`w-full border p-2 rounded mb-2 ${
                                theme2 === "dark"
                                  ? "text-white bg-gray-800 border border-white"
                                  : "text-gray-800"
                              } `}
                            />
                            <label
                              className={`block mb-1 ${
                                theme2 === "dark" ? "text-white" : "text-black"
                              }`}
                            >
                              New Password
                            </label>
                            <input
                              type="password"
                              name="password"
                              defaultValue={uSetting.settings.password}
                              onChange={handleSettingsOnChange}
                              className={`w-full border p-2 rounded mb-2 ${
                                theme2 === "dark"
                                  ? "text-white bg-gray-800 border border-white"
                                  : "text-gray-800"
                              } `}
                            />
                            <div className="h-1">
                              {passError && (
                                <span className="flex justify-end text-sm text-red-600">
                                  Password must be atleast 6 digit!
                                </span>
                              )}
                            </div>

                            {/* Gender */}
                            <label
                              className={`block mb-1 ${
                                theme2 === "dark" ? "text-white" : "text-black"
                              }`}
                            >
                              Gender
                            </label>
                            {uSetting.moreUserDetails.gender === "Not Set" ? (
                              <select
                                name="gender"
                                value={uSetting.settings.gender}
                                onChange={handleSettingsOnChange}
                                className={`w-full border p-2 rounded mb-2 ${
                                  theme2 === "dark"
                                    ? "text-white bg-gray-800 border border-white"
                                    : "text-gray-800"
                                } `}
                              >
                                <option value="Not Set">Not set</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            ) : (
                              <select
                                name="gender"
                                value={uSetting.settings.gender}
                                onChange={handleSettingsOnChange}
                                className={`w-full border p-2 rounded mb-2 ${
                                  theme2 === "dark"
                                    ? "text-white bg-gray-800 border border-white"
                                    : "text-gray-800"
                                } `}
                              >
                                <option
                                  value={
                                    uSetting.moreUserDetails.gender ===
                                      "Male" ||
                                    uSetting.moreUserDetails.gender === "male"
                                      ? "Male"
                                      : "Female"
                                  }
                                >
                                  {uSetting.moreUserDetails.gender === "Male" ||
                                  uSetting.moreUserDetails.gender === "male"
                                    ? "Male"
                                    : "Female"}
                                </option>
                                <option
                                  value={
                                    uSetting.moreUserDetails.gender ===
                                      "Male" ||
                                    uSetting.moreUserDetails.gender === "male"
                                      ? "Female"
                                      : "Male"
                                  }
                                >
                                  {uSetting.moreUserDetails.gender === "Male" ||
                                  uSetting.moreUserDetails.gender === "male"
                                    ? "Female"
                                    : "Male"}
                                </option>
                              </select>
                            )}

                            {/* Date of Birth */}
                            <label
                              className={`block mb-1 ${
                                theme2 === "dark" ? "text-white" : "text-black"
                              }`}
                            >
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              name="dob"
                              value={
                                updSettings.dob
                                  ? new Date(updSettings.dob)
                                      .toISOString()
                                      .split("T")[0]
                                  : ""
                              }
                              onChange={handleSettingsOnChange}
                              className={`w-full border p-2 rounded mb-2 ${
                                theme2 === "dark"
                                  ? "text-white bg-gray-800 border border-white"
                                  : "text-gray-800"
                              } `}
                              onFocus={(e) =>
                                e.target.showPicker && e.target.showPicker()
                              }
                            />

                            {/* Profile Picture */}
                            <label
                              className={`block mb-1 ${
                                theme2 === "dark" ? "text-white" : "text-black"
                              }`}
                            >
                              Profile Picture
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              name="picture"
                              onChange={(e) => {
                                handleSettingsOnChange(e);
                                handleImageChange(e);
                              }}
                              className={`w-full border rounded mb-4 ${
                                theme2 === "dark"
                                  ? "text-white bg-gray-800 border border-white"
                                  : "text-gray-800"
                              } `}
                            />

                            {/* Buttons */}
                            <div className="flex justify-end">
                              <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                              >
                                Verify Changes
                              </button>
                              <button
                                onClick={() => {
                                  setIsModalOpen(false);
                                  showPassError(false);
                                }}
                                type="button"
                                className={`ml-4 ${
                                  theme2 === "dark"
                                    ? "bg-gray-500 hover:bg-gray-600"
                                    : "bg-gray-400 hover:bg-gray-500"
                                }  text-white px-4 py-2 rounded `}
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        )}

                        {step === 2 && (
                          <>
                            {/* Timer Section */}
                            <div className="flex justify-end mx-3 mt-2">
                              <p
                                className={`text-lg font-semibold ${
                                  timeLeft <= 500
                                    ? "text-red-500"
                                    : `${
                                        theme2 === "dark"
                                          ? "text-gray-200"
                                          : "text-gray-700"
                                      }`
                                }`}
                              >
                                OTP Expires in:{" "}
                                <span className="font-semibold">
                                  {formatTime(timeLeft)}
                                </span>
                              </p>
                            </div>
                            <div className="mt-1">
                              <h4
                                className={`text-2xl font-semibold ${
                                  theme2 === "dark"
                                    ? "text-white"
                                    : "text-black"
                                }  mb-2`}
                              >
                                Verify Your OTP
                              </h4>
                              <p
                                className={`${
                                  theme2 === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-600"
                                }`}
                              >
                                Please enter the 6-digit OTP sent to your email
                                to update your information.
                              </p>

                              <div className="h-[26px] mb-2">
                                <Alert alert={alert} />
                              </div>
                              <div className="flex space-x-2">
                                {otp.map((digit, index) => (
                                  <input
                                    key={index}
                                    id={`otp-input-${index}`}
                                    type="password"
                                    value={digit}
                                    maxLength="1"
                                    required
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="h-9 w-9 lmd:w-12 lmd:h-12 text-center border border-gray-300 rounded-md text-xl text-black"
                                  />
                                ))}
                              </div>
                              <div className="h-10 mt-2">
                                {showerror && (
                                  <p className="text-red-500 text-sm">
                                    Please enter 6 digit OTP!
                                  </p>
                                )}
                              </div>
                              <div className="flex justify-center gap-4">
                                {/* Back Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStep(1);
                                    setTimeLeft(3600);
                                  }}
                                  className="bg-gray-300 text-black font-medium py-2 px-6 rounded-lg hover:bg-gray-400 transition-all duration-300"
                                >
                                  ← Back
                                </button>

                                {/* Verify Button */}
                                <button
                                  type="submit"
                                  onClick={handleVerifyOTP}
                                  className="bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300"
                                >
                                  Verify OTP
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </form>
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Settings */}
              <div
                className={`${
                  theme2 === "dark"
                    ? "bg-gray-800 border border-white"
                    : "bg-white"
                } p-6 rounded-lg shadow-md mb-6`}
              >
                <h2
                  className={`text-xl font-semibold mb-4 ${
                    theme2 === "dark" ? "text-white" : "text-black"
                  }`}
                >
                  General Settings
                </h2>
                <div className="flex items-center justify-between">
                  <label
                    className={`${
                      theme2 === "dark" ? "text-white" : "text-black"
                    } text-xl`}
                  >
                    Theme
                  </label>

                  <button
                    onClick={handleChangeTheme}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    {themeLoading
                      ? "Applying theme..."
                      : `Switch to ${
                          uSetting.settings.theme === "dark"
                            ? "Light Mode"
                            : "Dark Mode"
                        }`}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Settings;
