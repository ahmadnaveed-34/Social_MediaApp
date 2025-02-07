import React, { useContext, useEffect, useState } from "react";
import Signup from "./Signup";
import Login from "./Login";
import OTPVerification from "./OTPVerification";
import AditionlaInfoSignup from "./AditionlaInfoSignup";
import vividlyContext from "../Context/vividlyContext";
import Alert from "./Alert";
import OTPVerificationForForgotPass from "./OTPVerificationForForgotPass";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("tab1");
  const [websiteName, setWebsiteName] = useState("");
  const [loading, setLoading] = useState(false);

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

  const [userInfo, setUserInfo] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
  });

  const context = useContext(vividlyContext);
  const { sendOtp, login, chkUserNameExists, sendOTPForgotPass } = context;

  const [step, setStep] = useState(1);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const handleforgotEmailChange = (e) => {
    setForgotEmail(e.target.value);
  };
  const handleforgotPassChange = (e) => {
    setForgotNewPass(e.target.value);
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (forgotNewPass.trim() === "") {
      showAlert("error", "Please enter a new password.");
      return;
    } else if (forgotNewPass.trim().length < 6) {
      return showAlert("error", "Password must be at least 6 characters long!");
    }
    setLoading(true);
    const response = await sendOTPForgotPass(forgotEmail);
    if (response.success) {
      setStep(5);
      setLoading(false);
    } else if (response.message === "Please provide email!") {
      showAlert("error", "Please provide email!");
      setLoading(false);
    } else {
      showAlert("error", "Invalid email!");
      setLoading(false);
    }
  };

  useEffect(() => {
    const name = process.env.REACT_APP_WEBSITE_NAME;
    let index = 0;
    let direction = 1;

    setInterval(() => {
      setWebsiteName(name.slice(0, index));
      index += direction;

      if (index > name.length) {
        direction = -1;
        index = name.length;
      } else if (index < 0) {
        direction = 1;
        index = 0;
      }
    }, 300);
  }, []);

  return (
    <>
      <div className="authPageBG">
        <div className="min-h-screen flex justify-center items-center">
          <form className="border-2 smd:w-[90vw] sm:w-[70vw] md:w-[55vw] lg:w-[40vw] max-h-[94vh] overflow-y-auto border-black bg-white rounded-lg p-5 boxShadow">
            <div className="flex justify-center mt-3 h-12">
              <h3 className="custom-font text-4xl text-black font-bold">
                {websiteName}
              </h3>
            </div>
            {step === 1 && (
              <>
                {/* Conditional Tab Display */}
                {(step !== 4 || step !== 5) && (
                  <div role="tablist" className="tabs mt-4 flex">
                    {/* Signup Tab */}
                    <button
                      type="button"
                      role="tab"
                      className={`tab w-1/2 h-9 text-center text-xl rounded-md ${
                        activeTab === "tab1"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                      aria-selected={activeTab === "tab1"}
                      onClick={() => setActiveTab("tab1")}
                    >
                      Signup
                    </button>

                    {/* Login Tab */}
                    <button
                      type="button"
                      role="tab"
                      className={`tab w-1/2 h-9 text-center text-xl rounded-md ${
                        activeTab === "tab2"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                      aria-selected={activeTab === "tab2"}
                      onClick={() => setActiveTab("tab2")}
                    >
                      Login
                    </button>
                  </div>
                )}

                {/* Tab Content */}
                <div className="mt-4">
                  {activeTab === "tab1" ? (
                    <div role="tabpanel">
                      <Signup
                        userInfo={userInfo}
                        setUserInfo={setUserInfo}
                        sendOtp={sendOtp}
                        chkUserNameExists={chkUserNameExists}
                        step={step}
                        setStep={setStep}
                      />
                    </div>
                  ) : (
                    <div role="tabpanel">
                      <Login login={login} setStep={setStep} />
                    </div>
                  )}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {/* Timer Section */}
                <div className="flex justify-end mx-3 mt-2">
                  <p
                    className={`text-lg font-semibold ${
                      timeLeft <= 500 ? "text-red-500" : "text-gray-700"
                    }`}
                  >
                    OTP Expires in:{" "}
                    <span className="font-semibold">
                      {formatTime(timeLeft)}
                    </span>
                  </p>
                </div>
                <div className="mt-1">
                  <h4 className="text-2xl font-semibold text-black mb-2">
                    Verify Your OTP
                  </h4>
                  <p className="text-gray-600">
                    Please enter the 6-digit OTP sent to your registered email.
                  </p>

                  <OTPVerification
                    userInfo={userInfo}
                    step={step}
                    setStep={setStep}
                    setTimeLeft={setTimeLeft}
                  />
                </div>
              </>
            )}
            {step === 3 && (
              <div className="mt-5">
                <h4 className="text-xl font-semibold text-black">
                  Add your additional info
                </h4>
                <AditionlaInfoSignup userInfo={userInfo} />
              </div>
            )}
            {step === 4 && (
              <div className="min-h-40">
                <div className="h-[26px]">
                  <Alert alert={alert} />
                </div>
                <label className="block mb-2 font-bold text-black">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={handleforgotEmailChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4 text-black"
                />
                <label className="block mb-2 font-bold text-black">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={forgotNewPass}
                  onChange={handleforgotPassChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4 text-black"
                />
                <button
                  className="bg-green-600 text-white p-2.5 w-full hover:bg-green-700 transition-transform duration-200 rounded-md mb-4"
                  onClick={handleVerifyEmail}
                  disabled={loading}
                >
                  {loading ? "Verifying email..." : "Verify Email"}
                </button>

                {/* Back Button */}
                <button
                  onClick={() => {
                    setActiveTab("tab2");
                    setStep(1);
                    setForgotEmail("");
                    setForgotNewPass("");
                  }}
                  className="text-gray-700 font-semibold flex items-center space-x-2 hover:text-gray-900 transition-all duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M15.75 19.5a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.06 12l6.69 6.69a.75.75 0 010 1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-1">Go Back</span>
                </button>
              </div>
            )}
            {step === 5 && (
              <>
                {/* Timer Section */}
                <div className="flex justify-end mx-3 mt-2">
                  <p
                    className={`text-lg font-semibold ${
                      timeLeft <= 500 ? "text-red-500" : "text-gray-700"
                    }`}
                  >
                    OTP Expires in:{" "}
                    <span className="font-semibold">
                      {formatTime(timeLeft)}
                    </span>
                  </p>
                </div>
                <div className="mt-1">
                  <h4 className="text-2xl font-semibold text-black mb-2">
                    Verify Your OTP
                  </h4>
                  <p className="text-gray-600">
                    Please enter the 6-digit OTP sent to your registered email.
                  </p>

                  <OTPVerificationForForgotPass
                    email={forgotEmail}
                    password={forgotNewPass}
                    setStep={setStep}
                    setActiveTab={setActiveTab}
                    setTimeLeft={setTimeLeft}
                    setForgotEmail={setForgotEmail}
                    setForgotNewPass={setForgotNewPass}
                  />
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default AuthPage;
