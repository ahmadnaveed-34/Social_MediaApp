import { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import socket from "./Socket";
import {
  faCog,
  faComments,
  faRemove,
  faTrash,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import vividlyContext from "../Context/vividlyContext";
import Avatar from "../Images/Avatar.jpeg";
import { useNavigate } from "react-router-dom";
import Alert2 from "./Alert2";
import Alert from "./Alert";
import SkeletonLoader from "./SkeletonLoader";
import EmojiPicker from "emoji-picker-react";
import CustomConfirm from "./CustomConfirm";

const GroupChatConversationPage = () => {
  const theme = JSON.parse(localStorage.getItem("theme"));
  const context = useContext(vividlyContext);
  const {
    handleFetchGroupData,
    handleFetchGroupMessages,
    sendMessageInGroup,
    handledeleteGroup,
    searchUsers,
    searchUserFunc,
    handleUpdateGroup,
    leaveGroup,
  } = context;

  const [showSkeleton, setShowSkeleton] = useState(false);
  const [countLoading, setCountLoading] = useState(0);
  const scrollChat = useRef(null);

  const [alert, setAlert] = useState(null);
  const showAlert = (type, msg) => {
    setAlert({
      type: type,
      msg: msg,
    });
    setTimeout(() => {
      setAlert("");
    }, 2000);
  };

  const [alert2, setAlert2] = useState(null);
  const showAlert2 = (type, msg) => {
    setAlert2({
      type: type,
      msg: msg,
    });
    setTimeout(() => {
      setAlert2("");
    }, 2000);
  };

  const ENDPOINT = process.env.REACT_APP_ENDPOINT;
  const [groupData, setGroupData] = useState("");
  const [groupMessages, setGroupMessages] = useState([]);
  const groupId = localStorage.getItem("groupId");
  const parsedGroupId = JSON.parse(groupId);
  const id = localStorage.getItem("id");
  const parsedId = JSON.parse(id);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(groupData.picture);

  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [addedMembersDetails, setAddedMembersDetails] = useState([]);

  const fetchGroupDataFunc = async () => {
    if (countLoading === 0) {
      setShowSkeleton(true);
    }
    const response = await handleFetchGroupData(parsedGroupId);
    if (response.success) {
      setGroupData(response.data);
      setAddedMembersDetails(response.userDetails);
    }
    setCountLoading(1);
    setShowSkeleton(false);
  };
  const fetchGroupMessagesFunc = async () => {
    const response = await handleFetchGroupMessages(parsedGroupId);
    if (response.success) {
      setGroupMessages(response.data);
    }
  };

  useEffect(() => {
    fetchGroupDataFunc();
    fetchGroupMessagesFunc();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (scrollChat.current) {
        scrollChat.current.scrollTo({
          top: scrollChat.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 2000);

    socket.emit("join_room", parsedGroupId);

    return () => {
      socket.off("join_room");
      socket.off("send_message");
    };
  }, [parsedGroupId]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (
        data.newMsg.senderId._id !== parsedId &&
        data.roomId === parsedGroupId
      ) {
        setTimeout(() => {
          if (scrollChat.current) {
            scrollChat.current.scrollTo({
              top: scrollChat.current.scrollHeight,
              behavior: "smooth",
            });
          }
        }, 500);
        setGroupMessages((prevGroupMessages) => [
          ...prevGroupMessages,
          data.newMsg,
        ]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const handleSendMessage = async (groupId, senderId, text) => {
    if (message.trim()) {
      const response = await sendMessageInGroup(groupId, senderId, text);
      if (response.success) {
        const newMsg = response.data[0];
        socket.emit("send_message", {
          newMsg,
          isGroupMessage: true,
          roomId: parsedGroupId,
        });
        setTimeout(() => {
          if (scrollChat.current) {
            scrollChat.current.scrollTo({
              top: scrollChat.current.scrollHeight,
              behavior: "smooth",
            });
          }
        }, 500);

        setGroupMessages((prevGroupMessages) => [...prevGroupMessages, newMsg]);
        setMessage(""); // Reset message input
      }
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formdata = new FormData();
      formdata.append("media", file);
      try {
        const data = await fetch(`${ENDPOINT}/api/post/media`, {
          method: "POST",
          body: formdata,
        });
        const response = await data.json();
        if (response.success) {
          setSelectedImage(response.url);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handSearchUser = (uId) => {
    localStorage.setItem("sUserId", JSON.stringify(uId));
    navigate("/searchUser");
  };

  const handleDeleteFunc = async (groudId) => {
    setShowConfirmDel(false);
    if (!groupData.admins.includes(parsedId)) {
      return showAlert2("error", "You are not alowed to delete group!");
    }
    const response = await handledeleteGroup(groudId);
    if (response.success) {
      navigate("/groups");
    }
  };

  const [keyword, setKeyword] = useState("");
  const [show, setShow] = useState(true);
  const handleOnchange = (e) => {
    const searchTerm = e.target.value;
    setKeyword(e.target.value);
    if (searchTerm.length > 0) {
      searchUserFunc(e.target.value);
      setShow(false);
    } else {
      setShow(true);
    }
  };

  const handleRemoveMember = (userId) => {
    const isUserIsAdmin = groupData.admins.some((admin) => admin === parsedId);
    if (!isUserIsAdmin) {
      return showAlert("error", "Only admin are allow to remove members!");
    }

    const isAdmin = groupData.admins.some((admin) => admin === userId);
    if (!isAdmin) {
      setAddedMembersDetails(
        addedMembersDetails.filter((member) => member._id !== userId)
      );
    } else {
      showAlert("error", "Admin are not allow to leave group!");
    }
  };

  const [updGroupInfo, setUpdGroupInfo] = useState({
    groupName: "",
    groupDescription: "",
  });

  const handleOpenModelFunc = () => {
    setUpdGroupInfo({
      groupName: groupData.groupName,
      groupDescription: groupData.description,
    });
  };

  const handleGroupInfoOnChange = (e) => {
    setUpdGroupInfo({
      ...updGroupInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddMember = (id, fullName, picture) => {
    if (!addedMembersDetails.some((member) => member._id === id)) {
      setAddedMembersDetails((prevAddedMembers) => [
        ...prevAddedMembers,
        { _id: id, fullName, picture }, // Correct object syntax
      ]);
      setKeyword("");
    }
  };

  const handleUpdateGroupFunc = async (
    groupId,
    groupName,
    description,
    groupPicture,
    participants
  ) => {
    const participantsIds = participants.map((user) => user._id);
    // if (!groupData.admins.includes(parsedId)) {
    //   return showAlert("error", "Only admin can update the group info!");
    // }
    if (participantsIds.length < 2) {
      return showAlert("error", "Please add 2 members to update group info!");
    } else if (groupName.trim().length < 5) {
      return showAlert("error", "Group name should be 5 characters!");
    } else if (description.trim().length < 10) {
      return showAlert("error", "Group description should be 10 characters!");
    }
    const response = await handleUpdateGroup(
      groupId,
      groupName,
      description,
      groupPicture,
      participantsIds
    );
    if (response.success) {
      setShowModal(false);
      fetchGroupDataFunc();
    }
  };

  const handleLeaveGroup = async (groupId) => {
    setShowConfirm(false);
    const isAdmin = groupData.admins.some((admin) => admin === parsedId);
    if (!isAdmin) {
      const response = await leaveGroup(groupId);
      if (response.success) {
        navigate("/groups");
      }
    } else {
      showAlert2("error", "Admin are not allowed to leave group!");
    }
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

  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmDel, setShowConfirmDel] = useState(false);
  const handleCancelDelete = () => {
    setShowConfirm(false);
  };
  const handleCancelDeleteGroup = () => {
    setShowConfirmDel(false);
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
      className={`max-w-7xl mx-auto sm:pl-72 sm:pt-24 p-4 flex flex-col ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      } `}
    >
      {showSkeleton && <SkeletonLoader />}
      {!showSkeleton && (
        <>
          <div
            className={`flex flex-col h-[80vh] ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-50"
            } `}
          >
            <Alert2 alert2={alert2} />

            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-5 flex items-center justify-between rounded-t-md">
              <div className="flex items-center space-x-4">
                <img
                  src={groupData.groupPicture || Avatar}
                  alt="Group Logo"
                  className="w-12 h-12 rounded-full object-cover"
                />

                <div className="text-xl sm:text-3xl font-semibold">
                  {groupData.groupName}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  className="bg-gray-800 text-white rounded-full p-2 md:p-3 hover:bg-gray-950 transition duration-300"
                  onClick={() => {
                    setShowConfirm(true);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faSignOutAlt}
                    className="text-lg hover:text-yellow-500"
                  />
                </button>
                {/* Delete Group Button */}
                <button
                  className="bg-gray-800 text-white rounded-full p-2 md:p-3 hover:bg-gray-950 transition duration-300"
                  onClick={() => setShowConfirmDel(true)}
                >
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="text-lg hover:text-red-600"
                  />
                </button>
                {/* Settings Button */}
                <button
                  className="bg-gray-800 text-white rounded-full p-2 md:p-3 hover:bg-gray-950 transition duration-300"
                  onClick={() => {
                    handleOpenModelFunc();
                    setShowModal(true);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faCog}
                    className="text-lg hover:text-blue-600"
                  />
                </button>
              </div>
            </div>

            {showConfirm && (
              <CustomConfirm
                message="Are you sure you want to leave group?"
                onConfirm={() => handleLeaveGroup(groupData._id)}
                onCancel={handleCancelDelete}
              />
            )}

            {showConfirmDel && (
              <CustomConfirm
                message="Are you sure you want to delete this group?"
                onConfirm={() => handleDeleteFunc(groupData._id)}
                onCancel={handleCancelDeleteGroup}
              />
            )}

            {showModal && (
              <div
                className={`fixed inset-0 ${
                  theme === "dark"
                    ? "bg-gray-900 bg-opacity-75"
                    : "bg-gray-500 bg-opacity-75"
                }   flex items-center justify-center z-50 p-4`}
              >
                <div
                  className={`${
                    theme === "dark"
                      ? "bg-gray-900 border border-white"
                      : "bg-white"
                  } p-4 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto sm:w-80 md:w-[600px]`}
                >
                  <h2
                    className={`text-2xl font-bold ${
                      theme === "dark" ? "text-white font-bold" : "text-black"
                    } `}
                  >
                    Update Group Info
                  </h2>
                  <div className="h-[36px] md:h-[26px] mb-2">
                    <Alert alert={alert} />
                  </div>
                  <input
                    type="text"
                    placeholder="Group Name"
                    className={`p-2 border rounded-lg w-full mb-4 ${
                      theme === "dark"
                        ? "text-white bg-gray-800 border border-white"
                        : "text-black"
                    } `}
                    name="groupName"
                    value={updGroupInfo.groupName}
                    onChange={handleGroupInfoOnChange}
                  />

                  <textarea
                    placeholder="Group Description"
                    className={`p-2 border rounded-lg w-full mb-4 ${
                      theme === "dark"
                        ? "text-white bg-gray-800"
                        : "text-black bg-gray-50"
                    } `}
                    rows="3"
                    name="groupDescription"
                    value={updGroupInfo.groupDescription}
                    onChange={handleGroupInfoOnChange}
                  />

                  <input
                    type="text"
                    placeholder="Search user and click to add more members"
                    className={`p-2 border rounded-lg w-full mb-1 ${
                      theme === "dark"
                        ? "text-white bg-gray-800 border border-white"
                        : "text-black bg-gray-50"
                    } `}
                    value={keyword}
                    onChange={handleOnchange}
                  />
                  <div className="max-h-[90vh] overflow-y-auto">
                    {!show &&
                      searchUsers &&
                      searchUsers.map((user) => {
                        return (
                          <div
                            className={`flex items-center p-2 ${
                              theme === "dark"
                                ? "bg-gray-200 text-black hover:bg-gray-400"
                                : "bg-gray-50 text-black hover:bg-gray-200"
                            }  rounded-lg shadow-md  transition-all duration-300 cursor-pointer border-black border-b-2 mb-3`}
                            onClick={() => {
                              setShow(true);
                              handleAddMember(
                                user._id,
                                user.fullName,
                                user.picture
                              );
                            }}
                            key={user._id}
                          >
                            <img
                              src={user.picture}
                              alt="Failed to load img"
                              className="w-12 h-12 ml-2 object-cover rounded-full border-2 border-gray-800"
                            />
                            <div className="ml-4">
                              <h2 className="text-base font-semibold ">
                                {user.fullName}
                              </h2>
                              <p className="text-sm ">@{user.userName}</p>
                            </div>
                          </div>
                        );
                      })}
                    {!show && !searchUsers ? (
                      <p
                        className={`text-lg text-center ${
                          theme === "dark"
                            ? "text-white"
                            : "text-gray-500 font-medium"
                        }   py-4`}
                      >
                        No users found. Try searching with a different keyword!
                      </p>
                    ) : (
                      ""
                    )}
                  </div>

                  <div className="mt-4">
                    <div
                      className={`text-sm font-medium ${
                        theme === "dark"
                          ? "text-white font-bold"
                          : "text-gray-700"
                      }  mb-2`}
                    >
                      Added Members:
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {addedMembersDetails.map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center space-x-2 bg-gray-200 p-2 rounded-full text-sm hover:bg-gray-300 transition-all duration-200 ease-in-out"
                          style={{ minWidth: "110px" }}
                        >
                          <img
                            src={member.picture}
                            alt={member.fullName}
                            className="w-6 h-6 rounded-full border-2 text-gray-700 border-gray-300"
                          />
                          <span className="truncate font-medium text-gray-700">
                            {member.fullName}
                          </span>
                          <button
                            onClick={() => handleRemoveMember(member._id)}
                            className="text-red-500 text-lg hover:text-red-700 transition-all duration-200 ease-in-out"
                          >
                            <FontAwesomeIcon icon={faRemove} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  {show && (
                    <>
                      <input
                        type="file"
                        className={`p-2 border rounded-lg w-full mb-4 ${
                          theme === "dark" ? "text-gray-200" : "text-black"
                        } `}
                        onChange={handleImageChange}
                      />
                      <div className="flex justify-between">
                        <button
                          className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700"
                          onClick={() => setShowModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
                          onClick={() =>
                            handleUpdateGroupFunc(
                              groupData._id,
                              updGroupInfo.groupName,
                              updGroupInfo.groupDescription,
                              selectedImage,
                              addedMembersDetails
                            )
                          }
                        >
                          Update Group
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div
              className="flex-grow overflow-y-auto p-6 space-y-4"
              ref={scrollChat}
            >
              {groupMessages.length === 0 ? (
                <p
                  className={`mt-8 text-center custom-font text-2xl font-bold ${
                    theme === "dark" ? "text-white" : "text-indigo-600"
                  } `}
                >
                  <span className="mr-2">
                    <FontAwesomeIcon icon={faComments} className="text-xl" />
                  </span>
                  No conversation yet!
                </p>
              ) : (
                groupMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${
                      msg.senderId._id === parsedId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full overflow-hidden border-2 border-white ${
                        msg.senderId._id === parsedId ? "mr-2" : "mr-2"
                      }`}
                    >
                      <img
                        src={msg.senderId.picture || Avatar}
                        alt={msg.senderId.fullName}
                        className="object-cover w-full h-full hover:cursor-pointer"
                        onClick={() => handSearchUser(msg.senderId._id)}
                      />
                    </div>

                    <div
                      className={`min-w-48 max-w-xs p-4 rounded-lg  ${
                        msg.senderId._id === parsedId
                          ? "bg-blue-600 text-white"
                          : `${
                              theme === "dark"
                                ? "bg-gray-200 text-black"
                                : "bg-gray-700 text-white"
                            }`
                      }`}
                    >
                      <div className={`font-bold text-sm`}>
                        {msg.senderId.fullName}
                      </div>
                      <p className="mt-1 break-words whitespace-normal">
                        {msg.text}
                      </p>
                      <p
                        className={`text-sm ${
                          msg.senderId._id === parsedId
                            ? "text-gray-200"
                            : `${
                                theme === "dark"
                                  ? "text-gray-600"
                                  : "text-gray-300"
                              }`
                        }
                        } mt-1`}
                      >
                        {formatDate(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div
              className={`${
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-200"
                  : "bg-white border-gray-200"
              } p-4 border-t `}
            >
              <div className="flex items-center space-x-4">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={`w-full p-3 border ${
                      theme === "dark"
                        ? "text-white bg-gray-800 border-white"
                        : "border-gray-300 text-black bg-gray-50"
                    }   rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    placeholder="Type a message..."
                  />
                  <button
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-2xl hover:scale-105 transition-transform duration-150"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                  >
                    😊
                  </button>
                  {showEmojiPicker && (
                    <div
                      ref={emojiPickerRef}
                      className="absolute bottom-12 right-3 z-50"
                    >
                      <EmojiPicker
                        onEmojiClick={(e) => {
                          setMessage((prev) => prev + e.emoji);
                          setShowEmojiPicker(false);
                        }}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() =>
                    handleSendMessage(parsedGroupId, parsedId, message)
                  }
                  className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-700 transition duration-300"
                >
                  <span className="material-icons">send</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GroupChatConversationPage;
