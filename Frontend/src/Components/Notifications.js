import React, { useContext, useEffect, useState } from "react";
import vividlyContext from "../Context/vividlyContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faEnvelope,
  faHeart,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import socket from "./Socket";
import SkeletonLoader from "./SkeletonLoader";
import { useNavigate } from "react-router-dom";

const Notifications = ({ setNotificationCount }) => {
  const navigate = useNavigate();
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [countLoading, setCountLoading] = useState(0);

  const theme = JSON.parse(localStorage.getItem("theme"));
  const context = useContext(vividlyContext);
  const id = localStorage.getItem("id");
  const parsedId = JSON.parse(id);
  const {
    handleNotifications,
    unReadNotifications,
    setUnreadNotifications,
    updateNotificationStatus,
    handleReadedNotifications,
    markAllMessage,
    readedNotifications,
  } = context;

  const fetchAllNotificaions = async () => {
    if (countLoading === 0) {
      setShowSkeleton(true);
    }
    await handleNotifications();
    await handleReadedNotifications();
    setCountLoading(1);
    setShowSkeleton(false);
  };
  useEffect(() => {
    fetchAllNotificaions();
  }, []);

  useEffect(() => {
    socket.emit("register_user", parsedId);
    socket.on("receive_notification", (data) => {
      if (data.notificationData.user === parsedId) {
        setNotificationCount(Math.random() * 100000);
        handleNotifications();
      }
    });

    socket.on("receive_message", (data) => {
      if (data.receiverId === parsedId) {
        setNotificationCount(Math.random() * 100000);
        handleNotifications();
      }
    });

    return () => {
      socket.off("register_user");
      socket.off("receive_notification");
      socket.off("receive_message");
    };
  }, []);

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

  const handleUpdateNotificationsFunc = async (id, postId, type, senderId) => {
    if (type === "like" || type === "comment") {
      localStorage.setItem("postPreview", JSON.stringify(postId));
      navigate("/postPreview");
    } else if (type === "message") {
      localStorage.setItem("sUserId", JSON.stringify(senderId));
      navigate("/conversation");
    } else if (type === "follow") {
      localStorage.setItem("sUserId", JSON.stringify(senderId));
      navigate("/searchUser");
    }

    await updateNotificationStatus(id);
    setNotificationCount(Math.random() * 100000);
    setUnreadNotifications(
      unReadNotifications.filter((notification) => notification._id !== id)
    );
  };
  const handleReadedNotificationClick = async (postId, type, senderId) => {
    if (type === "like" || type === "comment") {
      localStorage.setItem("postPreview", JSON.stringify(postId));
      navigate("/postPreview");
    } else if (type === "message") {
      localStorage.setItem("sUserId", JSON.stringify(senderId));
      navigate("/conversation");
    } else if (type === "follow") {
      localStorage.setItem("sUserId", JSON.stringify(senderId));
      navigate("/searchUser");
    }
  };

  const handleMarkAllMsgAsRead = async () => {
    await markAllMessage();
    fetchAllNotificaions();
    setNotificationCount(Math.random() * 100000);
    setUnreadNotifications([]);
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      } sm:pl-72 sm:pt-24 mx-auto px-6 py-4`}
    >
      {showSkeleton && <SkeletonLoader />}
      {!showSkeleton && (
        <>
          <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md mb-2">
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="mt-2 text-lg">
              Stay updated with your activity on the platform.
            </p>
          </div>

          <div className="space-y-3">
            {unReadNotifications && unReadNotifications.length > 0 && (
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleMarkAllMsgAsRead}
                  className="bg-blue-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
                >
                  Mark All as Read
                </button>
              </div>
            )}

            {unReadNotifications &&
              unReadNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`flex items-center p-4 rounded-lg shadow-md ${
                    theme === "dark"
                      ? "bg-blue-300 hover:bg-blue-400"
                      : "bg-blue-100 hover:bg-blue-200"
                  }  transition duration-200 cursor-pointer`}
                  onClick={() =>
                    handleUpdateNotificationsFunc(
                      notification._id,
                      notification.postId,
                      notification.type,
                      notification.sender
                    )
                  }
                >
                  <div className="flex-shrink-0">
                    {notification.type === "like" && (
                      <FontAwesomeIcon
                        icon={faHeart}
                        className="text-red-500 text-xl"
                      />
                    )}
                    {notification.type === "comment" && (
                      <FontAwesomeIcon
                        icon={faComment}
                        className="text-blue-500 text-xl"
                      />
                    )}
                    {notification.type === "message" && (
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="text-black text-xl"
                      />
                    )}
                    {notification.type === "follow" && (
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-black text-xl"
                      />
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="font-semibold text-gray-800">
                      {notification.content.length > 40
                        ? `${notification.content.substring(0, 40)}...`
                        : notification.content}
                    </p>
                    <span className="text-sm text-gray-500">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))}

            {readedNotifications &&
              readedNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`flex items-center p-4 rounded-lg shadow-md hover:cursor-pointer ${
                    theme === "dark"
                      ? "bg-gray-300 hover:bg-gray-400"
                      : "bg-gray-100 hover:bg-gray-200"
                  }  transition duration-200`}
                  onClick={() =>
                    handleReadedNotificationClick(
                      notification.postId,
                      notification.type,
                      notification.sender
                    )
                  }
                >
                  <div className="flex-shrink-0">
                    {notification.type === "like" && (
                      <FontAwesomeIcon
                        icon={faHeart}
                        className="text-red-500 text-xl"
                      />
                    )}
                    {notification.type === "comment" && (
                      <FontAwesomeIcon
                        icon={faComment}
                        className="text-blue-500 text-xl"
                      />
                    )}
                    {notification.type === "message" && (
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="text-black text-xl"
                      />
                    )}
                    {notification.type === "follow" && (
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-black text-xl"
                      />
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="font-semibold text-gray-800">
                      {notification.content.length > 40
                        ? `${notification.content.substring(0, 40)}...`
                        : notification.content}
                    </p>
                    <span className="text-sm text-gray-500">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
          </div>

          {unReadNotifications &&
            unReadNotifications.length === 0 &&
            readedNotifications &&
            readedNotifications.length === 0 && (
              <div className="flex flex-col items-center justify-center bg-gray-100 p-6 rounded-lg shadow-md mt-6">
                <p className="text-xl font-medium text-gray-600">
                  You have no new notifications.
                </p>
                <p className="mt-2 text-md text-gray-500">
                  Stay tuned for updates!
                </p>
              </div>
            )}
        </>
      )}
    </div>
  );
};

export default Notifications;
