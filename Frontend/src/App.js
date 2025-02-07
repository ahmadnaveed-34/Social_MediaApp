import React, { useContext, useEffect, useState } from "react";
import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import AuthPage from "./Components/AuthPage";
import Navbar from "./Components/Navbar";

import Sidebar from "./Components/Sidebar";
import Home from "./Components/Home";
import Groups from "./Components/Groups";
import Events from "./Components/Events";
import Marketplace from "./Components/Marketplace";
import Friends from "./Components/Friends";
import Explore from "./Components/Explore";
import Messages from "./Components/Messages";
import Notifications from "./Components/Notifications";
import Settings from "./Components/Settings";
import HelpCenter from "./Components/HelpCenter";
import Dashboard from "./Components/Dashboard";
import Subscriptions from "./Components/Subscriptions";
import Likes from "./Components/Likes";
import Profile from "./Components/Profile";
import Reels from "./Components/Reels";
import ViewBlockedUsers from "./Components/ViewBlockedUsers";
import SearchedUserProfile from "./Components/SearchedUserProfile";
import ConversationPage from "./Components/ConversationPage";
import GroupChatConversationPage from "./Components/GroupChatConversationPage";
import UserFollowingPage from "./Components/UserFollowingPage";
import UserFollowersPage from "./Components/UserFollowersPage";
import PostPreview from "./Components/PostPreview";

function AuthChecker() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      if (
        !localStorage.getItem("token") ||
        !localStorage.getItem("id") ||
        !localStorage.getItem("userName") ||
        !localStorage.getItem("theme") ||
        !localStorage.getItem("sUserId") ||
        !localStorage.getItem("groupId") ||
        !localStorage.getItem("postPreview")
      ) {
        navigate("/");
      }
    };
    const interval = setInterval(checkAuth, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return null;
}

function App() {
  const [updateTheme, setUpdateTheme] = useState("");
  const [notificationCount, setNotificationCount] = useState(1);

  return (
    <BrowserRouter>
      {window.location.pathname !== "/" && <AuthChecker />}

      <Routes>
        <Route exact path="/" element={<AuthPage />} />

        {/* Navbar Routes */}
        <Route
          exact
          path="/home"
          element={
            <>
              <Navbar />
              <Sidebar />
              <Home />
            </>
          }
        ></Route>
        <Route
          exact
          path="/explore"
          element={
            <>
              <Navbar />
              <Sidebar />
              <Explore />
            </>
          }
        ></Route>
        <Route
          exact
          path="/reels"
          element={
            <>
              <Navbar />
              <Sidebar />
              <Reels />
            </>
          }
        ></Route>
        <Route
          exact
          path="/messages"
          element={
            <>
              <Navbar />
              <Sidebar />
              <Messages />
            </>
          }
        ></Route>
        <Route
          exact
          path="/notifications"
          element={
            <>
              <Navbar notificationCount={notificationCount} />
              <Sidebar />
              <Notifications setNotificationCount={setNotificationCount} />
            </>
          }
        ></Route>
        <Route
          exact
          path="/settings"
          element={
            <>
              <Navbar />
              <Sidebar updateTheme={updateTheme} />
              <Settings setUpdateTheme={setUpdateTheme} />
            </>
          }
        ></Route>
        <Route
          exact
          path="/helpCenter"
          element={
            <>
              <Navbar />
              <Sidebar />
              <HelpCenter />
            </>
          }
        ></Route>
        <Route
          exact
          path="/logout"
          element={
            <>
              <Navbar />
              <Sidebar />
              <Home />
            </>
          }
        ></Route>
        <Route
          exact
          path="/viewBlock_user"
          element={
            <>
              <Navbar />
              <Sidebar />
              <ViewBlockedUsers />
            </>
          }
        ></Route>
        <Route
          exact
          path="/searchUser"
          element={
            <>
              <Navbar />
              <Sidebar />
              <SearchedUserProfile />
            </>
          }
        ></Route>
        <Route
          exact
          path="/userFollowing"
          element={
            <>
              <Navbar />
              <Sidebar />
              <UserFollowingPage />
            </>
          }
        ></Route>
        <Route
          exact
          path="/userFollowers"
          element={
            <>
              <Navbar />
              <Sidebar />
              <UserFollowersPage />
            </>
          }
        ></Route>

        {/* Conversation Routes */}
        <Route
          exact
          path="/conversation"
          element={
            <>
              <Navbar />
              <Sidebar />
              <ConversationPage />
            </>
          }
        ></Route>
        <Route
          exact
          path="/groupConversation"
          element={
            <>
              <Navbar />
              <Sidebar />
              <GroupChatConversationPage />
            </>
          }
        ></Route>

        {/* Sidebar Routes */}
        <Route
          exact
          path="/groups"
          element={
            <>
              <Navbar />
              <Sidebar />
              <Groups />
            </>
          }
        ></Route>
        <Route
          exact
          path="/events"
          element={
            <>
              <Navbar />
              <Sidebar />
              <Events />
            </>
          }
        ></Route>
        <Route
          exact
          path="/marketplace"
          element={
            <>
              <Navbar />
              <Sidebar />
              <Marketplace />
            </>
          }
        ></Route>
        <Route
          exact
          path="/friends"
          element={
            <>
              <Navbar />
              <Sidebar />
              <Friends />
            </>
          }
        ></Route>
        <Route
          exact
          path="/postPreview"
          element={
            <>
              <Navbar />
              <Sidebar />
              <PostPreview />
            </>
          }
        ></Route>
        <Route
          exact
          path="/dashboard"
          element={
            <>
              <Navbar />
              <Sidebar />
              <Dashboard />
            </>
          }
        ></Route>
        <Route
          exact
          path="/profile"
          element={
            <>
              <Navbar />
              <Sidebar />
              <Profile />
            </>
          }
        ></Route>
        <Route
          exact
          path="/subscriptions"
          element={
            <>
              <Navbar />
              <Sidebar />
              <Subscriptions />
            </>
          }
        ></Route>
        <Route
          exact
          path="/likes"
          element={
            <>
              <Navbar />
              <Sidebar />
              <Likes />
            </>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
