import React, { useContext, useEffect, useState } from "react";
import vividlyContext from "../Context/vividlyContext";
import SkeletonLoader from "./SkeletonLoader";
import { useNavigate } from "react-router-dom";

const UserFollowingPage = () => {
  const theme = JSON.parse(localStorage.getItem("theme"));
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [countLoading, setCountLoading] = useState(0);
  const id = localStorage.getItem("id");
  const parsedId = JSON.parse(id);
  const ENDPOINT = process.env.REACT_APP_ENDPOINT;
  const navigate = useNavigate();

  const [isFollow, setIsFollow] = useState({});
  const [loading, setLoading] = useState({});

  const context = useContext(vividlyContext);
  const { fetchUserFollowingList } = context;

  const [followingList, setFollowingList] = useState([]);

  const handleUserFollowingListFunc = async () => {
    if (countLoading === 0) {
      setShowSkeleton(true);
    }
    const response = await fetchUserFollowingList();
    if (response.success) {
      setFollowingList(response.userData);
    }
    setCountLoading(1);
    setShowSkeleton(false);
  };

  useEffect(() => {
    handleUserFollowingListFunc();
  }, [loading]);

  const handleFollowUnFollow = async (uId) => {
    try {
      setLoading({ ...loading, [uId]: true });

      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);

      const response = await fetch(
        `${ENDPOINT}/api/user/followUser/${parsedId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
          body: JSON.stringify({ user: uId }),
        }
      );
      const data = await response.json();
      if (data.message === "Successfully unfollowed the user.") {
        setIsFollow({ ...isFollow, [uId]: true });
      } else {
        setIsFollow({ ...isFollow, [uId]: false });
      }

      setLoading({ ...loading, [uId]: false });
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const handSearchUser = (uId) => {
    localStorage.setItem("sUserId", JSON.stringify(uId));
    navigate("/searchUser");
  };

  return (
    <div
      className={`min-h-screen sm:pl-72 sm:pt-28 max-w-8xl mx-auto p-6 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      } bg-gray-50`}
    >
      {showSkeleton && <SkeletonLoader />}
      {!showSkeleton && (
        <>
          <h1
            className={`text-3xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-800"
            } mb-6`}
          >
            Following
          </h1>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {followingList.map((user) => (
              <div
                key={user._id}
                className={`${
                  theme === "dark"
                    ? "bg-gray-800 border border-white"
                    : "bg-white"
                } shadow-md rounded-lg p-4 flex flex-col items-center space-y-3`}
              >
                <img
                  src={user.picture}
                  alt="failed to load img!"
                  className={`w-16 h-16 rounded-full ${
                    theme === "dark" ? "border-2 border-gray-400" : ""
                  } object-cover hover:cursor-pointer`}
                  onClick={() => handSearchUser(user._id)}
                />
                <div className="text-center">
                  <h3
                    className={`text-lg font-semibold ${
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    } hover:cursor-pointer`}
                    onClick={() => handSearchUser(user._id)}
                  >
                    {user.fullName}
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    } hover:cursor-pointer`}
                    onClick={() => handSearchUser(user._id)}
                  >
                    @{user.userName}
                  </p>
                </div>
                <button
                  onClick={() => handleFollowUnFollow(user._id)}
                  className={`px-4 py-2 ${
                    !isFollow[user._id]
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  }  text-white font-semibold rounded-lg shadow  transition`}
                >
                  {loading[user._id] ? (
                    <div className="flex items-center justify-center">
                      <span className="ml-2">Loading...</span>
                    </div>
                  ) : isFollow[user._id] ? (
                    "Follow"
                  ) : (
                    "UnFollow"
                  )}
                </button>
              </div>
            ))}
          </div>
          {followingList.length === 0 && (
            <div
              className={`text-center mt-10 ${
                theme === "dark" ? "text-gray-200" : "text-gray-700"
              } text-lg`}
            >
              You are not following anyone at the moment.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserFollowingPage;
