import React, { useContext, useEffect, useState } from "react";
import vividlyContext from "../Context/vividlyContext";
import Avatar from "../Images/Avatar.jpeg";
import SkeletonLoader from "./SkeletonLoader";
import { useNavigate } from "react-router-dom";
import socket from "./Socket";

const Friends = () => {
  useEffect(() => {
    return () => {
      socket.off("send_notification");
    };
  }, []);
  const navigate = useNavigate();
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
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [countLoading, setCountLoading] = useState(0);

  const [loading, setLoading] = useState({});
  const [isFollow, setIsFollow] = useState({});

  const handleShowSkeleton = async () => {
    if (countLoading === 0) {
      setShowSkeleton(true);
    }
    await showSuggestionFunc();
    await handleFetcHUserFriends();
    setCountLoading(1);
    setShowSkeleton(false);
  };

  useEffect(() => {
    handleShowSkeleton();
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
        setIsFollow({ ...isFollow, [uId]: false });
      } else {
        socket.emit("send_notification", data);
        setIsFollow({ ...isFollow, [uId]: true });
      }

      setLoading({ ...loading, [uId]: false });
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const handleFriendFollowUnFollow = async (uId) => {
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

  const [filteredFriends, setFilteredFriends] = useState(false);
  const [filteredSuggestedFriends, setFilteredSuggestedFriends] =
    useState(false);

  const [searchValue, setSearchValue] = useState("");

  const handleFilterUsers = (e) => {
    const searchTerm = e.target.value.toLowerCase();

    setSearchValue(e.target.value);
    if (searchTerm.length > 0) {
      setFilteredFriends(
        userFriends.filter((friend) =>
          friend.userId.fullName.toLowerCase().includes(searchTerm)
        )
      );
      setFilteredSuggestedFriends(
        suggestions.filter((suggestion) =>
          suggestion.fullName.toLowerCase().includes(searchTerm)
        )
      );
    } else {
      setFilteredFriends(false);
      setFilteredSuggestedFriends(false);
    }
  };

  const handSearchUser = (uId) => {
    localStorage.setItem("sUserId", JSON.stringify(uId));
    navigate("/searchUser");
  };

  return (
    <div
      className={`min-h-screen sm:pl-72 sm:pt-24 ${
        theme === "dark" ? "bg-gray-900" : "bg-white mt-4 rounded-lg"
      } p-6 shadow-md `}
    >
      {showSkeleton && <SkeletonLoader />}
      {!showSkeleton && (
        <>
          <div className="mt-4">
            <input
              type="text"
              value={searchValue}
              onChange={handleFilterUsers}
              placeholder="Search for friends"
              className={`w-full p-2  ${
                theme === "dark"
                  ? "bg-gray-800 text-white border-2 border-white"
                  : "bg-white border border-gray-300 text-black"
              }  rounded-lg`}
            />
          </div>
          {/* Your Friends */}
          <div className="mt-8">
            <h3
              className={`text-2xl font-bold mb-4 ${
                theme === "dark" ? "text-gray-200 font-bold" : "text-black"
              } `}
            >
              Your Friends
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {!filteredFriends &&
                userFriends.map((user) => {
                  return (
                    <div
                      key={user.userId._id}
                      className={`${
                        theme === "dark"
                          ? "bg-gray-800 hover:bg-gray-800 border border-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      } p-4 rounded-lg shadow `}
                    >
                      <img
                        src={user.userId.picture || Avatar}
                        alt="Failed to load img!"
                        className={`w-24 h-24 hover:cursor-pointer ${
                          theme === "dark" ? "border-2 border-gray-200" : ""
                        } rounded-full object-cover mx-auto`}
                        onClick={() => handSearchUser(user.userId._id)}
                      />
                      <div className="text-center mt-4">
                        <p
                          className={`font-semibold hover:cursor-pointer ${
                            theme === "dark"
                              ? "text-gray-200 font-bold"
                              : "text-gray-800"
                          } `}
                          onClick={() => handSearchUser(user.userId._id)}
                        >
                          {user.userId.fullName}
                        </p>
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-300" : "text-gray-500"
                          } `}
                        >
                          @{user.userId.userName}
                        </p>
                        <button
                          className={`mt-4 ${
                            theme === "dark"
                              ? "text-blue-700 font-bold"
                              : "text-blue-500"
                          }  hover:underline`}
                          onClick={() =>
                            handleFriendFollowUnFollow(user.userId._id)
                          }
                        >
                          {loading[user.userId._id] ? (
                            <div className="flex items-center justify-center">
                              <span className="ml-2">Loading...</span>
                            </div>
                          ) : (
                            "UnFollow"
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              {filteredFriends && (
                <>
                  {filteredFriends.map((user) => {
                    return (
                      <div
                        key={user.userId._id}
                        className={`${
                          theme === "dark"
                            ? "bg-gray-800 hover:bg-gray-800 border border-white"
                            : "bg-gray-100 hover:bg-gray-200"
                        } p-4 rounded-lg shadow `}
                      >
                        <img
                          src={user.userId.picture || Avatar}
                          alt="Failed to load img!"
                          className={`w-24 h-24 hover:cursor-pointer ${
                            theme === "dark" ? "border-2 border-gray-200" : ""
                          } rounded-full object-cover mx-auto`}
                          onClick={() => handSearchUser(user.userId._id)}
                        />
                        <div className="text-center mt-4">
                          <p
                            className={`font-semibold hover:cursor-pointer ${
                              theme === "dark"
                                ? "text-gray-200 font-bold"
                                : "text-gray-800"
                            } `}
                            onClick={() => handSearchUser(user.userId._id)}
                          >
                            {user.userId.fullName}
                          </p>
                          <p
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-500"
                            } `}
                          >
                            @{user.userId.userName}
                          </p>
                          <button
                            className={`mt-4 ${
                              theme === "dark"
                                ? "text-blue-700 font-bold"
                                : "text-blue-500"
                            }  hover:underline`}
                            onClick={() =>
                              handleFriendFollowUnFollow(user.userId._id)
                            }
                          >
                            {loading[user.userId._id] ? (
                              <div className="flex items-center justify-center">
                                <span className="ml-2">Loading...</span>
                              </div>
                            ) : (
                              "UnFollow"
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {filteredFriends.length === 0 && (
                    <div className="text-gray-400">No user found!</div>
                  )}
                </>
              )}
            </div>
            {userFriends.length === 0 && (
              <p
                className={`text-xl text-center ${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                } `}
              >
                You don't have any friends yet!
              </p>
            )}
          </div>
          <div className="mt-8">
            <h3
              className={`text-2xl font-bold mb-4 ${
                theme === "dark" ? "text-white font-bold" : "text-black"
              } `}
            >
              Suggested Friends
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {!filteredSuggestedFriends &&
                suggestions.map((user) => (
                  <div
                    key={user._id}
                    className={`${
                      theme === "dark"
                        ? "bg-gray-800 border border-white hover:bg-gray-900"
                        : "bg-gray-100 hover:bg-gray-200"
                    } p-4 rounded-lg shadow `}
                  >
                    <img
                      src={user.picture}
                      alt="Failed to load image!"
                      className={`w-24 h-24 hover:cursor-pointer ${
                        theme === "dark" ? "border-2 border-gray-200" : ""
                      } rounded-full object-cover mx-auto`}
                      onClick={() => handSearchUser(user._id)}
                    />
                    <div className="text-center mt-4">
                      <p
                        className={`font-semibold hover:cursor-pointer ${
                          theme === "dark"
                            ? "text-gray-200 font-bold"
                            : "text-gray-800"
                        } `}
                        onClick={() => handSearchUser(user._id)}
                      >
                        {user.fullName}
                      </p>
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-500"
                        } `}
                      >
                        @{user.userName}
                      </p>
                      <button
                        className={`mt-4 ${
                          theme === "dark"
                            ? "text-blue-700 font-bold"
                            : "text-blue-500"
                        }  hover:underline`}
                        disabled={loading[user._id]}
                        onClick={() => handleFollowUnFollow(user._id)}
                      >
                        {loading[user._id] ? (
                          <div className="flex items-center justify-center">
                            <span className="ml-2">Loading...</span>
                          </div>
                        ) : (
                          "Follow"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              {filteredSuggestedFriends && (
                <>
                  {filteredSuggestedFriends.map((user) => (
                    <div
                      key={user._id}
                      className={`${
                        theme === "dark"
                          ? "bg-gray-800 border border-white hover:bg-gray-900"
                          : "bg-gray-100 hover:bg-gray-200"
                      } p-4 rounded-lg shadow `}
                    >
                      <img
                        src={user.picture}
                        alt="Failed to load image!"
                        className={`w-24 h-24 hover:cursor-pointer ${
                          theme === "dark" ? "border-2 border-gray-200" : ""
                        } rounded-full object-cover mx-auto`}
                        onClick={() => handSearchUser(user._id)}
                      />
                      <div className="text-center mt-4">
                        <p
                          className={`font-semibold hover:cursor-pointer ${
                            theme === "dark"
                              ? "text-gray-200 font-bold"
                              : "text-gray-800"
                          } `}
                          onClick={() => handSearchUser(user._id)}
                        >
                          {user.fullName}
                        </p>
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-300" : "text-gray-500"
                          } `}
                        >
                          @{user.userName}
                        </p>
                        <button
                          className={`mt-4 ${
                            theme === "dark"
                              ? "text-blue-700 font-bold"
                              : "text-blue-500"
                          }  hover:underline`}
                          disabled={loading[user._id]}
                          onClick={() => handleFollowUnFollow(user._id)}
                        >
                          {loading[user._id] ? (
                            <div className="flex items-center justify-center">
                              <span className="ml-2">Loading...</span>
                            </div>
                          ) : (
                            "Follow"
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredSuggestedFriends.length === 0 && (
                    <div>No user found!</div>
                  )}
                </>
              )}
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
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Friends;
