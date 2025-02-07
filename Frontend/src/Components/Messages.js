import React, { useContext, useEffect, useState } from "react";
import vividlyContext from "../Context/vividlyContext";
import { useNavigate } from "react-router-dom";
import SkeletonLoader from "./SkeletonLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCommentDots } from "@fortawesome/free-solid-svg-icons";
import socket from "./Socket";

const Messages = ({ setNotificationCount }) => {
  const id = localStorage.getItem("id");
  const parsedId = JSON.parse(id);
  const context = useContext(vividlyContext);
  const theme = JSON.parse(localStorage.getItem("theme"));
  const { searchUserFunc, searchUsers, handleFetchAllUserConvUserData } =
    context;
  const [show, setShow] = useState(true);
  const navigate = useNavigate();
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [countLoading, setCountLoading] = useState(0);

  const [conversations, setConversations] = useState([]);

  const handleGetAllUConversation = async () => {
    if (countLoading === 0) {
      setShowSkeleton(true);
    }
    const response = await handleFetchAllUserConvUserData();
    if (response.success) {
      setConversations(response.conversationData);
    }
    setCountLoading(1);
    setShowSkeleton(false);
  };

  useEffect(() => {
    handleGetAllUConversation();
  }, []);

  useEffect(() => {
    socket.emit("register_user", parsedId);
    socket.on("receive_message", async (data) => {
      if (data.receiverId === parsedId) {
        const response = await handleFetchAllUserConvUserData();
        if (response.success) {
          setConversations(response.conversationData);
        }
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("register_user");
    };
  }, []);

  const [keyword, setKeyword] = useState("");
  const handleKeywordOnChange = (e) => {
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
    navigate("/conversation");
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

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      } sm:pl-72 sm:pt-24 mx-auto p-4 sm:p-6`}
    >
      {showSkeleton && <SkeletonLoader />}
      {!showSkeleton && (
        <>
          <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md mb-4">
            <h1 className="text-3xl font-bold">Messages</h1>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Find and connect with users..."
                value={keyword}
                onChange={handleKeywordOnChange}
                className="w-full px-4 py-2 rounded-lg shadow-md bg-white text-gray-800"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="space-y-4">
            {show &&
              conversations.map((conversation) => (
                <div
                  key={conversation.conversationId}
                  className={`flex items-center p-4 rounded-lg shadow-md ${
                    theme === "dark"
                      ? `${
                          conversation.latestMessage.readMessage === false
                            ? "bg-blue-300 hover:bg-blue-400"
                            : "bg-gray-300 hover:bg-blue-200"
                        } border-2 border-gray-500`
                      : `${
                          conversation.latestMessage.readMessage === false
                            ? "bg-blue-400  hover:bg-blue-500"
                            : "bg-gray-100  hover:bg-blue-200"
                        }`
                  }
                   transition duration-200 hover:cursor-pointer`}
                  onClick={() =>
                    handleFetchSearchedUData(conversation.users[0]?.id)
                  }
                >
                  <img
                    src={conversation.users[0]?.profilePicture}
                    alt="Failed to load img"
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-700"
                  />

                  <div className="ml-4 flex-1">
                    <p className="font-semibold text-gray-800">
                      {conversation.users[0]?.name || "Unknown User"}
                    </p>

                    <p className="text-md text-gray-700 flex items-center space-x-2">
                      {conversation.latestMessage?.text ? (
                        <span className="truncate">
                          {conversation.latestMessage.text.length > 40
                            ? `${conversation.latestMessage.text.slice(
                                0,
                                40
                              )}....`
                            : conversation.latestMessage.text}
                        </span>
                      ) : conversation.latestMessage?.media ? (
                        <>
                          <FontAwesomeIcon
                            icon={faCamera}
                            className="text-blue-500 text-lg"
                          />
                          <span>Media</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon
                            icon={faCommentDots}
                            className="text-gray-400 text-lg"
                          />
                          <span>No message yet</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Updated At */}
                  <span className="text-xs text-gray-500">
                    {formatDate(conversation.updatedAt)}
                  </span>
                </div>
              ))}

            {show && conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10">
                <p className="text-gray-500 font-semibold text-lg">
                  You don’t have any conversations yet.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Start a conversation by sending a message!
                </p>
              </div>
            )}
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
        </>
      )}
    </div>
  );
};

export default Messages;
