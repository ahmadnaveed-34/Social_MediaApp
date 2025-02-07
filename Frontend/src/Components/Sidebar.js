import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation } from "react-router-dom";
import {
  faUser,
  faUsers,
  faTachometerAlt,
  faUserCircle,
  faBars,
  faThumbsUp,
  faCog,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";

const Sidebar = ({ updateTheme }) => {
  const theme = JSON.parse(localStorage.getItem("theme"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className={`${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
        <button
          className="sm:hidden pt-20 pl-5 mt-2"
          aria-label="Open Sidebar"
          onClick={handleSidebarToggle}
        >
          <FontAwesomeIcon
            icon={faBars}
            className="text-2xl bg-black text-white p-2 rounded-lg"
          />
        </button>

        <aside
          className={`hidden sm:block sm:w-64 h-screen ${
            theme === "dark" ? "bg-gray-900" : "bg-gray-100"
          }  border-r fixed top-0 left-0 pt-20 `}
        >
          <ul className="max-h-[95vh] space-y-8 p-2 sm:p-6 overflow-y-auto">
            <Link to="/profile" className="block">
              <SidebarItem icon={faUserCircle} text="Profile" path="/profile" />
            </Link>
            <Link to="/settings" className="block">
              <SidebarItem icon={faCog} text="Settings" path="/settings" />
            </Link>

            <Link to="/dashboard" className="block">
              <SidebarItem
                icon={faTachometerAlt}
                text="Dashboard"
                path="/dashboard"
              />
            </Link>
            <Link to="/groups" className="block">
              <SidebarItem icon={faUsers} text="Groups" path="/groups" />
            </Link>
            <Link to="/friends" className="block">
              <SidebarItem icon={faUser} text="Friends" path="/friends" />
            </Link>
            <Link to="/likes" className="block">
              <SidebarItem icon={faThumbsUp} text="Liked Posts" path="/likes" />
            </Link>
            <Link to="/helpCenter" className="block">
              <SidebarItem
                icon={faQuestionCircle}
                text="Help Center"
                path="/helpCenter"
              />
            </Link>
          </ul>
        </aside>

        <div
          ref={sidebarRef}
          className={`fixed mt-12 pt-6 inset-0 w-64 sm:hidden bg-gray-800 bg-opacity-50 z-40   transition-transform duration-300 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label="Sidebar Navigation"
          role="navigation"
        >
          <div
            className={`w-64 ${
              theme === "dark" ? "bg-gray-900" : "bg-white"
            }  h-full shadow-lg fixed z-50 p-4`}
          >
            <ul className="space-y-8 max-h-[95vh] p-2 overflow-y-auto">
              <Link
                to="/profile"
                className="block"
                onClick={handleSidebarToggle}
              >
                <SidebarItem
                  icon={faUserCircle}
                  text="Profile"
                  path="/profile"
                />
              </Link>
              <Link
                to="/settings"
                className="block"
                onClick={handleSidebarToggle}
              >
                <SidebarItem icon={faCog} text="Settings" path="/settings" />
              </Link>

              <Link
                to="/dashboard"
                className="block"
                onClick={handleSidebarToggle}
              >
                <SidebarItem
                  icon={faTachometerAlt}
                  text="Dashboard"
                  path="/dashboard"
                />
              </Link>
              <Link
                to="/groups"
                className="block"
                onClick={handleSidebarToggle}
              >
                <SidebarItem icon={faUsers} text="Groups" path="/groups" />
              </Link>
              <Link
                to="/friends"
                className="block"
                onClick={handleSidebarToggle}
              >
                <SidebarItem icon={faUser} text="Friends" path="/friends" />
              </Link>

              <Link to="/likes" className="block" onClick={handleSidebarToggle}>
                <SidebarItem
                  icon={faThumbsUp}
                  text="Liked Posts"
                  path="/likes"
                />
              </Link>
              <Link
                to="/helpCenter"
                className="block"
                onClick={handleSidebarToggle}
              >
                <SidebarItem
                  icon={faQuestionCircle}
                  text="Help Center"
                  path="/helpCenter"
                />
              </Link>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

const SidebarItem = ({ icon, text, path }) => {
  const theme = JSON.parse(localStorage.getItem("theme"));
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <li
      className={`flex items-center space-x-3 ${
        isActive
          ? `${theme === "dark" ? "text-blue-600" : "text-blue-500"}`
          : `${theme === "dark" ? "text-white" : "text-gray-700"}`
      } hover:text-blue-500 cursor-pointer`}
    >
      <FontAwesomeIcon icon={icon} className="w-5 h-5" />
      <span>{text}</span>
    </li>
  );
};

export default Sidebar;
