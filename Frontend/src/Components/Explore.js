import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faComment } from "@fortawesome/free-regular-svg-icons";
import vividlyContext from "../Context/vividlyContext";
import { useNavigate } from "react-router-dom";

import {
  faClose,
  faPaperPlane,
  faHeart as LikeHeart,
} from "@fortawesome/free-solid-svg-icons";

import SkeletonLoader from "./SkeletonLoader";
import socket from "./Socket";

const Explore = () => {
  const theme = JSON.parse(localStorage.getItem("theme"));
  const navigate = useNavigate();
  const context = useContext(vividlyContext);
  const {
    searchUserFunc,
    searchUsers,
    handleFetchTrendingPosts,
    fetchAllUsers,
    sendMediaOfPost,
  } = context;

  const id = localStorage.getItem("id");
  const parsedId = JSON.parse(id);
  const ENDPOINT = process.env.REACT_APP_ENDPOINT;

  const [showSkeleton, setShowSkeleton] = useState(false);
  const [countLoading, setCountLoading] = useState(0);

  const [keyword, setKeyword] = useState("");
  const [show, setShow] = useState(true);
  useEffect(() => {
    return () => {
      socket.off("send_message");
      socket.off("send_notification");
    };
  }, []);

  const handleOnchange = (e) => {
    const searchTerm = e.target.value;
    setKeyword(e.target.value);
    if (searchTerm.length > 0) {
      searchUserFunc(e.target.value);
      setShow(false);
    } else {
      setShow(true);
    }
  };

  const handleFetchSearchedUData = async (id) => {
    localStorage.setItem("sUserId", JSON.stringify(id));
    navigate("/searchUser");
  };
  const handleShowSkeleton = async () => {
    if (countLoading === 0) {
      setShowSkeleton(true);
    }
    await trendingPostDetailsFunc();
    await handleFetchAllUsers();
    setCountLoading(1);
    setShowSkeleton(false);
  };
  useEffect(() => {
    handleShowSkeleton();
  }, []);

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

    const post = tPostDetails.find((post) => post._id === postId);
    if (post) {
      const userAlreadyLiked = post.likes.some(
        (like) => like.user === parsedUserId
      );

      if (userAlreadyLiked) {
        setTPostDetails(
          tPostDetails.map((p) =>
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
        setTPostDetails(
          tPostDetails.map((p) =>
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
  const [tPostDetails, setTPostDetails] = useState([]);

  const trendingPostDetailsFunc = async () => {
    const posts = await handleFetchTrendingPosts();
    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const likes = await handleFetchPostLikes(post._id);
        const comments = await handleFetchPostComments(post._id);
        let likeStatus = likes.some((like) => like.user === parsedId)
          ? "Liked"
          : "Not Liked";

        return { ...post, likes, comments, likeStatus };
      })
    );
    setTPostDetails(postsWithDetails);
  };

  const [specificPostComments, setSpecificPostComments] = useState([]);
  const handleSpecificPostComments = (id) => {
    const post = tPostDetails.find((post) => post._id === id);
    setSpecificPostComments(post.comments);
  };
  const [cText, setCText] = useState("");
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
        socket.emit("send_notification", data);
        if (data.success) {
          setSpecificPostComments(data.updatedComment.comments);
          setTPostDetails(
            tPostDetails.map((p) =>
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
        console.log("Error:", error.message);
      }
    }
  };
  const [specificPostId, setSpecificPosId] = useState("");
  const handleStoreSpecificPostId = (id) => {
    setSpecificPosId(id);
  };
  const handSearchUser = (uId) => {
    localStorage.setItem("sUserId", JSON.stringify(uId));
    navigate("/searchUser");
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
  const [loading, setLoading] = useState("");
  const handleSharePost = async () => {
    setLoading(true);
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

    setLoading(false);
    toggleModal();
    handleFetchAllUsers();
    setSearchTerm("");
    setSelectedUsers([]);
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      } sm:pl-72 sm:pt-24 mx-auto p-6`}
    >
      {showSkeleton && <SkeletonLoader />}
      {!showSkeleton && (
        <>
          <dialog id="addComment_Modal" className="modal">
            <div
              className={`modal-box min-h-[80vh] overflow-hidden ${
                theme === "dark" ? "bg-gray-900" : "bg-white"
              }  rounded-lg shadow-lg relative`}
            >
              <form method="dialog">
                <button
                  className={`btn btn-sm btn-circle btn-ghost absolute right-4 top-4 ${
                    theme === "dark" ? "text-white text-xl" : "text-black"
                  }  hover:bg-opacity-70 transition`}
                >
                  ✕
                </button>
              </form>

              <div className="flex justify-center mb-5">
                <h1
                  className={`cus-font ${
                    theme === "dark" ? "text-white font-bold" : "text-black"
                  } font-semibold text-4xl mb-4`}
                >
                  Add a comment
                </h1>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[60vh] pb-6 pr-2 mb-[80px]">
                {specificPostComments.length > 0 ? (
                  specificPostComments.map((cData) => (
                    <div
                      key={cData._id}
                      className={`flex ${
                        theme === "dark"
                          ? "bg-gray-800 border border-white hover:bg-gray-900"
                          : "bg-gray-100 border border-gray-300 hover:bg-gray-200"
                      } rounded-xl p-2 shadow-md  transition hover:cursor-pointer`}
                      onClick={() => handSearchUser(cData.user)}
                    >
                      <img
                        src={cData.userPic}
                        alt="Failed to load user img"
                        className="rounded-full h-16 w-16 border-2 border-gray-400"
                      />
                      <div className="flex flex-col ml-4">
                        <p
                          className={`font-semibold ${
                            theme === "dark" ? "text-white" : "text-black"
                          }`}
                        >
                          {cData.userName}
                        </p>
                        <p
                          className={`break-all whitespace-normal ${
                            theme === "dark" ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          {cData.text}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className={`flex justify-center items-center h-[55vh] custom-font text-2xl sm:text-3xl ${
                      theme === "dark" ? "text-gray-200" : "text-gray-600"
                    }`}
                  >
                    No Comments Here
                  </div>
                )}
              </div>

              {/* Fixed position input */}
              <div className="absolute bottom-5 left-0 w-full px-4">
                <input
                  className={`w-full rounded-full ${
                    theme === "dark"
                      ? "bg-gray-800 border border-white text-white"
                      : "bg-gray-100"
                  } focus:ring-1  focus:ring-blue-500 py-2 px-4 text-black shadow-md focus:outline-none transition`}
                  type="text"
                  placeholder="Add a comment"
                  value={cText}
                  onChange={handleCommentOnChange}
                  onKeyDown={(event) =>
                    handleAddComment(specificPostId, cText, event)
                  }
                />
              </div>
            </div>
          </dialog>
          {/* Search Section */}

          <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md mb-6">
            <h1 className="text-3xl font-bold">Explore</h1>
            <div className="mt-4">
              <input
                type="text"
                value={keyword}
                onChange={handleOnchange}
                placeholder="Search for people..."
                className="w-full px-4 py-2 rounded-lg shadow-md bg-white text-gray-800"
              />
            </div>
          </div>
          <div className="max-h-[90vh] overflow-y-auto">
            {!show &&
              searchUsers &&
              searchUsers.map((user) => {
                return (
                  <div
                    className="flex items-center p-2 bg-gray-50 rounded-lg shadow-md text-black hover:bg-gray-200 transition-all duration-300 cursor-pointer border-black border-b-2 mb-3 "
                    key={user._id}
                    onClick={() => handleFetchSearchedUData(user._id)}
                  >
                    <img
                      src={user.picture}
                      alt="Failed to load img"
                      className="w-16 h-16 ml-2 object-cover rounded-full border-2 border-gray-800"
                    />
                    <div className="ml-4">
                      <h2 className="text-lg font-semibold ">
                        {user.fullName}
                      </h2>
                      <p className="text-sm ">@{user.userName}</p>
                    </div>
                  </div>
                );
              })}
            {!show && !searchUsers ? (
              <p className="text-lg text-center text-gray-500 font-medium py-4">
                {" "}
                No users found. Try searching with a different keyword!
              </p>
            ) : (
              ""
            )}
          </div>

          {show && (
            <>
              {/* Recommended Posts Section */}
              <div className="space-y-8">
                <h2
                  className={`text-2xl font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  } mb-4`}
                >
                  Trending Posts
                </h2>
                <div className="grid grid-cols-1 emd:grid-cols-2 elg:grid-cols-3 gap-6">
                  {tPostDetails.map((post) => (
                    <div
                      key={post._id}
                      className={`${
                        theme === "dark"
                          ? "bg-gray-800 border border-white"
                          : "bg-white border-gray-200"
                      } rounded-xl shadow-lg overflow-hidden transition-transform transform hover:scale-105 duration-300 ease-in-out border `}
                    >
                      {post.mediaType === "image" ? (
                        <img
                          src={post.media}
                          alt="Failed to load media"
                          className={`w-full h-60 object-cover`}
                        />
                      ) : (
                        <video
                          src={post.media}
                          alt="Failed to load media"
                          className="w-full h-60 object-cover"
                          controls
                          muted
                        />
                      )}

                      <div className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <img
                            src={post.userId.picture}
                            alt="Failed to load img"
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 hover:cursor-pointer"
                            onClick={() => handSearchUser(post.userId._id)}
                          />
                          <div>
                            <p
                              className={`font-bold text-lg ${
                                theme === "dark"
                                  ? "text-gray-200"
                                  : "text-gray-900"
                              } hover:cursor-pointer`}
                              onClick={() => handSearchUser(post.userId._id)}
                            >
                              {post.userId.userName}
                            </p>
                            <p
                              className={`text-sm ${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-500"
                              }`}
                            >
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <p
                          className={`${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          } mb-4 leading-relaxed`}
                        >
                          {post.description}
                        </p>

                        <div className="flex justify-between items-center border-t pt-4">
                          <button
                            className={`flex items-center space-x-2 ${
                              theme === "dark" ? "text-white" : "text-gray-600"
                            }  `}
                            onClick={() => handleLikePost(post._id)}
                          >
                            <FontAwesomeIcon
                              icon={
                                post.likeStatus === "Liked"
                                  ? LikeHeart
                                  : faHeart
                              }
                              className={`text-2xl cursor-pointer ${
                                post.likeStatus === "Liked"
                                  ? "text-red-600"
                                  : `${
                                      theme === "dark"
                                        ? "text-white hover:text-red-600"
                                        : "text-gray-600"
                                    }`
                              } hover:scale-110 transition-transform`}
                            />
                            <span className="text-lg font-semibold">
                              {post.likes?.length}
                            </span>
                          </button>

                          <button
                            className={`flex items-center space-x-2 ${
                              theme === "dark" ? "text-white" : "text-gray-600"
                            } hover:text-blue-500`}
                            onClick={() => {
                              handleSpecificPostComments(post._id);
                              handleStoreSpecificPostId(post._id);
                              document
                                .getElementById("addComment_Modal")
                                .showModal();
                            }}
                          >
                            <FontAwesomeIcon icon={faComment} size="lg" />
                            <span className="text-lg font-semibold">
                              {post.comments?.length}
                            </span>
                          </button>

                          <button
                            className={`flex items-center space-x-2 ${
                              theme === "dark" ? "text-white" : "text-gray-600"
                            }  hover:text-green-500`}
                          >
                            <FontAwesomeIcon
                              icon={faPaperPlane}
                              className={`text-2xl cursor-pointer ${
                                theme === "dark"
                                  ? "text-white"
                                  : " text-gray-600"
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
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                      disabled={loading || selectedUsers.length === 0}
                      onClick={() => {
                        handleSharePost();
                      }}
                    >
                      {loading
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
              {tPostDetails.length === 0 && (
                <p
                  className={`text-xl text-center ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  No trending posts available at the moment. Check back later!
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Explore;
