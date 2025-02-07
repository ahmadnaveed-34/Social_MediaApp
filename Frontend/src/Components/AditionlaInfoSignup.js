import React, { useContext, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Avatar from "../Images/Avatar.jpeg";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faForward } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

import vividlyContext from "../Context/vividlyContext";
import Alert from "./Alert";

const AditionlaInfoSignup = ({ userInfo }) => {
  const ENDPOINT = process.env.REACT_APP_ENDPOINT;
  const context = useContext(vividlyContext);
  const { addAdditionalInfo, skipAdditionalInfo } = context;
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [gender, setGender] = useState("");
  const [error, setError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [image, setImage] = useState(Avatar);

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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return showAlert("error", "Please upload an Image!");
    }

    const formdata = new FormData();
    formdata.append("image", file);

    try {
      const data = await fetch(`${ENDPOINT}/api/user/signupPic`, {
        method: "POST",
        body: formdata,
      });
      const response = await data.json();
      if (response.success) {
        setImage(response.url);
        return showAlert("success", "Image uploaded!");
      } else {
        return showAlert("error", "Failed to upload Image!");
      }
    } catch {
      return showAlert("error", "Failed to upload Image!");
    }
  };

  const [loading, setLoading] = useState(false);

  const handleSkipStep = async () => {
    const formData = new FormData();

    const response = await fetch(Avatar);
    const blob = await response.blob();
    const avatarFile = new File([blob], "Avatar.png", { type: "image/png" });
    formData.append("image", avatarFile);

    try {
      const data = await fetch(`${ENDPOINT}/api/user/signupPic`, {
        method: "POST",
        body: formData,
      });
      const response = await data.json();
      const addData = await skipAdditionalInfo(response.url, userInfo.userName);
      if (addData.success) {
        navigate("/home");
      }
    } catch {
      return showAlert("error", "Failed to upload Image!");
    }
  };

  const handleAddInfo = async (e) => {
    e.preventDefault();
    if (!gender) {
      setError(true);
      return;
    }
    if (selectedDate === null) {
      setDateError(true);
      return;
    }
    setError(false);
    setLoading(true);

    const min_Age = 12;
    const today = new Date();
    const birthDate = selectedDate;
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
      setLoading(false);
      return showAlert("error", "You must be at least 12 years old.");
    } else {
      const response = await addAdditionalInfo(
        image,
        selectedDate,
        gender,
        userInfo.userName
      );
      if (response.success) {
        navigate("/home");
      }
      setLoading(false);
    }
  };

  return (
    <>
      <div className="h-[24px]">
        <Alert alert={alert} />
      </div>
      <div className="grid h-20 sm:h-24 grid-cols-2 mb-4">
        <div>
          <label
            htmlFor="profileImage"
            className="block mb-2 text-sm sm:text-base font-bold text-gray-900"
          >
            Upload Profile Picture
          </label>
          <input
            type="file"
            id="profileImage"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-[75%] sm:w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
          />
        </div>
        <div className="flex justify-end">
          <img
            src={image}
            alt="Profile Preview"
            className="h-24 w-24 rounded-full object-cover"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <div>
          <label
            htmlFor="dob"
            className="block mb-1 text-sm font-bold text-gray-900"
          >
            Date of Birth
          </label>
          <input
            type="date"
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            onFocus={(e) => e.target.showPicker && e.target.showPicker()}
            className="w-full p-2 border border-gray-300 rounded-lg text-black"
            required
          />
          <div className="h-10 mt-2">
            {dateError && (
              <p className="text-red-500 text-sm">
                Please select your date of birth!
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 sm:mt-0">
          <label className="block mb-2 text-sm font-bold text-black">
            Gender
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center text-black">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={gender === "male"}
                onChange={() => setGender("male")}
                className="mr-2"
              />
              Male
            </label>
            <label className="flex items-center text-black">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={gender === "female"}
                onChange={() => setGender("female")}
                className="mr-2"
              />
              Female
            </label>
          </div>
          <div className="h-8 mt-2">
            {error && (
              <p className="text-red-500 text-sm">Please select your gender!</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-2">
        <button
          type="button"
          onClick={handleSkipStep}
          className="bg-gray-300 text-black py-2 px-6 rounded-lg hover:bg-gray-400"
        >
          Skip <FontAwesomeIcon icon={faForward} />
        </button>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
          onClick={handleAddInfo}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Info"}
        </button>
      </div>
    </>
  );
};

export default AditionlaInfoSignup;
