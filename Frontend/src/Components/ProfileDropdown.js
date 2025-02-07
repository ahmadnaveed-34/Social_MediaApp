import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation } from "react-router-dom";

import { faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

const ProfileDropdown = () => {
  const theme = JSON.parse(localStorage.getItem("theme"));
  const [open, setOpen] = useState(false);
  const dropDownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("id");
    localStorage.removeItem("userName");
    localStorage.removeItem("token");
    localStorage.removeItem("sUserId");
    localStorage.removeItem("postPreview");
    localStorage.removeItem("groupId");
    localStorage.removeItem("theme");
  };

  return (
    <div className="relative">
      <div onClick={() => setOpen(!open)}>
        <FontAwesomeIcon
          icon={faUser}
          className={` ${
            theme === "dark" ? "text-gray-50" : "text-gray-700"
          } esmd:w-5 esmd:h-5 sm:w-8 sm:h-8 cursor-pointer sm:mr-4`}
        />
      </div>

      {open && (
        <div
          className={`absolute right-0 mt-3 w-48 ${
            theme === "dark"
              ? "bg-gray-800 text-gray-200"
              : "bg-white text-black"
          }  rounded-md shadow-lg z-50`}
          ref={dropDownRef}
        >
          <ul>
            <Link to="/" onClick={handleLogout}>
              <DropdownItem icon={faSignOutAlt} text="Logout" path="/logout" />
            </Link>
          </ul>
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({ icon, text, path }) => {
  const theme = JSON.parse(localStorage.getItem("theme"));
  const location = useLocation();
  const isActive = location.pathname === path;
  return (
    <li
      className={`flex items-center space-x-2 p-2 ${
        isActive ? "bg-blue-500 text-white" : ""
      } ${
        theme === "dark"
          ? "hover:bg-blue-700 hover:text-white hover:rounded-md"
          : "hover:bg-blue-500 hover:text-white hover:rounded-md"
      }  cursor-pointer`}
    >
      <FontAwesomeIcon
        icon={icon}
        className="esmd:w-3 esmd:h-3 lmd: w-4 lmd: h-4 elmd:w-5 elmd:h-5"
      />
      <span className="text-[10px] lmd:text-xs sm:text-[16px]">{text}</span>
    </li>
  );
};

export default ProfileDropdown;
