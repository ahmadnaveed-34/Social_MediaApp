import React from "react";
import { useContext, useState } from "react";
import vividlyContext from "../Context/vividlyContext";
import Alert from "./Alert";

const OTPVerificationForForgotPass = ({
  email,
  password,
  setStep,
  setActiveTab,
  setTimeLeft,
  setForgotEmail,
  setForgotNewPass,
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

  const context = useContext(vividlyContext);
  const { verifyOTPFORForgoPass } = context;
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
    const response = await verifyOTPFORForgoPass(email, password, JoinOtp);
    if (response.success) {
      setForgotNewPass("");
      setForgotEmail("");
      setStep(1);
      setActiveTab("tab2");
    } else {
      showAlert("error", "Invalid or expired OTP!");
    }
  };
  return (
    <>
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
          <p className="text-red-500 text-sm">Please enter 6 digit OTP!</p>
        )}
      </div>
      <div className="flex justify-center gap-4">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => {
            setStep(4);
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
    </>
  );
};

export default OTPVerificationForForgotPass;
