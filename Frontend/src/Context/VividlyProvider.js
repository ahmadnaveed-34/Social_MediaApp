import React, { useState } from "react";
import VividlyContext from "./vividlyContext";

const VividlyProvider = (props) => {
  const [blockUsers, setBlockUsers] = useState([]);
  const ENDPOINT = process.env.REACT_APP_ENDPOINT;
  const [suggestions, setSuggestions] = useState([]);

  const [likedPosts, setLikedPosts] = useState([]);

  const [searchUsers, setSearchUsers] = useState([]);
  const [userFriends, setUserFriends] = useState([]);

  const sendOtp = async (email) => {
    try {
      const response = await fetch(`${ENDPOINT}/api/user/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const verifyOTP = async (fullName, userName, email, password, Enterotp) => {
    try {
      const response = await fetch(`${ENDPOINT}/api/user/verfiyOtp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, userName, email, password, Enterotp }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const addAdditionalInfo = async (picture, DOB, gender, userName) => {
    try {
      const response = await fetch(`${ENDPOINT}/api/user/addAdditionalInfo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ picture, DOB, gender, userName }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const skipAdditionalInfo = async (picture, userName) => {
    try {
      const response = await fetch(`${ENDPOINT}/api/user/skipAdditionalInfo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ picture, userName }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const chkUserNameExists = async (userName) => {
    try {
      const response = await fetch(`${ENDPOINT}/api/user/chkUNameExists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const login = async (email, password) => {
    try {
      const response = await fetch(`${ENDPOINT}/api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const deleteUserAccount = async () => {
    try {
      const id = localStorage.getItem("id");
      const parsedId = JSON.parse(id);
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(
        `${ENDPOINT}/api/user/deleteUserAccount/${parsedId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const getBlockUsers = async () => {
    try {
      const id = localStorage.getItem("id");
      const parsedId = JSON.parse(id);
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(
        `${ENDPOINT}/api/user/getBlockUsers/${parsedId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
        }
      );
      const data = await response.json();
      setBlockUsers(data.blockUsers);
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const blockUnblockUser = async (blockUserId) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/user/blockUser`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
        body: JSON.stringify({ blockUserId }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const showSuggestionFunc = async () => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/user/showSuggestion`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      setSuggestions(data.suggestion);
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const fetchTrendingReelsFunc = async () => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/post/fetchTrendingReels`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      return data.reels;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const fetchLikedPostsFunc = async () => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/post/fetchLikedPosts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      setLikedPosts(data.likedPost);
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const searchUserFunc = async (keyword) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/user?search=${keyword}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      setSearchUsers(data.userData);
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const chkIsAlreadyFollow = async (searchedUserName) => {
    try {
      const id = localStorage.getItem("id");
      const parsedId = JSON.parse(id);
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(
        `${ENDPOINT}/api/user/chkIsFollow/${parsedId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
          body: JSON.stringify({ searchedUserName: searchedUserName }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const searchedUserAllDataFunc = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(
        `${ENDPOINT}/api/user/fetchSearchedUserData/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };

  const handleCreateStoryWithMediaOnly = async (imageUrl) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/story/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const handleCreateStoryTextAndMedia = async (imageUrl, text) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/story/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
        body: JSON.stringify({ imageUrl, text }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(
        `${ENDPOINT}/api/post/deletePost/${postId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const handleEditPost = async (postId, desc, media, mediaType) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(
        `${ENDPOINT}/api/post/updatePost/${postId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
          body: JSON.stringify({
            description: desc,
            media: media,
            mediaType: mediaType,
          }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const handleDelStory = async (storyId) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(
        `${ENDPOINT}/api/story/delStory/${storyId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const handleFollowedUserPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/post/followedUserPosts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      return data.uPost;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const handleFetchTrendingPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/post/fetchTrendingPosts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const handleFetcHUserFriends = async () => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/user/userFriends`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      setUserFriends(data.friends);
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const handleUpdateProfileCover = async (profileCover) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/user/updateProfileCover`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
        body: JSON.stringify({ profileCover }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const sendOTPForUpdSettings = async (email) => {
    const token = localStorage.getItem("token");
    const parsedToken = JSON.parse(token);
    try {
      const response = await fetch(
        `${ENDPOINT}/api/user/sendMailForUpdfSettings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const verifyOTPFORUpdSettings = async (
    fullName,
    email,
    password,
    gender,
    dob,
    picture,
    Enterotp
  ) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(
        `${ENDPOINT}/api/user/verfiyOtpAndUpdSettings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
          body: JSON.stringify({
            fullName,
            email,
            password,
            gender,
            dob,
            picture,
            Enterotp,
          }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const sendOTPForgotPass = async (email) => {
    try {
      const response = await fetch(
        `${ENDPOINT}/api/user/sendMailForForgorPass`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const verifyOTPFORForgoPass = async (email, password, Enterotp) => {
    try {
      const response = await fetch(`${ENDPOINT}/api/user/verfiyOtpAndUpdPass`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          Enterotp,
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };

  const handleFetchConversation = async (receiverId) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(
        `${ENDPOINT}/api/getConversation/${receiverId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const sendMessage = async (receiverId, text) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
        body: JSON.stringify({
          receiverId,
          text,
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const sendMedia = async (receiverId, media, mediaType) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
        body: JSON.stringify({
          receiverId,
          media,
          mediaType,
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const sendMediaOfPost = async (
    receiverId,
    media,
    mediaType,
    isSharedPost,
    sharedPostId
  ) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
        body: JSON.stringify({
          receiverId,
          media,
          mediaType,
          isSharedPost,
          sharedPostId,
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const handleFetchConvUserData = async (receiverId) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(
        `${ENDPOINT}/api/user/fetchSearchedUserCred/${receiverId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const handleFetchAllUserConvUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/getUserAllConversations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const [unReadNotifications, setUnreadNotifications] = useState([]);
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
  const [readedNotifications, setReadedNotifications] = useState([]);
  const handleReadedNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/fetchReadedNotifications`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      setReadedNotifications(data.fetchNotifications);
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const updateNotificationStatus = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(
        `${ENDPOINT}/api/updateNotificationToRead/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const markAllMessage = async () => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(
        `${ENDPOINT}/api/markAllNotificationsAsRead`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const handleFetchJoinedGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/fetchJoinedGroups`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const handleFetchFeaturedGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/fetchFeaturedGroups`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const handleFetchGroupData = async (groupId) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/groupData/${groupId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const handleFetchGroupMessages = async (groupId) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(
        `${ENDPOINT}/api/fetchGroupMessages/${groupId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const sendMessageInGroup = async (groupId, senderId, text) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/sendGroupMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
        body: JSON.stringify({
          groupId,
          senderId,
          text,
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const handleCreateGroup = async (
    groupName,
    participants,
    description,
    groupPicture
  ) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/createGroup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
        body: JSON.stringify({
          groupName,
          groupPicture,
          participants,
          description,
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const handleAddInTheGroup = async (groupId) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/joinGroup/${groupId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const handledeleteGroup = async (groupId) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/deleteGroup/${groupId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const handleUpdateGroup = async (
    groupId,
    groupName,
    description,
    groupPicture,
    participants
  ) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(
        `${ENDPOINT}/api/updateGroupInfo/${groupId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
          body: JSON.stringify({
            groupName,
            description,
            groupPicture,
            participants,
          }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const fetchUserFollowingList = async () => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const userId = localStorage.getItem("id");
      const parsedId = JSON.parse(userId);
      const response = await fetch(
        `${ENDPOINT}/api/user/userFollowingList/${parsedId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const fetchUserFollowersList = async () => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const userId = localStorage.getItem("id");
      const parsedId = JSON.parse(userId);
      const response = await fetch(
        `${ENDPOINT}/api/user/userFollowersList/${parsedId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const removeFollower = async (funame) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const userName = localStorage.getItem("userName");
      const parsedUsername = JSON.parse(userName);
      const response = await fetch(`${ENDPOINT}/api/user/removeFollower`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
        body: JSON.stringify({
          followerUserName: funame,
          myUserName: parsedUsername,
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const leaveGroup = async (groupId) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);

      const response = await fetch(`${ENDPOINT}/api/leaveGroup/${groupId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const changeTheme = async () => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);

      const response = await fetch(`${ENDPOINT}/api/user/changeTheme`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const fetchPostPreview = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(
        `${ENDPOINT}/api/post/fetchSpecificPostData/${postId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": parsedToken,
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = JSON.parse(token);
      const response = await fetch(`${ENDPOINT}/api/user/fetchAllUsers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": parsedToken,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error:", error);
    }
  };

  return (
    <VividlyContext.Provider
      value={{
        sendOtp,
        verifyOTP,
        addAdditionalInfo,
        skipAdditionalInfo,
        chkUserNameExists,
        login,
        deleteUserAccount,
        getBlockUsers,
        blockUsers,
        blockUnblockUser,
        showSuggestionFunc,
        suggestions,
        fetchTrendingReelsFunc,
        fetchLikedPostsFunc,
        likedPosts,
        searchUserFunc,
        searchUsers,
        searchedUserAllDataFunc,
        chkIsAlreadyFollow,
        handleCreateStoryWithMediaOnly,
        handleCreateStoryTextAndMedia,
        handleDeletePost,
        handleEditPost,
        handleDelStory,
        handleFollowedUserPosts,
        handleFetchTrendingPosts,
        handleFetcHUserFriends,
        userFriends,
        setUserFriends,
        handleUpdateProfileCover,
        sendOTPForUpdSettings,
        verifyOTPFORUpdSettings,
        sendOTPForgotPass,
        verifyOTPFORForgoPass,
        handleFetchConversation,
        sendMessage,
        handleFetchConvUserData,
        sendMedia,
        handleFetchAllUserConvUserData,
        handleNotifications,
        handleFetchJoinedGroups,
        handleFetchFeaturedGroups,
        handleFetchGroupData,
        handleFetchGroupMessages,
        sendMessageInGroup,
        handleCreateGroup,
        handleAddInTheGroup,
        handledeleteGroup,
        handleUpdateGroup,
        fetchUserFollowingList,
        fetchUserFollowersList,
        removeFollower,
        leaveGroup,
        updateNotificationStatus,
        unReadNotifications,
        setUnreadNotifications,
        handleReadedNotifications,
        readedNotifications,
        setReadedNotifications,
        markAllMessage,
        changeTheme,
        fetchPostPreview,
        fetchAllUsers,
        sendMediaOfPost,
      }}
    >
      {props.children}
    </VividlyContext.Provider>
  );
};

export default VividlyProvider;
