import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "./Alert";

const Login = ({ login, setStep }) => {
  const ENDPOINT = process.env.REACT_APP_ENDPOINT;
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const showAlert = (type, msg) => {
    setAlert({
      type: type,
      msg: msg,
    });
    setTimeout(() => {
      setAlert("");
    }, 2000);
  };
  const navigate = useNavigate();
  const [loginCred, setLoginCred] = useState({ email: "", password: "" });
  const handleOnChange = (e) => {
    setLoginCred({ ...loginCred, [e.target.name]: e.target.value });
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginCred.email || !loginCred.password) {
      return showAlert("error", "Please fill all required fields!");
    }
    setLoading(true);
    const response = await login(loginCred.email, loginCred.password);
    if (response.success) {
      const themeResponse = await fetch(
        `${ENDPOINT}/api/user/userSetting/${response.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": response.token,
          },
        }
      );
      const themeResponseData = await themeResponse.json();

      navigate("/home");
      localStorage.setItem("id", JSON.stringify(response.id));
      localStorage.setItem("userName", JSON.stringify(response.userName));
      localStorage.setItem("token", JSON.stringify(response.token));
      localStorage.setItem(
        "theme",
        JSON.stringify(themeResponseData.settings.theme)
      );
      localStorage.setItem("postPreview", JSON.stringify(""));
      localStorage.setItem("groupId", JSON.stringify(""));
      localStorage.setItem("sUserId", JSON.stringify(""));
      setLoading(false);
    } else {
      showAlert("error", "Invalid Credentials!");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="h-[26px]">
        <Alert alert={alert} />
      </div>

      <div className="mb-3">
        <label
          htmlFor="email"
          className="block mb-2 text-sm font-bold text-gray-900 dark:text-white"
        >
          Your email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          autoComplete="off"
          onChange={handleOnChange}
          value={loginCred.email}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="name@gmail.com"
          required
        />
      </div>
      <div className="mb-3">
        <label
          htmlFor="password"
          className="block mb-2 text-sm font-bold text-gray-900 dark:text-white"
        >
          Your password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          onChange={handleOnChange}
          value={loginCred.password}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          required
        />
      </div>
      <div className="flex justify-end mb-4">
        <button
          className="text-blue-600 hover:text-blue-700 font-medium text-base underline focus:outline-none"
          onClick={() => setStep(4)}
        >
          Forgot Password?
        </button>
      </div>
      <button
        type="submit"
        onClick={handleLogin}
        className="text-white bg-success hover:bg-green-600 focus:ring-2 focus:outline-none focus:ring-green-900 font-bold rounded-lg text-sm w-full  px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
        disabled={loading}
      >
        {loading ? "Logging..." : "Login"}
      </button>
    </>
  );
};

export default Login;
