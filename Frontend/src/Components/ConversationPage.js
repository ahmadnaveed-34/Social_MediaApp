import React, { useContext, useEffect, useRef, useState } from "react";
import vividlyContext from "../Context/vividlyContext";
import EmojiPicker from "emoji-picker-react";
import socket from "./Socket";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faCheckCircle,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import SkeletonLoader from "./SkeletonLoader";

const ConversationPage = () => {
  const context = useContext(vividlyContext);
  const {
    handleFetchConversation,
    sendMessage,
    handleFetchConvUserData,
    sendMedia,
  } = context;
  const ENDPOINT = process.env.REACT_APP_ENDPOINT;
  const theme = JSON.parse(localStorage.getItem("theme"));
  const scrollChat = useRef(null);

  const [messages, setMessages] = useState([]);
  const searchedUserId = JSON.parse(localStorage.getItem("sUserId"));
  const [convUcred, setConUcred] = useState("");
  const [error, setError] = useState("");

  const id = localStorage.getItem("id");
  const parsedId = JSON.parse(id);
  const [newMessage, setNewMessage] = useState("");
  const navigate = useNavigate();

  const [showSkeleton, setShowSkeleton] = useState(false);
  const [countLoading, setCountLoading] = useState(0);

  const handleFetchData = async () => {
    if (countLoading === 0) {
      setShowSkeleton(true);
    }
    const response = await handleFetchConversation(searchedUserId);
    if (response.message === "Conversation retrieved successfully!") {
      setMessages(response.data.messages);
    } else {
      setError("No conversation started yet!");
    }

    const userResponse = await handleFetchConvUserData(searchedUserId);
    setConUcred(userResponse.userCredentials);
    setCountLoading(1);
    setShowSkeleton(false);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } else {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (scrollChat.current) {
        scrollChat.current.scrollTo({
          top: scrollChat.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 2000);

    socket.emit("register_user", parsedId);
    handleFetchData();

    return () => {
      socket.off("register_user");
      socket.off("send_message");
      socket.off("receive_message");
    };
  }, [parsedId]);

  useEffect(() => {
    if (scrollChat.current) {
      scrollChat.current.scrollTop = scrollChat.current.scrollHeight;
    }

    socket.on("receive_message", (newMsg) => {
      if (newMsg.receiverId === parsedId) {
        setMessages((prevMessages) => [...prevMessages, newMsg]);
        handleFetchConversation(searchedUserId);
        setTimeout(() => {
          if (scrollChat.current) {
            scrollChat.current.scrollTo({
              top: scrollChat.current.scrollHeight,
              behavior: "smooth",
            });
          }
        }, 1000);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket, parsedId]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const response = await sendMessage(searchedUserId, newMessage);
      if (response.success) {
        const newMsg = response.data;
        const receiverId = response.data.receiverId;

        socket.emit("send_message", newMsg, receiverId);
        setMessages((prevMessages) => [...prevMessages, newMsg]);
        setNewMessage("");
        setTimeout(() => {
          if (scrollChat.current) {
            scrollChat.current.scrollTo({
              top: scrollChat.current.scrollHeight,
              behavior: "smooth",
            });
          }
        }, 1000);
        setError(false);
      }
    }
  };

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.endsWith(".mp4")) {
        setSelectedMediaType("video");
        setIsModalOpen(true);
      } else {
        setSelectedMediaType("image");
        setIsModalOpen(true);
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
          setSelectedMedia(response.url);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMedia(null);
  };

  const handleSendMedia = async () => {
    setLoading(true);
    const response = await sendMedia(
      searchedUserId,
      selectedMedia,
      selectedMediaType
    );
    if (response.success) {
      const newMsg = response.data;
      const receiverId = response.data.receiverId;
      socket.emit("send_message", newMsg, receiverId);
      setMessages((prevMessages) => [...prevMessages, newMsg]);
      setError(false);
      closeModal();
      setTimeout(() => {
        if (scrollChat.current) {
          scrollChat.current.scrollTo({
            top: scrollChat.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 1000);
    }
    setLoading(false);
  };
  const handleSearchUser = (uId) => {
    localStorage.setItem("sUserId", JSON.stringify(uId));
    navigate("/searchUser");
  };

  const handleSharedPostPreview = (postId) => {
    localStorage.setItem("postPreview", JSON.stringify(postId));
    navigate("/postPreview");
  };

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`max-w-7xl mx-auto h-[80vh] sm:h-screen sm:pl-72 sm:pt-24 p-4 flex flex-col ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {showSkeleton && <SkeletonLoader />}
      {!showSkeleton && (
        <>
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-4 shadow-md flex items-center justify-between rounded-md">
            <h2 className="text-xl font-semibold">Conversation</h2>
            <div className="flex items-center space-x-2">
              <img
                src={convUcred.picture}
                alt="User Profile"
                className="w-12 h-12 rounded-full object-cover hover:cursor-pointer"
                onClick={() => handleSearchUser(convUcred._id)}
              />
              <span
                className="font-semibold text-lg hover:cursor-pointer"
                onClick={() => handleSearchUser(convUcred._id)}
              >
                {convUcred.fullName}
              </span>
            </div>
          </div>

          {/* Messages Section */}
          <div
            ref={scrollChat}
            className={`max-h-[65vh] flex-1 overflow-y-auto p-4 space-y-4 ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-100"
            } `}
          >
            {messages &&
              messages.length > 0 &&
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg.isSharedPost === "yes" ? "hover:cursor-pointer" : ""
                  } ${
                    msg.senderId === parsedId ? "justify-end" : "justify-start"
                  }`}
                  onClick={() => {
                    msg.isSharedPost === "yes" &&
                      handleSharedPostPreview(msg.sharedPostId);
                  }}
                >
                  <div
                    className={`min-w-[200px] break-words max-w-xs p-2 rounded-lg shadow-md ${
                      !msg.media
                        ? msg.senderId === parsedId
                          ? `${
                              theme === "dark" ? "bg-blue-600" : "bg-blue-500"
                            } text-white`
                          : `${
                              theme === "dark"
                                ? "bg-gray-300 text-gray-800"
                                : "bg-gray-200 text-gray-800"
                            }`
                        : ""
                    }`}
                  >
                    {!msg.media && <p className="text-sm">{msg.text}</p>}
                    {msg.media &&
                      (msg.mediaType === "image" ? (
                        <img
                          src={msg.media}
                          alt="Preview"
                          className="w-full max-h-[60vh] object-cover rounded-md"
                        />
                      ) : (
                        <video
                          src={msg.media}
                          className="w-full max-h-[60vh] rounded-md"
                          controls
                          muted
                        ></video>
                      ))}
                    <span
                      className={`text-xs ${
                        !msg.media
                          ? msg.senderId === parsedId
                            ? "text-gray-300"
                            : "text-gray-700"
                          : ""
                      }`}
                    >
                      {formatDate(msg.createdAt)}
                      {msg.isSharedPost === "yes" && (
                        <p className="text-green-500 font-semibold flex items-center">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="mr-2"
                          />{" "}
                          Shared Post!
                        </p>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            {error && (
              <div
                className={`flex justify-center h-[45vh] items-center ${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                }  custom-font text-2xl`}
              >
                No conversation started yet!
              </div>
            )}
          </div>

          {/* Message Input Section */}
          <div
            className={`${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } p-4 border-t border-gray-300 flex items-center space-x-3 relative`}
          >
            {/* Camera Upload Icon (for photos/videos) */}
            <label htmlFor="camera-upload" className="cursor-pointer">
              <FontAwesomeIcon
                icon={faCamera}
                className={`${
                  theme === "dark" ? "text-white" : "text-gray-500"
                } hover:text-blue-500 h-6 w-6`}
              />
            </label>

            {/* Text Input */}
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className={`w-full p-3 rounded-lg border border-gray-300 ${
                  theme === "dark"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-50 text-black"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-2xl hover:scale-105 transition-transform duration-150"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              >
                😊
              </button>
              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef} // Attach ref to the div that wraps the emoji picker
                  className="absolute bottom-12 right-3 z-50"
                >
                  <EmojiPicker
                    onEmojiClick={(e) => {
                      setNewMessage((prev) => prev + e.emoji);
                      setShowEmojiPicker(false);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FontAwesomeIcon icon={faPaperPlane} className="h-6 w-6" />
            </button>

            <input
              type="file"
              id="camera-upload"
              accept="image/*,video/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 sm:mt-14 bg-black bg-opacity-50 flex justify-center items-center">
              <div
                className={`${
                  theme === "dark" ? "bg-gray-900" : "bg-white"
                } p-6 rounded-lg max-w-[90vw] sm:max-w-lg w-full`}
              >
                <div className="flex justify-between items-center">
                  <h3
                    className={`text-xl font-semibold ${
                      theme === "dark" ? "text-gray-200" : "text-black"
                    } `}
                  >
                    Preview
                  </h3>
                  <button
                    onClick={closeModal}
                    className={` ${
                      theme === "dark"
                        ? "text-white bg-gray-700 text-2xl font-bold"
                        : "text-gray-500 bg-gray-200"
                    } hover:text-red-500 text-2xl  px-4 py-2 rounded-lg`}
                  >
                    X
                  </button>
                </div>

                <div className="mt-4">
                  {selectedMedia && (
                    <div className="mb-4">
                      {selectedMediaType === "video" ? (
                        <video
                          src={selectedMedia}
                          className="w-full max-h-[55vh]"
                          controls
                          muted={false}
                          poster=""
                        ></video>
                      ) : (
                        <img
                          src={selectedMedia}
                          alt="Preview"
                          className="w-full max-h-[55vh] object-cover rounded-lg"
                        />
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSendMedia}
                  disabled={loading}
                  className={`w-full p-3 ${
                    loading
                      ? "bg-blue-800 text-white"
                      : " bg-blue-600 text-white"
                  } rounded-lg hover:bg-blue-700 transition`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <span className="ml-2">Sending...</span>
                    </div>
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ConversationPage;
