import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProfileDropdown from "./ProfileDropdown";
import { Link, useLocation } from "react-router-dom";
import {
  faHome,
  faSearch,
  faBell,
  faComments,
  faPlayCircle,
} from "@fortawesome/free-solid-svg-icons";
import socket from "./Socket";

const Navbar = ({ notificationCount }) => {
  const id = localStorage.getItem("id");
  const parsedId = JSON.parse(id);
  const ENDPOINT = process.env.REACT_APP_ENDPOINT;
  const [unReadNotifications, setUnreadNotifications] = useState([]);
  const theme = JSON.parse(localStorage.getItem("theme"));

  const handleNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/fetchUnreadNotifications`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      setUnreadNotifications(data.fetchNotifications);
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  useEffect(() => {
    handleNotifications();
  }, [notificationCount]);

  useEffect(() => {
    socket.emit("register_user", parsedId);
    socket.on("receiveMsgNoti", (data) => {
      if (data.receiverId === parsedId) {
        handleNotifications();
      }
    });
    socket.on("receive_notification", (data) => {
      if (data.notificationData.user === parsedId) {
        handleNotifications();
      }
    });

    socket.on("receive_message", (newMsg) => {
      if (newMsg.receiverId === parsedId) {
        handleNotifications();
      }
    });

    // return () => {
    //   socket.off("register_user");
    //   socket.off("receive_notification");
    //   socket.off("receive_message");
    //   socket.off("receiveMsgNoti");
    // };
  }, []);

  return (
    <nav
      className={`w-full ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      }  border-b shadow-md fixed top-0 z-50`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <div className="smd:text-xl sm:text-3xl custom-font font-bold text-blue-500">
          Vividly
        </div>

        <div className="flex flex-col esmd:flex-row esmd:ml-1 elmd:ml-0 esmd:space-x-2 elmd:space-x-7">
          <Link to="/home" className="block">
            <NavItem icon={faHome} text="Home" path="/home" />
          </Link>
          <Link to="/explore" className="block">
            <NavItem icon={faSearch} text="Explore" path="/explore" />
          </Link>
          <Link to="/reels" className="block">
            <NavItem icon={faPlayCircle} text="Reels" path="/reels" />
          </Link>
          <Link to="/messages" className="block relative">
            <NavItem icon={faComments} text="Messages" path="/messages" />
          </Link>
          <Link to="/notifications" className="block relative">
            <NavItem
              icon={faBell}
              text="Notifications"
              path="/notifications"
              unReadNotifications={unReadNotifications}
            />
          </Link>
        </div>
        <div>
          <ProfileDropdown />
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ icon, text, path, unReadNotifications }) => {
  const location = useLocation();
  const isActive = location.pathname === path;
  const theme = JSON.parse(localStorage.getItem("theme"));

  return (
    <div
      className={`flex flex-col items-center ${
        isActive
          ? `${theme === "dark" ? "text-blue-500" : "text-blue-700"}`
          : `${theme === "dark" ? "text-white" : "text-gray-600"}`
      } ${
        theme === "dark" ? "hover:text-blue-600" : "hover:text-blue-500"
      } cursor-pointer`}
    >
      <FontAwesomeIcon
        icon={icon}
        className="esmd:w-3 esmd:h-3 lmd: w-5 lmd: h-5 elmd:w-6 elmd:h-6"
      />
      <span className="text-[10px] lmd:text-xs">{text}</span>

      {unReadNotifications && unReadNotifications.length > 0 && (
        <span className="absolute top-[-8px] elmd:top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unReadNotifications.length}
        </span>
      )}
    </div>
  );
};

export default Navbar;
