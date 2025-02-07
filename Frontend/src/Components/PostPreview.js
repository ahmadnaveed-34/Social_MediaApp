import React, { useContext, useEffect, useState } from "react";
import vividlyContext from "../Context/vividlyContext";
import SkeletonLoader from "./SkeletonLoader";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faComment } from "@fortawesome/free-regular-svg-icons";
import { faHeart as LikeHeart } from "@fortawesome/free-solid-svg-icons";
import socket from "./Socket";

import Avatar from "../Images/Avatar.jpeg";
const PostPreview = () => {
  const navigate = useNavigate();
  const ENDPOINT = process.env.REACT_APP_ENDPOINT;
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [countLoading, setCountLoading] = useState(0);
  const theme = JSON.parse(localStorage.getItem("theme"));
  const context = useContext(vividlyContext);
  const [postData, setPostData] = useState("");
  const { fetchPostPreview } = context;
  const id = localStorage.getItem("id");
  const parsedId = JSON.parse(id);
  const [likeStatus, setLikeStatus] = useState("");
  const parsedPId = JSON.parse(localStorage.getItem("postPreview"));

  useEffect(() => {
    return () => {
      socket.off("send_notification");
    };
  }, []);

  const handlePostData = async () => {
    if (countLoading === 0) {
      setShowSkeleton(true);
    }
    const parsedPId = JSON.parse(localStorage.getItem("postPreview"));
    const response = await fetchPostPreview(parsedPId);
    if (response.fetchLikes.likes.some((like) => like.user === parsedId)) {
      setLikeStatus("Liked");
    } else {
      setLikeStatus("Not Liked");
    }
    setPostData(response);
    setCountLoading(1);
    setShowSkeleton(false);
  };
  const handSearchUser = (uId) => {
    localStorage.setItem("sUserId", JSON.stringify(uId));
    navigate("/searchUser");
  };

  useEffect(() => {
    handlePostData();
  }, []);

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
    if (likeStatus === "Liked") {
      setLikeStatus("Not Liked");
      setPostData((prevPostData) => ({
        ...prevPostData,
        fetchLikes: {
          ...prevPostData.fetchLikes,
          likes: prevPostData.fetchLikes.likes.filter(
            (like) => like.user !== parsedId
          ),
        },
      }));
    } else {
      setLikeStatus("Liked");
      socket.emit("send_notification", response);

      const newLike = { user: parsedId, _id: Math.random() * 16 };
      setPostData((prevPostData) => ({
        ...prevPostData,
        fetchLikes: {
          ...prevPostData.fetchLikes,
          likes: [...prevPostData.fetchLikes.likes, newLike],
        },
      }));
    }
  };

  const [cText, setCText] = useState("");
  const handleCommentOnChange = (e) => {
    setCText(e.target.value);
  };

  const handleAddComment = async (postId, text) => {
    if (text.trim().length < 1) {
      return;
    }
    setCText("");
    const token = localStorage.getItem("token");
    const parsedToken = JSON.parse(token);
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
      setPostData((prevPostData) => ({
        ...prevPostData,
        fetchComments: data.updatedComment,
      }));
    } catch (error) {
      console.log("Error:", error.message);
    }
  };

  return (
    <div
      className={`max-w-7xl mx-auto min-h-screen sm:pl-72 sm:pt-24 p-4 ${
        theme === "dark" ? "bg-gray-900" : "bg-white rounded-lg"
      }  shadow-lg  overflow-hidden`}
    >
      {showSkeleton && <SkeletonLoader />}
      {!showSkeleton && (
        <>
          <div
            className={`flex items-center px-6 py-4 ${
              theme === "dark"
                ? "bg-gray-800 border border-gray-400"
                : "bg-gray-100"
            } rounded-lg mb-3`}
          >
            <img
              src={(postData && postData.authordata.picture) || Avatar}
              alt="Creator Avatar"
              onClick={() => handSearchUser(postData.authordata._id)}
              className={`w-12 h-12 rounded-full ${
                theme === "dark" ? "border-2 border-gray-300" : ""
              } object-cover hover:cursor-pointer`}
            />
            <div className="ml-4">
              <h3
                className={`text-lg font-semibold hover:cursor-pointer ${
                  theme === "dark" ? "text-gray-200 font-bold" : "text-gray-800"
                } `}
                onClick={() => handSearchUser(postData.authordata._id)}
              >
                {postData && postData.authordata.fullName}
              </h3>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-500"
                } `}
              >
                @{postData && postData.authordata.userName}
              </p>
            </div>
          </div>

          <div className="relative">
            {postData && postData.findPost.mediaType === "video" ? (
              <video
                src={postData && postData.findPost.media}
                alt="Post Media"
                className={`w-full max-h-[85vh] object-contain rounded-lg border ${
                  theme === "black" ? "border-gray-200" : "border-gray-600"
                }`}
                controls
              />
            ) : (
              <img
                src={(postData && postData.findPost.media) || Avatar}
                alt="Post Media"
                className={`w-full max-h-[85vh] object-contain rounded-lg border ${
                  theme === "black" ? "border-gray-200" : "border-gray-600"
                }`}
              />
            )}
          </div>

          <div className="p-6">
            <p
              className={`${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Description: {postData && postData.findPost.description}
            </p>
          </div>

          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon
                  icon={likeStatus === "Liked" ? LikeHeart : faHeart}
                  className={`cursor-pointer text-2xl hover:text-red-600  ${
                    likeStatus === "Liked"
                      ? "text-red-600"
                      : ` ${
                          theme === "dark" ? "text-gray-50" : "text-gray-600"
                        }`
                  }`}
                  onClick={() => handleLikePost(postData.findPost._id)}
                />
                <p
                  className={`${
                    theme === "dark" ? "text-gray-200" : "text-gray-600"
                  }`}
                >
                  {postData && postData.fetchLikes.likes.length}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <FontAwesomeIcon
                  icon={faComment}
                  className={`cursor-pointer text-2xl ${
                    theme === "dark"
                      ? "text-white hover:text-gray-400"
                      : "text-black hover:text-gray-600"
                  }`}
                />
                <p
                  className={`${
                    theme === "dark" ? "text-gray-200" : "text-gray-600"
                  }`}
                >
                  {postData && postData.fetchComments.comments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200">
            <h4
              className={`text-lg font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-800"
              } mb-4`}
            >
              Comments
            </h4>

            <div className="flex items-center space-x-4 mb-4">
              <input
                type="text"
                placeholder="Add a comment..."
                value={cText}
                onChange={handleCommentOnChange}
                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none  ${
                  theme === "dark"
                    ? "bg-gray-800 text-white border-gray-300 focus:ring-1 focus:ring-blue-400"
                    : "focus:ring bg-gray-100 text-gray-800 border-gray-300 focus:ring-gray-200"
                }`}
              />
              <button
                className={`px-4 py-2 rounded-lg ${
                  theme === "dark"
                    ? "bg-green-600 text-white hover:bg-green-500"
                    : "bg-green-500 text-white hover:bg-green-400"
                }`}
                onClick={() => handleAddComment(parsedPId, cText)}
              >
                Add
              </button>
            </div>

            <div className="space-y-4 max-h-56 overflow-y-auto">
              {postData &&
                postData.fetchComments.comments.map((c) => {
                  return (
                    <div className="flex items-start space-x-4" key={c._id}>
                      <img
                        src={c.userPic || Avatar}
                        alt="Commenter Avatar"
                        className={`w-10 h-10 hover:cursor-pointer ${
                          theme === "dark" ? "border border-white" : ""
                        } rounded-full object-cover`}
                        onClick={() => handSearchUser(c.user)}
                      />
                      <div>
                        <p
                          className={`hover:cursor-pointer ${
                            theme === "dark" ? "text-gray-200" : "text-gray-800"
                          } font-semibold`}
                          onClick={() => handSearchUser(c.user)}
                        >
                          {c.name}
                        </p>
                        <p
                          className={`break-all whitespace-normal ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          } text-sm`}
                        >
                          {c.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              {postData && postData.fetchComments.comments.length === 0 ? (
                <div
                  className={`${
                    theme === "dark" ? "text-gray-300" : "text-gray-800"
                  }`}
                >
                  No comments yet
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PostPreview;
