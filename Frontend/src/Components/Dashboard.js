import React, { useContext, useEffect, useState } from "react";
import vividlyContext from "../Context/vividlyContext";
import Avatar from "../Images/Avatar.jpeg";
import SkeletonLoader from "./SkeletonLoader";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const theme = JSON.parse(localStorage.getItem("theme"));
  const context = useContext(vividlyContext);
  const {
    showSuggestionFunc,
    suggestions,
    handleFetcHUserFriends,
    userFriends,
  } = context;
  const ENDPOINT = process.env.REACT_APP_ENDPOINT;
  const id = localStorage.getItem("id");
  const parsedId = JSON.parse(id);
  const [userProfile, setUserProfile] = useState("");
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [countLoading, setCountLoading] = useState(0);
  const navigate = useNavigate();

  const handlefetchUserProfile = async () => {
    const id = localStorage.getItem("id");
    const parsedId = JSON.parse(id);
    const token = localStorage.getItem("token");
    const parsedToken = JSON.parse(token);

    try {
      const response = await fetch(
        `${ENDPOINT}/api/user/getUserProfile/${parsedId}`,
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
        setUserProfile(data);
      } else {
        console.log("Error");
      }
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const [userInsights, setUserInsights] = useState("");

  const handleUserInsights = async () => {
    const id = localStorage.getItem("id");
    const parsedId = JSON.parse(id);
    const token = localStorage.getItem("token");
    const parsedToken = JSON.parse(token);

    try {
      const response = await fetch(
        `${ENDPOINT}/api/user/getUserInsights/${parsedId}`,
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
        setUserInsights(data);
      } else {
        console.log("Error");
      }
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const [loading, setLoading] = useState({});
  const [isFollow, setIsFollow] = useState({});

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
      if (data.message === "Followed the user successfully!") {
        setIsFollow({ ...isFollow, [uId]: true });
      } else {
        setIsFollow({ ...isFollow, [uId]: false });
      }
      setLoading({ ...loading, [uId]: false });
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const handleShowSkeleton = async () => {
    if (countLoading === 0) {
      setShowSkeleton(true);
    }
    await handleFetcHUserFriends();
    await handlefetchUserProfile();
    await showSuggestionFunc();
    await handleUserInsights();
    setCountLoading(1);
    setShowSkeleton(false);
  };

  const handSearchUser = (uId) => {
    localStorage.setItem("sUserId", JSON.stringify(uId));
    navigate("/searchUser");
  };

  useEffect(() => {
    handleShowSkeleton();
  }, [loading]);
  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      } sm:pl-72 sm:pt-24 max-w-7xl mx-auto p-4`}
    >
      {showSkeleton && <SkeletonLoader />}
      {!showSkeleton && (
        <>
          {" "}
          {/* User Overview Section */}
          <div
            className={`${
              theme === "dark" ? "bg-gray-800 border border-white" : "bg-white"
            } p-6 rounded-lg shadow-md`}
          >
            <div className="flex items-center space-x-4">
              <img
                src={userProfile.uPic || Avatar}
                alt="Profile"
                className={`w-16 h-16 ${
                  theme === "dark" ? "border-2 border-gray-200" : ""
                } rounded-full`}
              />
              <div>
                <h3
                  className={`text-xl font-bold ${
                    theme === "dark" ? "text-gray-200 font-bold" : "text-black"
                  } `}
                >
                  {userProfile && userProfile.uFullname}
                </h3>
                <p
                  className={`${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  @{userProfile && userProfile.uUsername}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4 text-center">
              <div>
                <h4
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-gray-200" : "text-black"
                  } `}
                >
                  {userProfile && userProfile.uPosts.length}
                </h4>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-white font-bold" : "text-black"
                  } `}
                >
                  Posts
                </p>
              </div>
              <div>
                <h4
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-gray-200" : "text-black"
                  }`}
                >
                  {userProfile && userProfile.uFollowers.followersList.length}
                </h4>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-white font-bold" : "text-black"
                  }  `}
                >
                  Followers
                </p>
              </div>
              <div>
                <h4
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-gray-200" : "text-black"
                  }`}
                >
                  {userProfile && userProfile.uFollowing.followingList.length}
                </h4>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-white font-bold" : "text-black"
                  }  `}
                >
                  Following
                </p>
              </div>
              <div>
                <h4
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-gray-200" : "text-black"
                  }`}
                >
                  {userInsights && userInsights.allJoinedGroups.length}
                </h4>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-white font-bold" : "text-black"
                  }  `}
                >
                  Groups
                </p>
              </div>
            </div>
          </div>
          <div
            className={`${
              theme === "dark" ? "bg-gray-800 border border-white" : "bg-white"
            } p-6 rounded-lg shadow-md mt-6`}
          >
            <h3
              className={`text-lg font-bold mb-4 ${
                theme === "dark" ? "text-white font-bold" : "text-black"
              } `}
            >
              Engagement Insights
            </h3>
            <div
              className={`grid grid-cols-3 gap-4 text-center ${
                theme === "dark" ? "text-gray-200" : "text-black"
              } `}
            >
              <div>
                <h4
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-gray-200" : "text-black"
                  } `}
                >
                  {userInsights && userInsights.allLikes.length}
                </h4>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-white font-bold" : "text-black"
                  } `}
                >
                  Likes
                </p>
              </div>
              <div>
                <h4
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-gray-200" : "text-black"
                  } `}
                >
                  {userInsights && userInsights.allComments.length}
                </h4>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-white font-bold" : "text-black"
                  } `}
                >
                  Comments
                </p>
              </div>
              <div>
                <h4
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-gray-200" : "text-black"
                  } `}
                >
                  {userFriends && userFriends.length}
                </h4>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-white font-bold" : "text-black"
                  } `}
                >
                  Friends
                </p>
              </div>
            </div>
          </div>
          {/* Suggestions */}
          <div
            className={`${
              theme === "dark" ? "bg-gray-800 border border-white" : "bg-white"
            } p-6 rounded-lg shadow-md mt-6`}
          >
            <h3
              className={`text-lg font-bold mb-4 ${
                theme === "dark" ? "text-gray-200 font-bold" : "text-black"
              } `}
            >
              Suggestions for You
            </h3>
            <ul className="space-y-3">
              {suggestions.map((data) => {
                return (
                  <li
                    key={data._id}
                    className={`flex items-center justify-between ${
                      theme === "dark"
                        ? "bg-gray-800 border border-white"
                        : "bg-gray-100"
                    }  p-3 rounded-lg`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={data.picture}
                        alt="Failed to load Img"
                        className={`w-12 h-12 rounded-full ${
                          theme === "dark" ? "border-2 border-gray-200" : ""
                        } object-cover hover:cursor-pointer`}
                        onClick={() => handSearchUser(data._id)}
                      />
                      <p
                        className={`font-bold ${
                          theme === "dark" ? "text-white" : "text-black"
                        }  hover:cursor-pointer`}
                        onClick={() => handSearchUser(data._id)}
                      >
                        {data.fullName}
                      </p>
                    </div>
                    <button
                      className={`${
                        theme === "dark"
                          ? "text-blue-700 font-bold"
                          : "text-blue-500"
                      } hover:underline`}
                      onClick={() => handleFollowUnFollow(data._id)}
                    >
                      {loading[data._id] ? (
                        <div className="flex items-center justify-center">
                          <span className="ml-2">Loading...</span>
                        </div>
                      ) : isFollow[data._id] ? (
                        "Unfollow"
                      ) : (
                        "Follow"
                      )}
                    </button>
                  </li>
                );
              })}
              {suggestions.length < 0 || suggestions.length === 0 ? (
                <p
                  className={`${
                    theme === "dark" ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  No suggestions available!
                </p>
              ) : (
                ""
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
