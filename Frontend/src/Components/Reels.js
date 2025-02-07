import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faComment,
  faShareSquare,
} from "@fortawesome/free-regular-svg-icons";
import {
  faClose,
  faPaperPlane,
  faHeart as LikeHeart,
} from "@fortawesome/free-solid-svg-icons";
import vividlyContext from "../Context/vividlyContext";
import SkeletonLoader from "./SkeletonLoader";
import { useNavigate } from "react-router-dom";
import socket from "./Socket";

const Reels = () => {
  const theme = JSON.parse(localStorage.getItem("theme"));
  const context = useContext(vividlyContext);
  const { fetchTrendingReelsFunc, fetchAllUsers, sendMediaOfPost } = context;
  const id = localStorage.getItem("id");
  const parsedId = JSON.parse(id);
  const ENDPOINT = process.env.REACT_APP_ENDPOINT;
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [countLoading, setCountLoading] = useState(0);
  const navigate = useNavigate();
  const [filteredReels, setFilteredReels] = useState(false);

  useEffect(() => {
    return () => {
      socket.off("send_message");
      socket.off("send_notification");
    };
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

    const post = tReelsDetails.find((post) => post._id === postId);
    if (post) {
      const userAlreadyLiked = post.likes.some(
        (like) => like.user === parsedUserId
      );

      if (userAlreadyLiked) {
        setTReelsDetails(
          tReelsDetails.map((p) =>
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
        setTReelsDetails(
          tReelsDetails.map((p) =>
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

    if (filteredReels !== false) {
      const fpost = filteredReels.find((post) => post._id === postId);
      if (fpost) {
        const userAlreadyLiked = post.likes.some(
          (like) => like.user === parsedUserId
        );

        if (userAlreadyLiked) {
          setFilteredReels(
            filteredReels.map((p) =>
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
          setFilteredReels(
            filteredReels.map((p) =>
              p._id === postId
                ? {
                    ...p,
                    likes: [...p.likes, { user: parsedUserId }],
                    likeStatus: "Liked",
                  }
                : p
            )
          );
        }
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
        return data.postComments.comments; // Return the likes for a given post
      }
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const [tReelsDetails, setTReelsDetails] = useState([]);

  const trendingReelsDetailsFunc = async () => {
    const posts = await fetchTrendingReelsFunc();
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
    setTReelsDetails(postsWithDetails);
  };

  const [specificPostComments, setSpecificPostComments] = useState([]);
  const handleSpecificPostComments = (id) => {
    const post = tReelsDetails.find((post) => post._id === id);
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
          setTReelsDetails(
            tReelsDetails.map((p) =>
              p._id === postId
                ? {
                    ...p,
                    comments: data.updatedComment.comments,
                  }
                : p
            )
          );
          if (filteredReels !== false) {
            setFilteredReels(
              filteredReels.map((p) =>
                p._id === postId
                  ? {
                      ...p,
                      comments: data.updatedComment.comments,
                    }
                  : p
              )
            );
          }
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
  const handlshowSkeleton = async () => {
    if (countLoading === 0) {
      setShowSkeleton(true);
    }
    await trendingReelsDetailsFunc();
    await handleFetchAllUsers();
    setCountLoading(1);
    setShowSkeleton(false);
  };

  useEffect(() => {
    handlshowSkeleton();
  }, []);

  const handSearchUser = (uId) => {
    localStorage.setItem("sUserId", JSON.stringify(uId));
    navigate("/searchUser");
  };

  const [inputField, setInputField] = useState("");
  const handleInputOnChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setInputField(e.target.value);
    if (searchTerm.length > 0) {
      setFilteredReels(
        tReelsDetails.filter((reel) =>
          reel.userData.fullName.toLowerCase().includes(searchTerm)
        )
      );
    } else {
      setFilteredReels(false);
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
      } sm:pl-72 sm:pt-24 mx-auto p-4 sm:p-6`}
    >
      {showSkeleton && <SkeletonLoader />}
      {!showSkeleton && (
        <>
          {/* Header Section */}
          <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md mb-8">
            <h1 className="text-3xl font-bold">Reels</h1>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Search Reels by User"
                value={inputField}
                onChange={handleInputOnChange}
                className="w-full px-4 py-2 rounded-lg shadow-md bg-white text-gray-800"
              />
            </div>
          </div>
          <dialog id="addComment_Modal" className="modal">
            <div
              className={`modal-box min-h-[80vh] overflow-hidden ${
                theme === "dark" ? "bg-gray-900" : "bg-white"
              }  rounded-lg shadow-lg relative`}
            >
              <form method="dialog">
                <button
                  className={`btn btn-sm btn-circle btn-ghost absolute right-4 top-4 ${
                    theme === "dark" ? "text-white text-2xl" : "text-black"
                  }  hover:bg-opacity-70 transition`}
                >
                  ✕
                </button>
              </form>

              <div className="flex justify-center mb-5">
                <h1
                  className={`cus-font ${
                    theme === "dark" ? "text-gray-200" : "text-black"
                  }  font-semibold text-4xl mb-4`}
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
                          ? "bg-gray-800 border-gray-200 hover:bg-gray-900"
                          : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                      }  rounded-xl p-2 shadow-md border  transition hover:cursor-pointer`}
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
                            theme === "dark"
                              ? "text-white font-bold"
                              : "text-black"
                          } `}
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
                    } `}
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
                      : "bg-gray-100 text-black"
                  }  focus:ring-1  focus:ring-blue-500 py-2 px-4  shadow-md focus:outline-none transition`}
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

          {/* Reels Feed */}
          <div className="space-y-8">
            {!filteredReels &&
              tReelsDetails.map((reel) => (
                <div
                  key={reel._id}
                  className={`relative ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  }  rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-[101%] hover:shadow-xl`}
                >
                  {/* Reel Video Section */}
                  <div className="relative">
                    <video
                      className="w-full sm:max-h-[80vh] object-contain rounded-t-lg"
                      src={reel.media}
                      controls
                      autoPlay
                      muted
                      loop
                    />
                  </div>

                  {/* Reel Info Section */}
                  <div className="p-5">
                    {/* User Info */}
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={reel.userData.picture}
                        alt="User profile pic"
                        className={`w-14 h-14 rounded-full border-2 ${
                          theme === "dark"
                            ? "border-gray-300"
                            : "border-gray-800"
                        }  object-cover hover:cursor-pointer`}
                        onClick={() => handSearchUser(reel.userData._id)}
                      />
                      <div>
                        <p
                          className={`text-lg font-semibold ${
                            theme === "dark" ? "text-gray-200" : "text-gray-800"
                          }  hover:cursor-pointer`}
                          onClick={() => handSearchUser(reel.userData._id)}
                        >
                          {reel.userData.fullName}
                        </p>
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-300" : "text-gray-500"
                          } `}
                        >
                          Posted on:{" "}
                          {new Date(reel.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <p
                      className={` ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      } mb-4`}
                    >
                      <span
                        className={`${
                          theme === "dark"
                            ? "text-gray-50 font-extrabold"
                            : "text-gray-900"
                        }font-bold `}
                      >
                        Description:
                      </span>
                      {reel.description}
                    </p>

                    <div className="flex justify-around mt-4 border-t pt-4">
                      <button
                        className={`flex items-center ${
                          theme === "dark" ? "text-white" : "text-gray-600"
                        }  space-x-2 text-lg hover:text-red-500 `}
                        onClick={() => handleLikePost(reel._id)}
                      >
                        <FontAwesomeIcon
                          icon={
                            reel.likeStatus === "Liked" ? LikeHeart : faHeart
                          }
                          className={`text-2xl cursor-pointer ${
                            reel.likeStatus === "Liked"
                              ? "text-red-600"
                              : `${
                                  theme === "dark"
                                    ? "text-white"
                                    : "text-gray-600"
                                }`
                          } hover:scale-110 hover:text-red-500  transition-transform`}
                        />
                        <span> {reel.likes?.length}</span>
                      </button>

                      <button
                        className={`flex items-center ${
                          theme === "dark" ? "text-white" : "text-gray-600"
                        }  hover:text-blue-500 space-x-2 text-lg`}
                        onClick={() => {
                          handleSpecificPostComments(reel._id);
                          handleStoreSpecificPostId(reel._id);
                          document
                            .getElementById("addComment_Modal")
                            .showModal();
                        }}
                      >
                        <FontAwesomeIcon icon={faComment} size="lg" />
                        <span> {reel.comments?.length}</span>
                      </button>

                      <button
                        className={`flex items-center ${
                          theme === "dark" ? "text-white" : "text-gray-600"
                        }  hover:text-green-500 space-x-2 text-lg`}
                      >
                        <FontAwesomeIcon
                          icon={faPaperPlane}
                          className={`text-2xl cursor-pointer ${
                            theme === "dark" ? "text-white" : " text-gray-600"
                          } hover:text-green-500`}
                          onClick={() => {
                            handleShareOnClick(
                              reel.media,
                              reel.mediaType,
                              reel._id
                            );
                            toggleModal();
                          }}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
            {filteredReels &&
              filteredReels.map((reel) => (
                <div
                  key={reel._id}
                  className={`relative ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  }  rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-[101%] hover:shadow-xl`}
                >
                  {/* Reel Video Section */}
                  <div className="relative">
                    <video
                      className="w-full sm:max-h-[80vh] object-contain rounded-t-lg"
                      src={reel.media}
                      controls
                      autoPlay
                      muted
                      loop
                    />
                  </div>

                  {/* Reel Info Section */}
                  <div className="p-5">
                    {/* User Info */}
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={reel.userData.picture}
                        alt="User profile pic"
                        className="w-14 h-14 rounded-full border-2 border-gray-800 object-cover hover:cursor-pointer"
                        onClick={() => handSearchUser(reel.userData._id)}
                      />
                      <div>
                        <p
                          className={`text-lg font-semibold ${
                            theme === "dark"
                              ? "text-white font-bold"
                              : "text-gray-800"
                          }  hover:cursor-pointer`}
                          onClick={() => handSearchUser(reel.userData._id)}
                        >
                          {reel.userData.fullName}
                        </p>
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-100" : "text-gray-500"
                          } `}
                        >
                          Posted on:{" "}
                          {new Date(reel.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p
                      className={`${
                        theme === "dark" ? "text-gray-100" : "text-gray-700"
                      } mb-4`}
                    >
                      <span
                        className={`font-bold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        } `}
                      >
                        Description:
                      </span>{" "}
                      {reel.description}
                    </p>

                    {/* Interaction Buttons */}
                    <div className="flex justify-around mt-4 border-t pt-4">
                      <button
                        className={`flex items-center ${
                          theme === "dark" ? "text-white" : "text-gray-600"
                        }  hover:text-red-500 space-x-2 text-lg`}
                        onClick={() => handleLikePost(reel._id)}
                      >
                        <FontAwesomeIcon
                          icon={
                            reel.likeStatus === "Liked" ? LikeHeart : faHeart
                          }
                          className={`text-2xl cursor-pointer ${
                            reel.likeStatus === "Liked"
                              ? "text-red-600"
                              : `${
                                  theme === "dark"
                                    ? "text-white"
                                    : "text-gray-600"
                                }`
                          } hover:scale-110 transition-transform`}
                        />
                        <span> {reel.likes?.length}</span>
                      </button>

                      <button
                        className={`flex items-center ${
                          theme === "dark" ? "text-white" : "text-gray-600"
                        }  hover:text-blue-500 space-x-2 text-lg`}
                        onClick={() => {
                          handleSpecificPostComments(reel._id);
                          handleStoreSpecificPostId(reel._id);
                          document
                            .getElementById("addComment_Modal")
                            .showModal();
                        }}
                      >
                        <FontAwesomeIcon icon={faComment} size="lg" />
                        <span> {reel.comments?.length}</span>
                      </button>

                      <button
                        className={`flex items-center ${
                          theme === "dark" ? "text-white" : "text-gray-600"
                        }  hover:text-green-500 space-x-2 text-lg`}
                      >
                        <FontAwesomeIcon
                          icon={faPaperPlane}
                          className={`text-2xl cursor-pointer ${
                            theme === "dark" ? "text-white" : " text-gray-600"
                          } hover:text-green-500`}
                          onClick={() => {
                            handleShareOnClick(
                              reel.media,
                              reel.mediaType,
                              reel._id
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

          {filteredReels && filteredReels.length === 0 && (
            <p
              className={`text-2xl text-center ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }  font-semibold`}
            >
              Oops! No reels are available for this user.
            </p>
          )}
          {tReelsDetails.length === 0 && (
            <p
              className={`text-2xl text-center ${
                theme === "dark" ? "text-gray-300" : "text-gray-800"
              } `}
            >
              Oops! There are no reels available at the moment.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default Reels;
