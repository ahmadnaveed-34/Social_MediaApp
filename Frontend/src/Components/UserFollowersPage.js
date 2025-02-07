import React, { useContext, useEffect, useState } from "react";
import vividlyContext from "../Context/vividlyContext";
import SkeletonLoader from "./SkeletonLoader";
import { useNavigate } from "react-router-dom";
import CustomConfirm from "./CustomConfirm";

const UserFollowersPage = () => {
  const theme = JSON.parse(localStorage.getItem("theme"));
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [countLoading, setCountLoading] = useState(0);
  const navigate = useNavigate();

  const context = useContext(vividlyContext);
  const { fetchUserFollowersList, removeFollower } = context;

  const [followersList, setFollowersList] = useState([]);

  const [removeFollowerUname, setRemoveFollowerUname] = useState("");

  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const handleCancelDelete = () => {
    setShowConfirmRemove(false);
  };

  const handleUserFollowersListFunc = async () => {
    if (countLoading === 0) {
      setShowSkeleton(true);
    }
    const response = await fetchUserFollowersList();
    if (response.success) {
      setFollowersList(response.fetchFolloweruData);
    }
    setCountLoading(1);
    setShowSkeleton(false);
  };

  const [loading, setLoading] = useState({});

  const handleRemoveFollowerFunc = async (followerUname) => {
    setLoading((prevLoading) => ({ ...prevLoading, [followerUname]: true }));
    setShowConfirmRemove(false);
    const response = await removeFollower(followerUname);
    if (response.success) {
      setFollowersList(
        followersList.filter((user) => user.userName !== followerUname)
      );
    }
    setLoading((prevLoading) => ({ ...prevLoading, [followerUname]: false }));
  };

  const handSearchUser = (uId) => {
    localStorage.setItem("sUserId", JSON.stringify(uId));
    navigate("/searchUser");
  };

  useEffect(() => {
    handleUserFollowersListFunc();
  }, []);

  return (
    <div
      className={`min-h-screen sm:pl-72 sm:pt-28 max-w-8xl mx-auto p-6 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      } `}
    >
      {showSkeleton && <SkeletonLoader />}
      {!showSkeleton && (
        <>
          <h1
            className={`text-3xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-800"
            } mb-6`}
          >
            Followers
          </h1>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {followersList.map((user) => (
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
                  className={`w-16 h-16 ${
                    theme === "dark" ? "border-2 border-gray-500" : ""
                  } rounded-full object-cover hover:cursor-pointer`}
                  onClick={() => handSearchUser(user._id)}
                />
                <div className="text-center">
                  <h3
                    className={`text-lg font-semibold ${
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    }  hover:cursor-pointer`}
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
                    {user.userName}
                  </p>
                </div>

                <button
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow transition"
                  disabled={loading[user.userName]}
                  onClick={() => {
                    setRemoveFollowerUname(user.userName);
                    setShowConfirmRemove(true);
                  }}
                >
                  {loading[user.userName] ? "Removing..." : "Remove Follower"}
                </button>
              </div>
            ))}
          </div>
          {showConfirmRemove && (
            <CustomConfirm
              message="Are you sure you want to remove this follower?"
              onConfirm={() => handleRemoveFollowerFunc(removeFollowerUname)}
              onCancel={handleCancelDelete}
            />
          )}

          {followersList.length === 0 && (
            <div
              className={`text-center mt-10 ${
                theme === "dark" ? "text-gray-200" : "text-gray-700"
              } text-lg`}
            >
              You don't have any followers yet!
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserFollowersPage;
