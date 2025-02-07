import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faHeart as LikeHeart,
  faCamera,
  faClose,
} from "@fortawesome/free-solid-svg-icons";
import {
  faComment,
  faHeart,
  faPaperPlane,
  faPenToSquare as faPenRegular,
  faTrashAlt,
} from "@fortawesome/free-regular-svg-icons";
import profileCover from "../Images/profileCover.jpg";
import vividlyContext from "../Context/vividlyContext";
import Avatar from "../Images/Avatar.jpeg";
import SkeletonLoader from "./SkeletonLoader";
import { useNavigate } from "react-router-dom";

import CustomConfirm from "./CustomConfirm";
import socket from "./Socket";

const Profile = () => {
  const context = useContext(vividlyContext);
  const {
    showSuggestionFunc,
    suggestions,
    handleDeletePost,
    handleEditPost,
    handleUpdateProfileCover,
    fetchAllUsers,
    sendMediaOfPost,
  } = context;
  const navigate = useNavigate();
  const [userPost, setUserPost] = useState([]);
  const ENDPOINT = process.env.REACT_APP_ENDPOINT;
  const [userProfile, setUserProfile] = useState("");
  const id = localStorage.getItem("id");
  const parsedId = JSON.parse(id);

  const [profileCoverPic, setProfileCoverPic] = useState(profileCover);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(profileCover);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [countLoading, setCountLoading] = useState(0);
  const [loading, setLoading] = useState({});

  const handlefetchUserProfile = async () => {
    if (countLoading === 0) {
      setShowSkeleton(true);
    }
    handleFetchAllUsers();

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
        if (data.profileCoverPic !== "Not set") {
          setSelectedImage(data.profileCoverPic);
        }
      } else {
        console.log("Error");
      }

      setCountLoading(1);
      setShowSkeleton(false);
    } catch (error) {
      console.log("Error:", error.message);
      setShowSkeleton(false);
    }
  };

  useEffect(() => {
    return () => {
      socket.off("send_message");
      socket.off("send_notification");
    };
  }, []);

  useEffect(() => {
    handlefetchUserProfile();
    showSuggestionFunc();
  }, [userPost, profileCoverPic, loading]);
  const [navigation, setNavigation] = useState("posts");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState("");
  const theme = JSON.parse(localStorage.getItem("theme"));

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

    const post = userPost.find((post) => post._id === postId);
    if (post) {
      const userAlreadyLiked = post.likes.some(
        (like) => like.user === parsedUserId
      );

      if (userAlreadyLiked) {
        setUserPost(
          userPost.map((p) =>
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
        setUserPost(
          userPost.map((p) =>
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

  const handleFetchUserPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/post/fetchUserPosts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      if (data.success) {
        const postsWithDetails = await Promise.all(
          data.uPost.map(async (post) => {
            const likes = await handleFetchPostLikes(post._id);
            const comments = await handleFetchPostComments(post._id);
            let likeStatus = likes.some((like) => like.user === parsedId)
              ? "Liked"
              : "Not Liked";

            return { ...post, likes, comments, likeStatus };
          })
        );
        setUserPost(postsWithDetails);
      }
    } catch (error) {
      console.log("Error:", error.message);
    }
  };

  useEffect(() => {
    handleFetchUserPosts();
  }, []);

  const handleMediaChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return console.log("Please upload a file!");
    }

    const formdata = new FormData();
    formdata.append("media", file);

    try {
      const data = await fetch(`${ENDPOINT}/api/post/media`, {
        method: "POST",
        body: formdata,
      });
      const response = await data.json();
      if (response.success) {
        setMedia(response.url);
      }
    } catch (error) {
      console.log(error);
    }

    setMediaPreview(URL.createObjectURL(file));
    setMediaFile(file);
  };

  const [selectedMedia, setSelectedMedia] = useState("");

  const handleEditMediaChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return console.log("Please upload a file!");
    }

    const formdata = new FormData();
    formdata.append("media", file);

    try {
      const data = await fetch(`${ENDPOINT}/api/post/media`, {
        method: "POST",
        body: formdata,
      });
      const response = await data.json();
      if (response.success) {
        if (file.name.endsWith(".mp4")) {
          setEditPostDetails({
            ...editPostDetails,
            postMedia: URL.createObjectURL(file),
            postMediaType: "video",
          });
        } else {
          setEditPostDetails({
            ...editPostDetails,
            postMedia: URL.createObjectURL(file),
            postMediaType: "image",
          });
        }
        setSelectedMedia(response.url);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
  };

  const handleCreatePost = async () => {
    try {
      const mediaType = mediaFile.type.startsWith("video/") ? "video" : "image";
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/post/createPost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
        body: JSON.stringify({
          description: caption,
          media: media,
          mediaType: mediaType,
        }),
      });
      const data = await response.json();
      setMediaFile(null);
      setMediaPreview("");
      setCaption("");
      setUserPost([...userPost, data]);
      await handleFetchUserPosts();
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const [specificPostComments, setSpecificPostComments] = useState([]);
  const handleSpecificPostComments = (id) => {
    const post = userPost.find((post) => post._id === id);
    setSpecificPostComments(post.comments);
  };

  const [specificPostId, setSpecificPosId] = useState("");

  const handleStoreSpecificPostId = (id) => {
    setSpecificPosId(id);
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
        if (data.success) {
          setSpecificPostComments(data.updatedComment.comments);
          setUserPost(
            userPost.map((p) =>
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

  const [userFollowers, setUserFollowers] = useState([]);

  const handleFetchUFollowersList = async (userId) => {
    const token = localStorage.getItem("token");
    const parsedToken = JSON.parse(token);
    try {
      const response = await fetch(
        `${ENDPOINT}/api/user/userFollowersList/${userId}`,
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
        setUserFollowers(data.fetchFolloweruData);
      } else {
        console.log("Error");
      }
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const deletePostFunc = async (postId) => {
    setShowConfirm(false);
    const response = await handleDeletePost(postId);
    if (response.success) {
      setUserPost(userPost.filter((p) => p._id !== postId));
    }
  };
  useEffect(() => {
    handleFetchUFollowersList(parsedId);
  }, []);

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  const [editPostDetails, setEditPostDetails] = useState({
    postId: "",
    postDescription: "",
    postMedia: "",
    postMediaType: "",
  });

  const handleEditPostDetails = (pId, pDesc, pMedia, pMediaType) => {
    setEditPostDetails({
      postId: pId,
      postDescription: pDesc,
      postMedia: pMedia,
      postMediaType: pMediaType,
    });
  };

  const editModalref = useRef(null);

  const handleUpdatePostFunc = async (postId, desc, media, mediaType) => {
    editModalref.current.close();
    const response = await handleEditPost(postId, desc, media, mediaType);
    if (response.success) {
      setUserPost(
        userPost.map((p) =>
          p._id === postId
            ? {
                ...p,
                description: editPostDetails.postDescription,
                media: editPostDetails.postMedia,
                mediaType: editPostDetails.postMediaType,
              }
            : p
        )
      );
    }
  };

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
        socket.emit("send_notification", data);
      } else {
        setIsFollow({ ...isFollow, [uId]: false });
      }
      setLoading({ ...loading, [uId]: false });
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const handleOpenModal = () => setShowModal(true);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formdata = new FormData();
      formdata.append("media", file);
      try {
        const data = await fetch(`${ENDPOINT}/api/post/media`, {
          method: "POST",
          body: formdata,
        });
        const response = await data.json();
        if (response.success) {
          setSelectedImage(response.url);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const UpdateProfileCoverFunc = async (pic) => {
    const response = await handleUpdateProfileCover(pic);
    if (response.success) {
      setProfileCoverPic(pic);
      setShowModal(false);
    }
  };

  const handSearchUser = (uId) => {
    localStorage.setItem("sUserId", JSON.stringify(uId));
    navigate("/searchUser");
  };
  const [showConfirm, setShowConfirm] = useState(false);

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

  const [delPostId, setDelPostId] = useState("");

  return (
    <div
      className={`max-w-7xl mx-auto min-h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      }  sm:pl-72 sm:pt-24 p-4`}
    >
      {/* Header Section */}
      {showSkeleton && <SkeletonLoader />}
      {!showSkeleton && (
        <>
          <div className="relative bg-gray-200 h-44 md:h-48 lg:h-72 rounded-lg">
            {/* Cover Image */}
            <img
              src={
                (userProfile.profileCoverPic !== "Not set" &&
                  userProfile.profileCoverPic) ||
                profileCover
              }
              alt="Cover"
              className="w-full h-full object-cover rounded-lg"
            />

            {/* Profile Section */}
            <div className="absolute bottom-[-50%] left-6 flex flex-col">
              <img
                src={userProfile.uPic || Avatar}
                alt="Profile"
                className="w-36 h-36 rounded-full object-cover 
            border-[4px] border-white shadow-lg"
              />

              <div className="ml-4 mt-2 lg:mb-6">
                <h2
                  className={`text-2xl ${
                    theme === "dark" ? "text-gray-200" : "text-black"
                  }  font-bold`}
                >
                  {userProfile?.uFullname}
                </h2>
                <p
                  className={`${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  } mt-[-2px]`}
                >
                  @{userProfile?.uUsername}
                </p>
              </div>
            </div>

            {/* Edit Icon with Improved Styling */}
            <div className="absolute top-4 right-4 flex space-x-2 hover:cursor-pointer">
              <FontAwesomeIcon
                className="text-2xl text-gray-700 bg-white p-2 rounded-full 
            shadow-md border border-gray-300 hover:bg-blue-500 
            hover:text-white transition-all duration-300"
                icon={faPenToSquare}
              />
            </div>

            {/* Edit Icon for Modal Trigger */}
            <div className="absolute top-4 right-4 flex space-x-2 hover:cursor-pointer">
              <FontAwesomeIcon
                className="text-2xl text-gray-700 bg-white p-2 rounded-full 
                    shadow-md border border-gray-300 hover:bg-blue-500 
                    hover:text-white transition-all duration-300"
                icon={faPenToSquare}
                onClick={handleOpenModal}
              />
            </div>

            {/* Modal for Profile Picture Edit */}
            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div
                  className={` ${
                    theme === "dark" ? "bg-gray-900" : "bg-white"
                  } p-6 rounded-lg shadow-lg text-center`}
                >
                  <h2
                    className={`text-2xl font-semibold mb-4 ${
                      theme === "dark" ? "text-gray-200" : "text-black"
                    } `}
                  >
                    Update Profile Picture
                  </h2>
                  {/* Display Current Image in Modal */}
                  <img
                    src={selectedImage}
                    alt="Selected Pic"
                    className="w-full h-44 rounded-lg object-cover mx-auto border-2 border-gray-300"
                  />

                  {/* File Upload Button inside Modal */}
                  <label className="flex items-center justify-center gap-2 cursor-pointer mt-4">
                    <FontAwesomeIcon
                      icon={faCamera}
                      className={`text-2xl ${
                        theme === "dark" ? "text-gray-200" : "text-gray-600"
                      } `}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <span
                      className={` ${
                        theme === "dark" ? "text-blue-400" : "text-blue-600"
                      } underline`}
                    >
                      Change Image
                    </span>
                  </label>

                  {/* Save & Cancel Buttons */}
                  <div className="flex justify-center mt-6 space-x-4">
                    <button
                      onClick={() => UpdateProfileCoverFunc(selectedImage)}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className={`px-6 py-2 ${
                        theme === "dark"
                          ? "bg-gray-500 text-white hover:bg-gray-700"
                          : "bg-gray-400 text-white hover:bg-gray-500"
                      }  rounded-lg `}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Stats */}
          <div
            className={`mt-[90px] lg:mt-28 ${
              theme === "dark" ? "bg-gray-900" : "bg-white"
            }  rounded-lg shadow-md p-4 grid grid-cols-3 text-center`}
          >
            <div>
              <h3
                className={`text-lg font-bold ${
                  theme === "dark" ? "text-gray-200" : "text-black"
                } `}
              >
                {userProfile && userProfile.uPosts.length}
              </h3>
              <p
                className={`${
                  theme === "dark" ? "text-white font-bold" : "text-black"
                }`}
              >
                Posts
              </p>
            </div>
            <div>
              <h3
                className={`text-lg font-bold ${
                  theme === "dark" ? "text-gray-200" : "text-black"
                }  hover:cursor-pointer`}
                onClick={() => navigate("/userFollowers")}
              >
                {userProfile && userProfile.uFollowers.followersList.length}
              </h3>
              <p
                className={`${
                  theme === "dark" ? "text-white font-bold" : "text-black"
                } hover:cursor-pointer`}
                onClick={() => navigate("/userFollowers")}
              >
                Followers
              </p>
            </div>

            <div>
              <h3
                className={`text-lg font-bold ${
                  theme === "dark" ? "text-gray-200" : "text-black"
                }  hover:cursor-pointer`}
                onClick={() => navigate("/userFollowing")}
              >
                {userProfile && userProfile.uFollowing.followingList.length}
              </h3>
              <p
                className={`${
                  theme === "dark" ? "text-white font-bold" : "text-black"
                } hover:cursor-pointer`}
                onClick={() => navigate("/userFollowing")}
              >
                Following
              </p>
            </div>
          </div>
          <div
            className={`p-6 ${
              theme === "dark"
                ? "bg-gray-800 border-[1px] border-gray-200"
                : "bg-white"
            }  rounded-lg shadow-lg mt-2`}
          >
            {/* Upload Section */}
            <label
              htmlFor="mediaUpload"
              className={`cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-lg ${
                theme === "dark"
                  ? "hover:border-blue-600"
                  : "hover:border-blue-500"
              }  transition`}
            >
              {mediaPreview ? (
                <p className="text-blue-500 font-semibold">Change Media</p>
              ) : (
                <>
                  <svg
                    className="w-12 h-12 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 4v16m8-8H4"></path>
                  </svg>
                  <p
                    className={` ${
                      theme === "dark" ? "text-white" : "text-gray-600"
                    } mt-2 text-center`}
                  >
                    Click to upload an image or video
                  </p>
                </>
              )}
              <input
                type="file"
                id="mediaUpload"
                className="hidden"
                accept="image/*, video/*"
                onChange={handleMediaChange}
              />
            </label>

            {/* Media Preview Section */}
            {mediaPreview && (
              <div className="mt-4">
                {mediaFile.type.startsWith("video/") ? (
                  <video
                    src={mediaPreview}
                    controls
                    className="w-full h-auto rounded-lg"
                  />
                ) : (
                  <img
                    src={mediaPreview}
                    alt="Media Preview"
                    className="w-full h-auto rounded-lg"
                  />
                )}
              </div>
            )}

            {/* Text Caption */}
            {mediaPreview && (
              <textarea
                className={`mt-4 w-full p-3 border border-gray-300 rounded-lg  focus:outline-none ${
                  theme === "dark"
                    ? "text-white bg-gray-800 focus:ring-1 focus:ring-blue-500"
                    : "text-black focus:ring-2 focus:ring-blue-500"
                } `}
                placeholder="Write a caption..."
                value={caption}
                onChange={handleCaptionChange}
              />
            )}

            {/* Action Buttons */}
            <div className="flex justify-end mt-4 space-x-3">
              {mediaFile && (
                <>
                  <button
                    className="py-2 px-6 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
                    onClick={() => {
                      setMediaFile(null);
                      setMediaPreview("");
                      setCaption("");
                    }}
                    disabled={!mediaFile}
                  >
                    Cancel
                  </button>
                  <button
                    className={`py-2 px-6 rounded-lg text-white ${
                      mediaFile && caption
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    onClick={handleCreatePost}
                    disabled={!mediaFile || !caption}
                  >
                    Create Post
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex space-x-4">
            <button
              className={`py-2 ${
                navigation === "posts"
                  ? "border-blue-500 border-b-2 text-blue-500"
                  : `${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    } hover:text-blue-500`
              }`}
              onClick={() => {
                setNavigation("posts");
              }}
            >
              Posts
            </button>
            <button
              className={`py-2 ${
                navigation === "follower"
                  ? "border-blue-500 border-b-2 text-blue-500"
                  : `${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    } hover:text-blue-500`
              }`}
              onClick={() => {
                setNavigation("follower");
              }}
            >
              Followers
            </button>
          </div>
          <dialog id="editPost_Modal" ref={editModalref} className="modal">
            <div
              className={`modal-box max-h-[90vh] overflow-y-auto  ${
                theme === "dark" ? "bg-gray-900" : "bg-white"
              } rounded-lg shadow-2xl p-6 border border-gray-200`}
            >
              <form method="dialog">
                <button
                  className={`btn btn-sm btn-circle btn-ghost absolute right-4 top-4  ${
                    theme === "dark"
                      ? "text-white text-2xl font-bold"
                      : "text-black"
                  }  hover:text-red-600 transition duration-300`}
                >
                  ✕
                </button>
              </form>

              <div className="flex justify-center mb-6">
                <h1
                  className={`text-4xl font-extrabold  ${
                    theme === "dark" ? "text-gray-200" : "text-gray-900"
                  } `}
                >
                  Edit Post
                </h1>
              </div>

              {/* Media Preview with Change Icon */}
              <div className="relative w-full flex justify-center mb-8 group">
                {editPostDetails.postMediaType === "image" ? (
                  <img
                    src={editPostDetails.postMedia || Avatar}
                    alt="Post Media"
                    className="w-full max-h-96 object-cover rounded-xl shadow-lg border border-gray-200"
                  />
                ) : (
                  <video
                    src={editPostDetails.postMedia || Avatar}
                    controls
                    className="w-full max-h-96 object-cover rounded-xl shadow-lg border border-gray-200"
                  />
                )}

                {/* Change Media Icon Overlay */}
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*, video/*"
                    className="hidden"
                    onChange={(e) => handleEditMediaChange(e)}
                  />
                  <FontAwesomeIcon
                    icon={faCamera}
                    className="text-white text-5xl cursor-pointer drop-shadow-lg"
                  />
                </label>
              </div>

              {/* Post Description */}
              <div className="flex flex-col mb-6">
                <label
                  className={`text-xl font-medium  ${
                    theme === "dark"
                      ? "text-gray-200 font-bold"
                      : "text-gray-800"
                  }  mb-2`}
                >
                  Post Description
                </label>
                <textarea
                  className={`w-full p-4 border ${
                    theme === "dark"
                      ? "border-white bg-gray-800 text-gray-200"
                      : "border-gray-300 text-black"
                  }  rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm`}
                  rows="3"
                  value={editPostDetails.postDescription}
                  onChange={(e) =>
                    setEditPostDetails({
                      ...editPostDetails,
                      postDescription: e.target.value,
                    })
                  }
                />
              </div>

              {/* Update Button */}
              <div className="flex justify-end">
                <button
                  onClick={() =>
                    handleUpdatePostFunc(
                      editPostDetails.postId,
                      editPostDetails.postDescription,
                      selectedMedia,
                      editPostDetails.postMediaType
                    )
                  }
                  className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:from-blue-600 hover:to-blue-800 transition duration-300 transform hover:scale-105"
                >
                  Update Post
                </button>
              </div>
            </div>
          </dialog>

          <dialog id="addComment_Modal" className="modal sm:p-0 p-2">
            <div
              className={`modal-box min-h-[80vh] overflow-hidden ${
                theme === "dark" ? "bg-gray-900" : "bg-white"
              }  rounded-lg shadow-lg relative`}
            >
              <form method="dialog">
                <button
                  className={`btn btn-sm btn-circle btn-ghost absolute right-4 top-4 ${
                    theme === "dark"
                      ? "text-white font-bold text-2xl"
                      : "text-black"
                  }  hover:bg-opacity-70 transition`}
                >
                  ✕
                </button>
              </form>

              <div className="flex justify-center mb-5">
                <h1
                  className={`cus-font ${
                    theme === "dark" ? "text-gray-100" : "text-black"
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
                          ? "bg-gray-800 border border-white hover:bg-gray-900"
                          : "bg-gray-100 border border-gray-300 hover:bg-gray-200"
                      }  rounded-xl p-2 shadow-md  transition hover:cursor-pointer`}
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
                            theme === "dark" ? "text-gray-100" : "text-black"
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
                  <div className="flex justify-center items-center h-[55vh] custom-font text-2xl sm:text-3xl text-gray-600">
                    No Comments Here
                  </div>
                )}
              </div>

              {/* Fixed position input */}
              <div className="absolute bottom-5 left-0 w-full px-4">
                <input
                  className={`w-full rounded-full ${
                    theme === "dark"
                      ? "bg-gray-800 text-gray-200"
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

          {/* Posts Section */}
          {navigation === "posts" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 elg:grid-cols-3 gap-6 mt-6 p-4">
                {userPost.map((post) => (
                  <div
                    key={post._id}
                    className={`${
                      theme === "dark"
                        ? "bg-gray-800 border border-white"
                        : "bg-white border border-gray-300"
                    }   shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105 duration-300`}
                  >
                    {/* Post Media Section */}
                    <div className="relative group">
                      {post.mediaType === "image" ? (
                        <img
                          src={post.media}
                          alt="Post Media"
                          className="w-full h-64 object-cover"
                        />
                      ) : (
                        <video
                          src={post.media}
                          controls
                          className="w-full h-64 object-cover"
                        />
                      )}
                      {/* Edit and Delete Icons */}
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <FontAwesomeIcon
                          icon={faPenRegular}
                          className="text-white text-2xl cursor-pointer bg-black bg-opacity-60 p-2 rounded-full hover:text-blue-400"
                          onClick={() => {
                            handleEditPostDetails(
                              post._id,
                              post.description,
                              post.media,
                              post.mediaType
                            );
                            document
                              .getElementById("editPost_Modal")
                              .showModal();
                          }}
                        />
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          className="text-white text-2xl cursor-pointer bg-black bg-opacity-60 p-2 rounded-full hover:text-red-500"
                          onClick={() => {
                            setDelPostId(post._id);
                            setShowConfirm(true);
                          }}
                        />
                      </div>
                    </div>

                    {/* Post Description Section */}
                    <div className="p-4">
                      <p
                        className={`text-lg ${
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        }  font-semibold mb-2`}
                      >
                        {post.description || "No description provided."}
                      </p>
                    </div>

                    {/* Like, Comment, Share Section */}
                    <div
                      className={`p-3 border-t  ${
                        theme === "dark" ? "border-white" : "border-gray-300"
                      }  flex justify-between items-center`}
                    >
                      <div className="flex items-center space-x-4">
                        <FontAwesomeIcon
                          icon={
                            post.likeStatus === "Liked" ? LikeHeart : faHeart
                          }
                          className={`text-2xl hover:text-red-600 cursor-pointer ${
                            post.likeStatus === "Liked"
                              ? "text-red-600"
                              : ` ${
                                  theme === "dark"
                                    ? "text-gray-50"
                                    : "text-gray-600"
                                }`
                          } hover:scale-110 transition-transform`}
                          onClick={() => handleLikePost(post._id)}
                        />
                        <span
                          className={`text-lg  ${
                            theme === "dark" ? "text-gray-100" : "text-gray-700"
                          } `}
                        >
                          {post.likes?.length}
                        </span>

                        <FontAwesomeIcon
                          icon={faComment}
                          className={`text-2xl cursor-pointer  ${
                            theme === "dark" ? "text-gray-200" : "text-gray-600"
                          }  hover:text-blue-500`}
                          onClick={() => {
                            handleSpecificPostComments(post._id);
                            handleStoreSpecificPostId(post._id);
                            document
                              .getElementById("addComment_Modal")
                              .showModal();
                          }}
                        />
                        <span
                          className={`text-lg  ${
                            theme === "dark" ? "text-gray-100" : "text-gray-700"
                          } `}
                        >
                          {post.comments?.length}
                        </span>
                      </div>

                      {/* Share Button */}
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
                ))}
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
              {userPost.length === 0 ? (
                <p
                  className={`text-2xl text-center ${
                    theme === "dark" ? "text-gray-200" : "text-gray-600"
                  } mb-8`}
                >
                  No posts yet. Share something to get started!
                </p>
              ) : (
                ""
              )}
            </>
          )}
          {showConfirm && (
            <CustomConfirm
              message="Are you sure you want to delete this post?"
              onConfirm={() => deletePostFunc(delPostId)}
              onCancel={handleCancelDelete}
            />
          )}

          {navigation === "follower" && (
            <div
              className={`${
                theme === "dark"
                  ? "bg-gray-800 border border-gray-300"
                  : "bg-white"
              } p-6 mt-4 rounded-lg shadow-md`}
            >
              <h3
                className={`text-2xl font-bold mb-4 ${
                  theme === "dark" ? "text-gray-200 font-bold" : "text-black"
                } `}
              >
                Followers
              </h3>

              {/* Followers Section */}
              <div className="overflow-y-auto max-h-52">
                {/* Adjust max height to control scroll */}
                <ul className="space-y-4">
                  {userFollowers.map((user) => {
                    return (
                      <li
                        key={user._id}
                        className="flex items-center space-x-3"
                      >
                        <img
                          src={user.picture}
                          alt="Failed to load img"
                          className={`w-10 h-10 ${
                            theme === "dark" ? "border-2 border-gray-400" : ""
                          } rounded-full object-cover hover:cursor-pointer`}
                          onClick={() => handSearchUser(user._id)}
                        />
                        <span
                          className={`${
                            theme === "dark"
                              ? "text-gray-200 font-bold"
                              : "text-gray-800"
                          } hover:cursor-pointer`}
                          onClick={() => handSearchUser(user._id)}
                        >
                          {user.fullName}
                        </span>
                      </li>
                    );
                  })}
                  {userFollowers.length === 0 ? (
                    <p
                      className={`text-lg text-center ${
                        theme === "dark" ? "text-gray-200" : "text-gray-600"
                      } `}
                    >
                      No followers yet. Start connecting with people!
                    </p>
                  ) : (
                    ""
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Suggestions Section */}
          <div
            className={`mt-6 ${
              theme === "dark"
                ? "bg-gray-800 border-[1px] border-white"
                : "bg-white"
            }  p-4 rounded-lg shadow-md max-h-64 overflow-y-auto`}
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
                        ? "bg-gray-800 border-[1px] border-gray-300"
                        : "bg-gray-100"
                    }  p-3 rounded-lg`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={data.picture}
                        alt="Failed to load Img"
                        className={`w-12 h-12 rounded-full ${
                          theme === "dark" ? "border-2 border-gray-400" : ""
                        } object-cover hover:cursor-pointer`}
                        onClick={() => handSearchUser(data._id)}
                      />
                      <p
                        className={`font-bold ${
                          theme === "dark" ? "text-gray-200" : "text-black "
                        } hover:cursor-pointer`}
                        onClick={() => handSearchUser(data._id)}
                      >
                        {data.fullName}
                      </p>
                    </div>
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => handleFollowUnFollow(data._id)}
                      disabled={loading[data._id]}
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
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
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

export default Profile;
