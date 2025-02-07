import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import vividlyContext from "../Context/vividlyContext";
import Avatar from "../Images/Avatar.jpeg";

import {
  faClose,
  faHeart as LikeHeart,
} from "@fortawesome/free-solid-svg-icons";
import { faComment, faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import { faTrashAlt, faHeart } from "@fortawesome/free-regular-svg-icons";
import SkeletonLoader from "./SkeletonLoader";
import { useNavigate } from "react-router-dom";
import socket from "./Socket";

const Home = () => {
  const theme = JSON.parse(localStorage.getItem("theme"));

  const context = useContext(vividlyContext);
  const {
    handleCreateStoryWithMediaOnly,
    handleCreateStoryTextAndMedia,
    handleDelStory,
    handleFollowedUserPosts,
    fetchAllUsers,
    sendMediaOfPost,
  } = context;

  const id = localStorage.getItem("id");
  const parsedId = JSON.parse(id);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [countLoading, setCountLoading] = useState(0);
  const navigate = useNavigate();

  const [showPrevIcon, setShowPrevIcon] = useState(false);
  const [showNextIcon, setShowNextIcon] = useState(true);
  const storiesContainerRef = useRef(null);
  const [userProfile, setUserProfile] = useState("");

  const [groupedStories, setGroupedStories] = useState([]);

  useEffect(() => {
    return () => {
      socket.off("send_message");
      socket.off("send_notification");
    };
  }, []);

  const processStories = (stories) => {
    const newGroupedStories = {};
    stories.forEach((story) => {
      if (!newGroupedStories[story.user._id]) {
        newGroupedStories[story.user._id] = {
          user: story.user,
          stories: [],
        };
      }
      newGroupedStories[story.user._id].stories.push(story);
    });

    setGroupedStories((prevStories) => {
      const updatedStories = {
        ...prevStories.reduce((acc, group) => {
          acc[group.user._id] = group;
          return acc;
        }, {}),
      };
      Object.values(newGroupedStories).forEach((group) => {
        if (!updatedStories[group.user._id]) {
          updatedStories[group.user._id] = group;
        } else {
          const existingStoryIds = new Set(
            updatedStories[group.user._id].stories.map((story) => story._id)
          );
          group.stories.forEach((story) => {
            if (!existingStoryIds.has(story._id)) {
              updatedStories[group.user._id].stories.push(story);
            }
          });
        }
      });

      return Object.values(updatedStories);
    });
  };

  const handleFetchFollowedUserStories = async () => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(
        `${ENDPOINT}/api/story/getFollowUserStories`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
        }
      );
      const data = await response.json();

      if (
        data.success &&
        data.message !== "No stories found for the users you're following."
      ) {
        processStories(data.stories);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const handleFetchUserStories = async () => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/story/getUStories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      if (data.success) {
        processStories(data.stories);
      }
    } catch (error) {
      console.log("Error:", error.message);
    }
  };

  const handlefetchUserProfile = async () => {
    if (countLoading === 0) {
      setShowSkeleton(true);
    }
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
      setCountLoading(1);
      setShowSkeleton(false);
    } catch (error) {
      setCountLoading(1);
      setShowSkeleton(false);
      console.log("Error:", error.message);
    }
  };

  const [users, setUsers] = useState([]);

  const ENDPOINT = process.env.REACT_APP_ENDPOINT;

  useEffect(() => {
    const handleScroll = () => {
      if (storiesContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } =
          storiesContainerRef.current;

        // Show "prev" icon if scrollLeft > 0
        setShowPrevIcon(scrollLeft > 0);

        // Show "next" icon if there's more content to scroll
        setShowNextIcon(scrollLeft + clientWidth < scrollWidth - 1);
      }
    };

    // Attach scroll event listener
    const container = storiesContainerRef.current;
    container.addEventListener("scroll", handleScroll);

    // Initial state update
    handleScroll();

    return () => {
      // Cleanup event listener
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const [mediaPreview, setMediaPreview] = useState(null);
  const [storyMediaPreview, setStoryMediaPreview] = useState(null);

  const [mediaFile, setMediaFile] = useState(null);
  const [storyMediaFile, setStoryMediaFile] = useState(null);
  const [media, setMedia] = useState("");
  const [caption, setCaption] = useState("");
  const [storyCaption, setStoryCaption] = useState("");
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

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

  const handleStoryChange = async (e) => {
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

    setStoryMediaPreview(URL.createObjectURL(file));
    setStoryMediaFile(file);
  };

  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
  };

  const handleStoryCaptionChange = (e) => {
    setStoryCaption(e.target.value);
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
      // setUserPost([...userPost, data]);
      // await handleFetchUserPosts();
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const handleCreateStory = async () => {
    try {
      if (storyMediaFile && storyCaption) {
        const response = await handleCreateStoryTextAndMedia(
          media,
          storyCaption
        );
        if (response.success) {
          setStoryMediaFile(null);
          setStoryMediaPreview("");
          setStoryCaption("");
        }
      } else if (storyMediaFile) {
        const response = await handleCreateStoryWithMediaOnly(media);
        if (response.success) {
          setStoryMediaFile(null);
          setStoryMediaPreview("");
          setStoryCaption("");
        }
      }
      await handleFetchUserStories();

      // setUserPost([...userPost, data]);
      // await handleFetchUserPosts();
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const handleStoryClick = (stories) => {
    setSelectedStory(stories);
  };

  const handleDeleteStory = async (storyId) => {
    const response = await handleDelStory(storyId);

    if (response.success) {
      if (selectedStory.stories.length > 1) {
        setSelectedStory({
          ...selectedStory,
          stories: selectedStory.stories.filter((s) => s._id !== storyId),
        });
        setGroupedStories((prevStories) =>
          prevStories.map((s) =>
            s.user._id === parsedId
              ? {
                  ...s,
                  stories: s.stories.filter((story) => story._id !== storyId),
                }
              : s
          )
        );

        if (currentStoryIndex > 0) {
          setCurrentStoryIndex(currentStoryIndex - 1);
        }
      } else {
        setSelectedStory(null);
        setGroupedStories(
          groupedStories.filter((s) => s.user._id !== parsedId)
        );
      }
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

    const post = fUserPostDetails.find((post) => post._id === postId);
    if (post) {
      const userAlreadyLiked = post.likes.some(
        (like) => like.user === parsedUserId
      );

      if (userAlreadyLiked) {
        setFUserPostDetails(
          fUserPostDetails.map((p) =>
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
        setFUserPostDetails(
          fUserPostDetails.map((p) =>
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
        return data.postComments.comments; // Return the likes for a given post
      }
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const [fUserPostDetails, setFUserPostDetails] = useState([]);

  const handleFollowedUserPostDetails = async () => {
    const posts = await handleFollowedUserPosts();
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
    setFUserPostDetails(postsWithDetails);
  };

  const [specificPostComments, setSpecificPostComments] = useState([]);
  const handleSpecificPostComments = (id) => {
    const post = fUserPostDetails.find((post) => post._id === id);
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
          setFUserPostDetails(
            fUserPostDetails.map((p) =>
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

  function timeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
  }

  const handSearchUser = (uId) => {
    localStorage.setItem("sUserId", JSON.stringify(uId));
    navigate("/searchUser");
  };

  const handleFetchAllUsers = async () => {
    const response = await fetchAllUsers();
    if (response.success) {
      setUsers(response.allUsers, { selected: false });
    }
  };

  useEffect(() => {
    handlefetchUserProfile();
    handleFetchFollowedUserStories();
    handleFetchUserStories();
    handleFollowedUserPostDetails();
    handleFetchAllUsers();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
    <>
      <div
        className={`flex ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        } min-h-screen sm:pl-72 sm:pt-24 max-w-7xl mx-auto sm:p-4`}
      >
        {showSkeleton && <SkeletonLoader />}
        {!showSkeleton && (
          <>
            <div
              className={`w-full ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }  p-4 rounded-lg shadow-lg`}
            >
              <div className="relative mb-6">
                <div
                  ref={storiesContainerRef}
                  className="flex space-x-4 overflow-x-auto scrollbar-hide whitespace-nowrap mb-4 py-2"
                >
                  {/* Story Upload Section */}
                  <div className="flex-shrink-0 w-24 h-24 bg-gray-300 rounded-full cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleStoryChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-center h-full text-gray-700">
                      <span className="text-xl font-bold">+</span>
                    </div>
                  </div>

                  {/* Other Story Items */}
                  {groupedStories &&
                    groupedStories.map((story) => {
                      return (
                        <div
                          key={story.user._id}
                          className={`flex-shrink-0 w-24 h-24 ${
                            theme === "dark" ? "bg-gray-900" : "bg-gray-300"
                          }  rounded-full cursor-pointer`}
                          onClick={() => handleStoryClick(story)} // On click, display the stories
                        >
                          <img
                            src={story.user.picture}
                            alt="Failed to load profile img"
                            className="w-full h-full rounded-full object-cover border-2 border-transparent 
                  bg-gradient-to-r from-pink-600 via-yellow-500 to-pink-600 p-[2px] shadow-lg"
                          />
                        </div>
                      );
                    })}
                </div>
              </div>

              {selectedStory && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div
                    className={`relative max-w-3xl w-[90%] md:w-full ${
                      theme === "dark"
                        ? "bg-gray-900 border border-gray-500"
                        : "bg-white"
                    }  p-4 rounded-lg shadow-2xl overflow-hidden`}
                  >
                    <button
                      onClick={() => {
                        setSelectedStory(null);
                        setCurrentStoryIndex(0);
                      }}
                      className={`absolute top-4 right-4 ${
                        theme === "dark"
                          ? "bg-gray-200 text-black hover:bg-gray-400"
                          : "text-white bg-black bg-opacity-50 hover:bg-opacity-75"
                      } text-2xl   px-5 py-1 rounded-lg  transition`}
                    >
                      &times;
                    </button>

                    <div className="flex items-center justify-between mb-4 hover:cursor-pointer relative mt-12">
                      <div className="flex items-center">
                        <img
                          src={selectedStory.user.picture}
                          alt="Failed to load img"
                          className={`rounded-full ${
                            theme === "dark" ? "border-2 border-gray-500" : ""
                          }  h-14 w-14 mr-3`}
                          onClick={() => handSearchUser(selectedStory.user._id)}
                        />
                        <div>
                          <h2
                            className={`text-lg hover:cursor-pointer font-semibold ${
                              theme === "dark" ? "text-white" : "text-black"
                            } `}
                            onClick={() =>
                              handSearchUser(selectedStory.user._id)
                            }
                          >
                            {selectedStory.user.fullName}
                          </h2>
                          <p
                            className={`text-base hover:cursor-pointer ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-600"
                            }`}
                            onClick={() =>
                              handSearchUser(selectedStory.user._id)
                            }
                          >
                            @{selectedStory.user.userName}
                          </p>
                        </div>
                      </div>

                      {/* Delete Button with Font Awesome Icon */}
                      {selectedStory.user._id === parsedId && (
                        <button
                          onClick={() =>
                            handleDeleteStory(
                              selectedStory.stories[currentStoryIndex]._id
                            )
                          }
                          className="relative flex items-center justify-center text-white text-2xl ml-4 p-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                          title="Delete Story"
                          style={{
                            background:
                              "linear-gradient(135deg, #ff416c, #ff4b2b)",
                            boxShadow: "0 4px 15px rgba(255, 75, 43, 0.5)",
                          }}
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      )}
                    </div>

                    {/* Story Content with Date and Navigation */}
                    <div className="flex flex-col items-center justify-center relative">
                      <div className="relative w-full max-w-3xl h-[70vh] bg-black rounded-lg overflow-hidden shadow-lg">
                        {/* Story Media */}
                        {selectedStory.stories[
                          currentStoryIndex
                        ].imageUrl.endsWith(".mp4") ? (
                          <video
                            src={
                              selectedStory.stories[currentStoryIndex].imageUrl
                            }
                            controls
                            autoPlay
                            className="w-full h-full object-contain rounded-lg"
                          />
                        ) : (
                          <img
                            src={
                              selectedStory.stories[currentStoryIndex].imageUrl
                            }
                            alt="Failed to load story"
                            className="w-full h-full object-contain rounded-lg"
                          />
                        )}

                        {/* Story Caption */}
                        {selectedStory.stories[currentStoryIndex].text && (
                          <p className="absolute bottom-14 left-4 text-white text-base font-semibold shadow-md max-w-[90%] bg-black bg-opacity-50 p-2 rounded-lg">
                            Caption:{" "}
                            {selectedStory.stories[currentStoryIndex].text}
                          </p>
                        )}

                        {/* Story Date */}
                        <p className="absolute top-4 left-4 text-sm text-white bg-black bg-opacity-50 px-2 py-1 rounded-lg">
                          {new Date(
                            selectedStory.stories[currentStoryIndex].createdAt
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>

                        {/* Left Arrow (Previous Story) */}
                        {currentStoryIndex > 0 && (
                          <button
                            onClick={() =>
                              setCurrentStoryIndex(currentStoryIndex - 1)
                            }
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white text-3xl p-2 rounded-full hover:bg-opacity-75"
                          >
                            &#9664;
                          </button>
                        )}

                        {/* Right Arrow (Next Story) */}
                        {currentStoryIndex <
                          selectedStory.stories.length - 1 && (
                          <button
                            onClick={() =>
                              setCurrentStoryIndex(currentStoryIndex + 1)
                            }
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white text-3xl p-2 rounded-full hover:bg-opacity-75"
                          >
                            &#9654;
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div
                className={`p-6 ${
                  theme === "dark"
                    ? "bg-gray-800 border border-white"
                    : "bg-white"
                } rounded-lg shadow-lg mt-2 mb-5`}
              >
                {/* Story Media Preview Section */}
                {storyMediaPreview && (
                  <div className="mt-4">
                    {storyMediaFile.type.startsWith("video/") ? (
                      <video
                        src={storyMediaPreview}
                        controls
                        className="w-full h-auto rounded-lg"
                      />
                    ) : (
                      <img
                        src={storyMediaPreview}
                        alt="Media Preview"
                        className="w-full h-auto rounded-lg"
                      />
                    )}
                  </div>
                )}

                {/* Story Text Caption */}
                {storyMediaPreview && (
                  <textarea
                    className={`mt-4 w-full p-3 border ${
                      theme === "dark"
                        ? "bg-gray-800 text-white border border-gray-400"
                        : " border-gray-300 text-black"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none `}
                    placeholder="Write a caption..."
                    value={storyCaption}
                    onChange={handleStoryCaptionChange}
                  />
                )}

                {/*Story Action Buttons */}
                <div className="flex justify-end mt-4 space-x-3">
                  {storyMediaFile && (
                    <>
                      <button
                        className={`py-2 px-6 bg-gray-200 text-black hover:bg-gray-300 rounded-lg`}
                        onClick={() => {
                          setStoryMediaFile(null);
                          setStoryMediaPreview("");
                          setStoryCaption("");
                        }}
                        disabled={!storyMediaFile}
                      >
                        Cancel
                      </button>
                      <button
                        className={`py-2 px-6 rounded-lg text-white ${
                          storyMediaFile
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                        onClick={handleCreateStory}
                        disabled={!storyMediaFile}
                      >
                        Upload Story
                      </button>
                    </>
                  )}
                </div>

                {!storyMediaFile && (
                  <label
                    htmlFor="mediaUpload"
                    className={`cursor-pointer ${
                      theme === "dark" ? "bg-gray-800" : ""
                    } border-gray-300 flex flex-col items-center justify-center border-2 border-dashed  p-6 rounded-lg hover:border-blue-500 transition`}
                  >
                    {mediaPreview ? (
                      <p className="text-blue-500 font-semibold">
                        Change Media
                      </p>
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
                          className={`${
                            theme === "dark"
                              ? "text-gray-200"
                              : "text-gray-600 "
                          }mt-2 text-center`}
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
                )}

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

                {mediaPreview && (
                  <textarea
                    className={`mt-4 w-full p-3 border ${
                      theme === "dark"
                        ? "text-white bg-gray-800 border border-gray-300"
                        : "border-gray-300 text-black"
                    }  rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none `}
                    placeholder="Write a caption..."
                    value={caption}
                    onChange={handleCaptionChange}
                  />
                )}

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
                      } hover:bg-opacity-70 transition`}
                    >
                      ✕
                    </button>
                  </form>

                  <div className="flex justify-center mb-5">
                    <h1
                      className={`cus-font ${
                        theme === "dark" ? "text-white" : "text-black"
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
                              ? "bg-gray-800 border border-gray-200 hover:bg-gray-900"
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
                                theme === "dark"
                                  ? "text-gray-200"
                                  : "text-black"
                              }`}
                            >
                              {cData.userName}
                            </p>
                            <p
                              className={`break-all whitespace-normal ${
                                theme === "dark"
                                  ? "text-gray-200"
                                  : "text-gray-700"
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

                  <div className="absolute bottom-5 left-0 w-full px-4">
                    <input
                      className={`w-full rounded-full ${
                        theme === "dark"
                          ? "bg-gray-800 text-white border border-white"
                          : "bg-gray-100 text-black"
                      } focus:ring-1  focus:ring-blue-500 py-2 px-4  shadow-md focus:outline-none transition`}
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

              <div className="max-w-8xl mx-auto py-10">
                {fUserPostDetails.map((post) => (
                  <div
                    className={`${
                      theme === "dark" ? "bg-gray-800" : "bg-white"
                    } rounded-lg shadow-lg p-6 mb-6 border border-gray-200 hover:shadow-xl transition-all duration-300`}
                    key={post._id}
                  >
                    <div
                      className={`flex items-center mb-4 hover:cursor-pointer ${
                        theme === "dark"
                          ? " bg-gray-800 border border-gray-700"
                          : " bg-gray-50"
                      } p-2 rounded-2xl`}
                      onClick={() => handSearchUser(post.userId._id)}
                    >
                      <div className="w-14 h-14">
                        <img
                          src={post.userId.picture || Avatar}
                          className={`h-14 ${
                            theme === "dark" ? "border-2  border-gray-500" : ""
                          } mb-4 w-14 rounded-full shadow-md`}
                          alt="Failed to load img"
                        />
                      </div>

                      <div className="ml-4">
                        <h2
                          className={`text-lg font-semibold ${
                            theme === "dark" ? "text-gray-200" : "text-gray-800"
                          }`}
                        >
                          {post.userId.userName}
                        </h2>
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {timeAgo(post.createdAt)}
                        </p>
                      </div>
                    </div>

                    {post.media && (
                      <div className="mb-4">
                        {post.media.endsWith(".mp4") ? (
                          <video
                            src={post.media}
                            controls
                            className="w-full max-h-[85vh] object-cover rounded-lg"
                          />
                        ) : (
                          <img
                            src={post.media}
                            alt="Post Media"
                            className="w-full h-auto object-cover rounded-lg"
                          />
                        )}
                      </div>
                    )}

                    <p
                      className={`${
                        theme === "dark"
                          ? "bg-gray-800 text-gray-200"
                          : "text-gray-800 bg-white"
                      } text-base font-semibold leading-relaxed mb-3 p-1  rounded-lg transition-all duration-300`}
                    >
                      {post.description}
                    </p>

                    <div
                      className={`flex items-center pl-1 space-x-6 ${
                        theme === "dark" ? "text-gray-200" : "text-gray-600"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <FontAwesomeIcon
                          icon={
                            post.likeStatus === "Liked" ? LikeHeart : faHeart
                          }
                          className={`text-2xl hover:text-red-600 cursor-pointer ${
                            post.likeStatus === "Liked"
                              ? "text-red-600"
                              : `${
                                  theme === "dark"
                                    ? "text-white"
                                    : "text-gray-600"
                                }`
                          } hover:scale-110 transition-transform`}
                          onClick={() => handleLikePost(post._id)}
                        />

                        <span
                          className={`text-lg ${
                            theme === "dark" ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          {post.likes?.length}
                        </span>

                        <FontAwesomeIcon
                          icon={faComment}
                          className={`text-2xl cursor-pointer ${
                            theme === "dark" ? "text-white" : " text-gray-600"
                          } hover:text-blue-500`}
                          onClick={() => {
                            handleSpecificPostComments(post._id);
                            handleStoreSpecificPostId(post._id);
                            document
                              .getElementById("addComment_Modal")
                              .showModal();
                          }}
                        />
                        <span
                          className={`text-lg ${
                            theme === "dark" ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          {post.comments?.length}
                        </span>
                      </div>

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
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-700"
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
                {fUserPostDetails.length === 0 ? (
                  <p
                    className={`${
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    } font-semibold text-center`}
                  >
                    Follow users to see posts on your home page.
                  </p>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Home;
