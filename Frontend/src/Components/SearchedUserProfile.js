import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faPenToSquare,
  faHeart as LikeHeart,
} from "@fortawesome/free-solid-svg-icons";
import {
  faComment,
  faHeart,
  faPaperPlane,
  faPenToSquare as faPenRegular,
} from "@fortawesome/free-regular-svg-icons";
import vividlyContext from "../Context/vividlyContext";
import Avatar from "../Images/Avatar.jpeg";
import SkeletonLoader from "./SkeletonLoader";
import socket from "./Socket";

const SearchedUserProfile = () => {
  const theme = JSON.parse(localStorage.getItem("theme"));

  useEffect(() => {
    return () => {
      socket.off("send_notification");
      socket.off("send_message");
    };
  }, []);
  const context = useContext(vividlyContext);
  const {
    chkIsAlreadyFollow,
    searchedUserAllDataFunc,
    fetchAllUsers,
    sendMediaOfPost,
  } = context;
  const ENDPOINT = process.env.REACT_APP_ENDPOINT;
  const [cText, setCText] = useState("");
  const [specificPostId, setSpecificPosId] = useState("");
  const [specificPostComments, setSpecificPostComments] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [showSkeleton, setShowSkeleton] = useState(false);
  const [countLoading, setCountLoading] = useState(0);

  const [userData, setUserData] = useState("");
  const searchedUserId = JSON.parse(localStorage.getItem("sUserId"));

  const [profilePicture, setProfilePicture] = useState("");

  const handleFetchUData = async () => {
    const response = await searchedUserAllDataFunc(searchedUserId);
    setUserData(response);
    setProfilePicture(response.userCredentials.profileCoverPic);
  };
  const [isFollow, setIsFollow] = useState(false);

  const handleShowSkeleton = async () => {
    if (countLoading === 0) {
      setShowSkeleton(true);
    }
    await handleFetchAllUsers();
    await handleFetchUData();
    setCountLoading(1);
    setShowSkeleton(false);
  };

  useEffect(() => {
    handleShowSkeleton();
  }, [isFollow]);

  useEffect(() => {
    if (userData) {
      handleFetchLikeStatus();
      handleChkIsFollow();
    }
  }, [userData]);

  const id = localStorage.getItem("id");
  const parsedId = JSON.parse(id);

  const handleFetchLikeStatus = async () => {
    const Statuses = await Promise.all(
      userData.posts.map(async (post) => {
        const likes = await handleFetchPostLikes(post._id);
        const comments = await handleFetchPostComments(post._id);
        let likeStatus = likes.some((like) => like.user === parsedId)
          ? "Liked"
          : "Not Liked";

        return { ...post, likes, comments, likeStatus };
      })
    );
    setStatuses(Statuses);
  };

  const handleChkIsFollow = async () => {
    const chk = await chkIsAlreadyFollow(userData.userCredentials.userName);
    if (chk.message === "Already follow") {
      setIsFollow(true);
    } else if (chk.message === "Not follow") {
      setIsFollow(false);
    }
  };

  const handleFetchPostLikes = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(
        `${ENDPOINT}/api/post/fetchPostLikes/${postId}`,
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
        return data.postLikes.likes;
      }
    } catch (error) {
      console.log("Error:", error.message);
    }
  };

  const handleFetchPostComments = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(
        `${ENDPOINT}/api/post/fetchPostComments/${postId}`,
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
        return data.postComments.comments;
      }
    } catch (error) {
      console.log("Error:", error.message);
    }
  };

  const handleLikePost = async (postId) => {
    const token = localStorage.getItem("token");
    const parsedToken = JSON.parse(token);
    const data = await fetch(`${ENDPOINT}/api/post/likePost/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": parsedToken,
      },
    });
    const response = await data.json();
    const userId = localStorage.getItem("id");
    const parsedUserId = JSON.parse(userId);

    const post = statuses.find((post) => post._id === postId);
    if (post) {
      const userAlreadyLiked = post.likes.some(
        (like) => like.user === parsedUserId
      );

      if (userAlreadyLiked) {
        setStatuses(
          statuses.map((p) =>
            p._id === postId
              ? {
                  ...p,
                  likes: p.likes.filter((like) => like.user !== parsedUserId),
                  likeStatus: "Not Liked",
                }
              : p
          )
        );
      } else {
        setStatuses(
          statuses.map((p) =>
            p._id === postId
              ? {
                  ...p,
                  likes: [...p.likes, { user: parsedUserId }],
                  likeStatus: "Liked",
                }
              : p
          )
        );
        socket.emit("send_notification", response);
      }
    }

    return response;
  };

  const handleSpecificPostComments = (id) => {
    const post = statuses.find((post) => post._id === id);
    setSpecificPostComments(post.comments);
  };

  const handleStoreSpecificPostId = (id) => {
    setSpecificPosId(id);
  };

  const handleCommentOnChange = (e) => {
    setCText(e.target.value);
  };

  const handleAddComment = async (postId, text, event) => {
    const token = localStorage.getItem("token");
    const parsedToken = JSON.parse(token);

    if (event.key === "Enter" || event.key === "enter") {
      if (text.trim().length < 1) {
        return;
      }
      setCText("");
      try {
        const response = await fetch(
          `${ENDPOINT}/api/post/commentOnPost/${postId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "auth-token": parsedToken,
            },
            body: JSON.stringify({
              text,
            }),
          }
        );
        const data = await response.json();
        if (data.success) {
          socket.emit("send_notification", data);
          setSpecificPostComments(data.updatedComment.comments);
          setStatuses(
            statuses.map((p) =>
              p._id === postId
                ? {
                    ...p,
                    comments: data.updatedComment.comments,
                  }
                : p
            )
          );
        }
      } catch (error) {
        console.log("Error:", error);
      }
    }
  };
  const [loading, setLoading] = useState(false);

  const handleFollowUnFollow = async () => {
    try {
      setLoading(true);
      const id = localStorage.getItem("id");
      const parsedId = JSON.parse(id);
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
          body: JSON.stringify({ user: searchedUserId }),
        }
      );
      const data = await response.json();
      if (data.message === "Followed the user successfully!") {
        socket.emit("send_notification", data);
        setIsFollow(true);
      } else {
        setIsFollow(false);
      }
    } catch (error) {
      console.log("Error:", error.message);
    } finally {
      setLoading(false); // Stop loading when request is finished
    }
  };

  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleFetchAllUsers = async () => {
    const response = await fetchAllUsers();
    if (response.success) {
      setUsers(response.allUsers, { selected: false });
    }
  };
  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const handleSearch = (e) => setSearchTerm(e.target.value);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const toggleUserSelection = (id) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === id ? { ...user, selected: !user.selected } : user
      )
    );
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.includes(id)
        ? prevSelectedUsers.filter((userId) => userId !== id)
        : [...prevSelectedUsers, id]
    );
  };
  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [sharedPostData, setSharedPostMedia] = useState({
    media: "",
    mediaType: "",
    postId: "",
  });

  const handleShareOnClick = (media, mediaType, postId) => {
    setSharedPostMedia({
      media: media,
      mediaType: mediaType,
      postId: postId,
    });
  };
  const [loading2, setLoading2] = useState("");
  const handleSharePost = async () => {
    setLoading2(true);
    const selectedUsers = users.filter((user) => user.selected);
    const isSharedPost = "yes";
    await Promise.all(
      selectedUsers.map(async (user) => {
        const response = await sendMediaOfPost(
          user._id,
          sharedPostData.media,
          sharedPostData.mediaType,
          isSharedPost,
          sharedPostData.postId
        );
        const newMsg = response.data;
        socket.emit("send_message", newMsg);
      })
    );

    setLoading2(false);
    toggleModal();
    handleFetchAllUsers();
    setSearchTerm("");
    setSelectedUsers([]);
  };

  return (
    <div
      className={`min-h-screen sm:pl-72 sm:pt-24 max-w-8xl mx-auto p-6 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {showSkeleton && <SkeletonLoader />}
      {!showSkeleton && (
        <>
          {/* User Overview */}
          {profilePicture === "Not set" ? (
            <div className="h-56 w-full rounded-t-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center relative">
              <h1 className="text-3xl font-bold text-white">
                Profile Cover not set
              </h1>
            </div>
          ) : (
            <img
              src={profilePicture || Avatar}
              alt="failed to load img"
              className="h-44 md:h-48 lg:h-72 w-full object-cover relative rounded-t-lg"
            ></img>
          )}
          <div
            className={`flex flex-col lg:flex-row lg:justify-between ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }  shadow rounded-lg`}
          >
            <div className="flex items-center space-x-4 p-4">
              <img
                src={(userData && userData.userCredentials.picture) || Avatar}
                alt="Failed to load img"
                className={`w-20 h-20 rounded-full ${
                  theme === "dark" ? "border-2 border-gray-500" : ""
                }object-cover`}
              />
              <div>
                <h2
                  className={`text-xl font-bold ${
                    theme === "dark" ? "text-white" : "text-black"
                  }`}
                >
                  {userData && userData.userCredentials.fullName}
                </h2>
                <p
                  className={`${
                    theme === "dark" ? "text-gray-200" : "text-gray-600"
                  }`}
                >
                  {userData && userData.userCredentials.userName}
                </p>
                <button
                  className={`mt-2 px-6 py-3 w-32 rounded-lg text-white font-semibold transition-all duration-300 ease-in-out transform ${
                    isFollow
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  } ${loading ? "opacity-50 cursor-not-allowed scale-95" : ""}`}
                  onClick={handleFollowUnFollow}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 118 8 8 8 0 01-8-8z"
                        ></path>
                      </svg>
                      <span className="ml-2">Loading...</span>
                    </div>
                  ) : isFollow ? (
                    "Unfollow"
                  ) : (
                    "Follow"
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center p-6 pl-8 pb-4 space-x-4 sm:space-x-6 lg:space-x-8 lg:pl-0 lg:pb-4">
              <div>
                <h4
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-white" : "text-black"
                  }`}
                >
                  Posts
                </h4>
                <p
                  className={`${
                    theme === "dark" ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {userData && userData.posts.length}
                </p>
              </div>
              <div>
                <h4
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-white" : "text-black"
                  }`}
                >
                  Followers
                </h4>
                <p
                  className={`${
                    theme === "dark" ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {userData && userData.followersList.followersList.length}
                </p>
              </div>
              <div>
                <h4
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-white" : "text-black"
                  }`}
                >
                  Following
                </h4>
                <p
                  className={`${
                    theme === "dark" ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {userData && userData.followingList.followingList.length}
                </p>
              </div>
            </div>
          </div>

          {/* Posts */}
          <div
            className={`mt-6 ${
              theme === "dark" ? "bg-gray-800 border border-white" : "bg-white"
            } shadow rounded-lg p-4`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              Posts
            </h3>
            <div className="grid grid-cols-1 elmd:grid-cols-2 sm:grid-cols-1 md:grid-cols-2 exmd:grid-cols-3 gap-4">
              {statuses.map((post) => {
                return (
                  <div
                    key={post._id}
                    className={`hover:scale-[103%] transition-transform duration-300 ${
                      theme === "dark"
                        ? "bg-gray-800 rounded-b-lg border border-b-2 border-gray-200"
                        : "rounded-b-lg border-b-2 border-gray-700"
                    } rounded-lg overflow-hidden`}
                  >
                    {post.mediaType === "image" ? (
                      <img
                        src={post.media}
                        alt="Failed to load img"
                        className="w-full h-56 lg:h-72 object-cover"
                      />
                    ) : (
                      <video
                        src={post.media}
                        alt="Failed to load video"
                        controls
                        className="w-full h-56 lg:h-72 object-cover"
                      />
                    )}
                    <div>
                      <p
                        className={`p-3 border-b border-gray-600 ${
                          theme === "dark" ? "text-gray-200 " : "text-gray-700 "
                        } `}
                      >
                        {post.description}
                      </p>
                    </div>

                    <div
                      className={`w-full p-2 ${
                        theme === "dark" ? "bg-gray-800 " : "bg-gray-50 "
                      } shadow-2xl `}
                    >
                      <div className="flex">
                        <div className="ml-2 mr-1 hover:cursor-pointer">
                          <FontAwesomeIcon
                            className={`text-2xl hover:text-red-600 transition-transform duration-300 ease-in-out transform ${
                              post.likeStatus === "Liked"
                                ? "text-red-600 scale-105"
                                : `${
                                    theme === "dark"
                                      ? "text-white"
                                      : "text-black"
                                  } scale-100`
                            }`}
                            icon={
                              post.likeStatus === "Liked" ? LikeHeart : faHeart
                            }
                            onClick={async () => {
                              await handleLikePost(post._id);
                            }}
                          />
                        </div>
                        <div
                          className={`${
                            theme === "dark" ? "text-gray-200" : "text-black"
                          } w-8`}
                        >
                          {post.likes && post.likes.length}
                        </div>
                        <dialog id="addComment_Modal" className="modal">
                          <div
                            className={`modal-box min-h-[80vh] overflow-hidden ${
                              theme === "dark" ? "bg-gray-900" : "bg-white"
                            }`}
                          >
                            <form method="dialog">
                              <button
                                className={`btn btn-sm btn-circle btn-ghost absolute right-2 top-2 ${
                                  theme === "dark"
                                    ? "text-white text-xl"
                                    : "text-black"
                                }`}
                              >
                                ✕
                              </button>
                            </form>
                            <div className="flex justify-center mb-3">
                              <h1
                                className={`cus-font ${
                                  theme === "dark" ? "text-white" : "text-black"
                                } font-bold text-3xl mb-5`}
                              >
                                Add a comment
                              </h1>
                            </div>

                            <div>
                              {specificPostComments.length > 0 ? (
                                <div className="space-y-3 pb-10 overflow-y-auto max-h-[60vh]">
                                  {specificPostComments.map((cData) => {
                                    return (
                                      <div
                                        className={`flex ${
                                          theme === "dark"
                                            ? "bg-gray-800 border border-gray-200"
                                            : "bg-gray-100 border border-gray-400"
                                        } rounded-xl p-1 shadow-sm  mb-3`}
                                        key={cData._id}
                                      >
                                        <img
                                          src={cData.userPic}
                                          alt="failed to load user img"
                                          className={`rounded-full h-16 w-16 border-2 border-gray-400`}
                                        />
                                        <div className="flex flex-col">
                                          <p
                                            className={`ml-3 font-bold ${
                                              theme === "dark"
                                                ? "text-white"
                                                : "text-black"
                                            }`}
                                          >
                                            {cData.userName}
                                          </p>
                                          <p
                                            className={`ml-3 break-all whitespace-normal ${
                                              theme === "dark"
                                                ? "text-gray-200"
                                                : "text-black"
                                            }`}
                                          >
                                            {cData.text}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div
                                  className={`flex justify-center items-center h-[55vh] custom-font text-3xl ${
                                    theme === "dark"
                                      ? "text-gray-200"
                                      : "text-black"
                                  }`}
                                >
                                  No Comments Here
                                </div>
                              )}

                              <div className="flex justify-start">
                                <input
                                  className={`w-[87%] fixed rounded-lg bottom-5 ${
                                    theme === "dark"
                                      ? "bg-gray-800 focus:ring-blue text-white border border-white"
                                      : "bg-gray-100 focus:ring-black text-black"
                                  }`}
                                  type="text"
                                  placeholder="Add a comment"
                                  value={cText}
                                  onChange={handleCommentOnChange}
                                  onKeyDown={(event) =>
                                    handleAddComment(
                                      specificPostId,
                                      cText,
                                      event
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </dialog>

                        <div className="hover:cursor-pointer">
                          <FontAwesomeIcon
                            className={`hover:text-blue-600 ${
                              theme === "dark" ? "text-white" : "text-black"
                            } text-2xl mr-1`}
                            icon={faComment}
                            onClick={async () => {
                              handleSpecificPostComments(post._id);
                              handleStoreSpecificPostId(post._id);
                              document
                                .getElementById("addComment_Modal")
                                .showModal();
                            }}
                          />
                        </div>
                        <div
                          className={`${
                            theme === "dark" ? "text-gray-200" : "text-black"
                          } w-8`}
                        >
                          {post.comments && post.comments.length}
                        </div>

                        <div className="hover:cursor-pointer">
                          <FontAwesomeIcon
                            icon={faPaperPlane}
                            className={`text-2xl cursor-pointer ${
                              theme === "dark" ? "text-white" : " text-gray-600"
                            } hover:text-green-500`}
                            onClick={() => {
                              handleShareOnClick(
                                post.media,
                                post.mediaType,
                                post._id
                              );
                              toggleModal();
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {isModalOpen && (
              <div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                onClick={() => {
                  toggleModal();
                  setSearchTerm("");
                  setSelectedUsers([]);
                  handleFetchAllUsers();
                }}
              >
                <div
                  className={`${
                    theme === "dark"
                      ? "bg-gray-900 border border-gray-700"
                      : "bg-white"
                  } w-[85vw] sm:w-96 rounded-lg shadow-lg p-4`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between">
                    <h2
                      className={`text-2xl ${
                        theme === "dark" ? "text-gray-200" : "text-gray-800"
                      }  mb-4`}
                    >
                      Share with Users
                    </h2>
                    <FontAwesomeIcon
                      icon={faClose}
                      className={`${
                        theme === "dark" ? "text-white" : "text-black"
                      } text-2xl hover:text-red-600`}
                      onClick={() => {
                        toggleModal();
                        setSearchTerm("");
                        setSelectedUsers([]);
                        handleFetchAllUsers();
                      }}
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Search users..."
                    className={`w-full p-2 border ${
                      theme === "dark"
                        ? "text-white bg-gray-800 border-gray-200"
                        : "text-black border-gray-300"
                    }  rounded mb-4`}
                    value={searchTerm}
                    onChange={handleSearch}
                  />

                  <div className="max-h-60 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        className={`flex items-center ${
                          theme === "dark"
                            ? "bg-gray-800 border border-gray-200"
                            : "bg-gray-200"
                        }  p-2 mb-1 rounded-lg justify-between  cursor-pointer ${
                          user.selected
                            ? `${
                                theme === "dark"
                                  ? "bg-green-600"
                                  : "bg-green-100"
                              }`
                            : `${
                                theme === "dark"
                                  ? "hover:bg-gray-900"
                                  : "hover:bg-gray-300"
                              }`
                        }`}
                        onClick={() => toggleUserSelection(user._id)}
                      >
                        <div className="flex">
                          <img
                            src={user.picture}
                            className="mr-2 h-12 w-12 rounded-full border-2 border-gray-200"
                            alt="Load img"
                          />
                          <div className="flex flex-col">
                            <span
                              className={`${
                                theme === "dark"
                                  ? "text-gray-200"
                                  : "text-gray-800"
                              }`}
                            >
                              {user.fullName}
                            </span>
                            <span
                              className={`${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-700"
                              } mt-[-2px]`}
                            >
                              @{user.userName}
                            </span>
                          </div>
                        </div>

                        {user.selected && (
                          <span
                            className={`${
                              theme === "dark"
                                ? "text-gray-100"
                                : "text-green-500"
                            } font-bold`}
                          >
                            Selected
                          </span>
                        )}
                      </div>
                    ))}
                    {filteredUsers && filteredUsers.length === 0 && (
                      <p
                        className={`${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        No user found!
                      </p>
                    )}
                  </div>

                  <button
                    className="mt-4 w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
                    disabled={loading2 || selectedUsers.length === 0}
                    onClick={() => {
                      handleSharePost();
                    }}
                  >
                    {loading2
                      ? "Sharing..."
                      : `${
                          selectedUsers.length === 0
                            ? "You must select a user before sharing"
                            : "Share"
                        }`}
                  </button>
                </div>
              </div>
            )}
            {userData && userData.posts.length === 0 ? (
              <p
                className={`${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                } font-semibold text-center mb-6`}
              >
                No posts have been shared yet.
              </p>
            ) : (
              ""
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchedUserProfile;
