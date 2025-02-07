import React, { useContext, useEffect, useRef, useState } from "react";
import vividlyContext from "../Context/vividlyContext";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faRemove } from "@fortawesome/free-solid-svg-icons";
import Avatar from "../Images/Avatar.jpeg";
import Alert from "./Alert";
import SkeletonLoader from "./SkeletonLoader";

const Groups = () => {
  const theme = JSON.parse(localStorage.getItem("theme"));
  const context = useContext(vividlyContext);
  const {
    handleFetchJoinedGroups,
    handleFetchFeaturedGroups,
    handleCreateGroup,
    searchUserFunc,
    searchUsers,
    handleAddInTheGroup,
  } = context;

  const [showSkeleton, setShowSkeleton] = useState(false);
  const [countLoading, setCountLoading] = useState(0);
  const inputRef = useRef(null);

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
  const ENDPOINT = process.env.REACT_APP_ENDPOINT;
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [featuredGroups, setFeaturedGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(Avatar);

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

  const fetchJoinedGroups = async () => {
    if (countLoading === 0) {
      setShowSkeleton(true);
    }
    const response = await handleFetchJoinedGroups();
    if (response.success) {
      setJoinedGroups(response.data);
    }
    setCountLoading(1);
    setShowSkeleton(false);
  };

  const fetchFeaturedGroups = async () => {
    const response = await handleFetchFeaturedGroups();
    if (response.success) {
      setFeaturedGroups(response.data);
    }
  };

  const handleFetchGroupConversations = async (id) => {
    localStorage.setItem("groupId", JSON.stringify(id));
    navigate("/groupConversation");
  };

  const [createGroupDetails, setCreateGroupDetails] = useState({
    name: "",
    description: "",
  });

  const createGroupOnChange = (e) => {
    setCreateGroupDetails({
      ...createGroupDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleGroupCreation = async () => {
    const participants = addMemberDetails.map((user) => user.id);
    if (createGroupDetails.name.trim().length < 5) {
      return showAlert("error", "Group name should be 5 characters!");
    } else if (createGroupDetails.description.trim().length < 10) {
      return showAlert("error", "Group description should be 10 characters!");
    } else if (participants.length < 2) {
      return showAlert("error", "Atleast add 2 members to create a group!");
    }
    if (
      createGroupDetails.name.trim() &&
      createGroupDetails.description.trim()
    ) {
      const response = await handleCreateGroup(
        createGroupDetails.name,
        participants,
        createGroupDetails.description,
        selectedImage
      );
      if (response.success) {
        setShowModal(false);
        fetchJoinedGroups();
        fetchFeaturedGroups();
        setAddMemberDetails([]);
        setCreateGroupDetails({
          ...createGroupDetails,
          name: "",
          description: "",
        });
      } else {
        return showAlert("error", "Failed to create group!");
      }
    } else {
      return showAlert("error", "Please provide all required details!");
    }
  };

  const [addMemberDetails, setAddMemberDetails] = useState([]);

  const handleAddMember = (id, fullName, picture) => {
    if (!addMemberDetails.some((member) => member.id === id)) {
      setAddMemberDetails((prevMemberDetails) => [
        ...prevMemberDetails,
        { id, fullName, picture },
      ]);
      setKeyword("");
    }
  };

  const handleRemoveMember = (userId) => {
    setAddMemberDetails(
      addMemberDetails.filter((member) => member.id !== userId)
    );
  };

  const handleJoinGroupFunc = async (id) => {
    const response = await handleAddInTheGroup(id);
    const details = response.data;
    if (response.success) {
      setFeaturedGroups((prevFeaturedGroups) =>
        prevFeaturedGroups.filter((group) => group._id !== id)
      );
      setJoinedGroups((prevJoinedGroups) => [...prevJoinedGroups, details]);
      await fetchJoinedGroups();
      setFilteredGroups(false);
      setFilteredFeaturedGroups(false);
      setSearchValue("");
    } else {
      window.alert("Group deleted by admin!");
    }
  };

  const [filteredGroups, setFilteredGroups] = useState(false);
  const [filteredFeaturedGroups, setFilteredFeaturedGroups] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const handleFilterGroups = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchValue(e.target.value);
    if (searchTerm.length > 0) {
      setFilteredGroups(
        joinedGroups.filter((group) =>
          group.groupName.toLowerCase().includes(searchTerm)
        )
      );
      setFilteredFeaturedGroups(
        featuredGroups.filter((group) =>
          group.groupName.toLowerCase().includes(searchTerm)
        )
      );
    } else {
      setFilteredGroups(false);
      setFilteredFeaturedGroups(false);
    }
  };

  useEffect(() => {
    fetchJoinedGroups();
    fetchFeaturedGroups();
  }, []);

  return (
    <div
      className={`min-h-screen sm:pl-72 sm:pt-24 mx-auto ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      }  p-6 shadow-md`}
    >
      {showSkeleton && <SkeletonLoader />}

      {!showSkeleton && (
        <>
          <div className="mt-4 flex justify-between items-center">
            <input
              type="text"
              value={searchValue}
              placeholder="Search for groups..."
              className={`p-2 ${
                theme === "dark"
                  ? "text-white bg-gray-800 border border-white"
                  : "border text-black"
              }  rounded-lg w-full `}
              onChange={handleFilterGroups}
            />
            <button
              className="ml-4 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:from-purple-600 hover:to-indigo-500 hover:shadow-xl transition-transform duration-300 transform hover:scale-105"
              onClick={() => setShowModal(true)}
            >
              <span className="flex items-center">
                <FontAwesomeIcon icon={faPlus} />
                Create Group
              </span>
            </button>
          </div>

          {showModal && (
            <div
              className={`fixed inset-0 ${
                theme === "dark"
                  ? "bg-gray-900 bg-opacity-75"
                  : "bg-gray-500 bg-opacity-75"
              } flex items-center justify-center z-50 p-4`}
            >
              <div
                className={`${
                  theme === "dark"
                    ? "bg-gray-900 border border-gray-400"
                    : "bg-white"
                } p-4 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto sm:w-80 md:w-[600px]`}
              >
                <h2
                  className={`text-2xl ${
                    theme === "dark" ? "text-white font-bold" : "text-black"
                  } font-bold `}
                >
                  Create New Group
                </h2>
                <div className="h-[38px] md:h-[26px] mb-2">
                  <Alert alert={alert} />
                </div>
                <input
                  type="text"
                  placeholder="Group Name"
                  className={`p-2 ${
                    theme === "dark"
                      ? "bg-gray-800 text-white border border-white"
                      : "border text-black"
                  }  rounded-lg w-full mb-4 `}
                  name="name"
                  value={createGroupDetails.name}
                  onChange={createGroupOnChange}
                />

                <textarea
                  placeholder="Group Description"
                  className={`p-2 border rounded-lg w-full mb-4 ${
                    theme === "dark"
                      ? "text-white bg-gray-800"
                      : "text-black bg-white"
                  } `}
                  rows="3"
                  name="description"
                  value={createGroupDetails.description}
                  onChange={createGroupOnChange}
                />

                <input
                  type="text"
                  placeholder="Search user and click to add"
                  className={`p-2 border rounded-lg w-full mb-1 ${
                    theme === "dark"
                      ? "text-white border-white bg-gray-800"
                      : "text-black"
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
                              ? "bg-gray-200 text-black hover:bg-gray-300 border-black"
                              : "bg-gray-50 text-black hover:bg-gray-200 border-black"
                          }  rounded-lg shadow-md  transition-all duration-300 cursor-pointer  border-b-2 mb-3`}
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
                            className={`w-12 h-12 ml-2 ${
                              theme === "dark" ? "border-2 border-gray-500" : ""
                            } object-cover rounded-full border-2 border-gray-800`}
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
                        theme === "dark" ? "text-gray-300" : "text-gray-500"
                      }  font-medium py-4`}
                    >
                      {" "}
                      No users found. Try searching with a different keyword!
                    </p>
                  ) : (
                    ""
                  )}
                </div>
                {show && (
                  <>
                    <div className="mt-4">
                      {addMemberDetails.length > 0 && (
                        <div
                          className={`text-sm font-medium ${
                            theme === "dark"
                              ? "text-gray-200 font-bold"
                              : "text-gray-700"
                          }  mb-2`}
                        >
                          Added Members:
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {addMemberDetails.map((member) => (
                          <div
                            key={member.id}
                            className={`flex items-center space-x-2 ${
                              theme === "dark"
                                ? "bg-gray-300 hover:bg-gray-400"
                                : "bg-gray-200 hover:bg-gray-300"
                            }  p-2 rounded-full text-sm  transition-all duration-200 ease-in-out`}
                            style={{ minWidth: "110px" }}
                          >
                            <img
                              src={member.picture}
                              alt={member.fullName}
                              className={`w-6 h-6 rounded-full border-2 ${
                                theme === "dark"
                                  ? "text-gray-300 border-gray-500"
                                  : "text-gray-700 border-gray-300"
                              } `}
                            />
                            <span
                              className={`truncate font-medium ${
                                theme === "dark"
                                  ? "text-gray-800"
                                  : "text-gray-700"
                              } t`}
                            >
                              {member.fullName}
                            </span>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-500 text-lg hover:text-red-700 transition-all duration-200 ease-in-out"
                            >
                              <FontAwesomeIcon icon={faRemove} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <input
                      type="file"
                      className={`p-2 border rounded-lg w-full mb-4 ${
                        theme === "dark" ? "text-white" : "text-black"
                      } `}
                      accept="image/*"
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
                        onClick={handleGroupCreation}
                      >
                        Create Group
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h3
              className={`text-2xl font-bold mb-4  ${
                theme === "dark" ? "text-white font-bold" : "text-black"
              } `}
            >
              Your Joined Groups
            </h3>
            <div className="grid grid-cols-1 lsm:grid-cols-2 lg:grid-cols-3 gap-6">
              {!filteredGroups && joinedGroups.length === 0 ? (
                <p
                  className={` ${
                    theme === "dark" ? "text-gray-200" : "text-gray-500"
                  }`}
                >
                  You have not joined any groups yet.
                </p>
              ) : (
                !filteredGroups &&
                joinedGroups.map((group) => (
                  <div
                    key={group._id}
                    className={` ${
                      theme === "dark"
                        ? "bg-gray-800 border border-white"
                        : "bg-white"
                    } p-6 rounded-xl shadow-lg hover:shadow-2xl transition-transform duration-300 ease-in-out transform hover:scale-105`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`text-2xl font-semibold  ${
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        }  truncate max-w-[70%]`}
                      >
                        {group.groupName}
                      </div>

                      {/* Members Count */}
                      <span
                        className={`text-sm  ${
                          theme === "dark" ? "text-gray-300" : "text-gray-500"
                        }  whitespace-nowrap`}
                      >
                        {group.participants.length} members
                      </span>
                    </div>

                    <p
                      className={` ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      } mt-3 text-lg`}
                      style={{
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {group.description}
                    </p>
                    <button
                      className="mt-6 px-5 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-300"
                      onClick={() => handleFetchGroupConversations(group._id)}
                    >
                      Visit Group
                    </button>
                  </div>
                ))
              )}

              {filteredGroups && filteredGroups.length === 0 ? (
                <p
                  className={` ${
                    theme === "dark" ? "text-gray-200" : "text-gray-700"
                  } font-semibold text-base`}
                >
                  No groups found!
                </p>
              ) : (
                filteredGroups &&
                filteredGroups.map((group) => (
                  <div
                    key={group._id}
                    className={` ${
                      theme === "dark"
                        ? "bg-gray-800 border border-white"
                        : "bg-white"
                    } p-6 rounded-xl shadow-lg hover:shadow-2xl transition-transform duration-300 ease-in-out transform hover:scale-105`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`text-2xl font-semibold  ${
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        }  truncate max-w-[70%]`}
                      >
                        {group.groupName}
                      </div>

                      {/* Members Count */}
                      <span
                        className={`text-sm  ${
                          theme === "dark" ? "text-gray-300" : "text-gray-500"
                        }  whitespace-nowrap`}
                      >
                        {group.participants.length} members
                      </span>
                    </div>

                    <p
                      className={` ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      } mt-3 text-lg`}
                      style={{
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {group.description}
                    </p>
                    <button
                      className="mt-6 px-5 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-300"
                      onClick={() => handleFetchGroupConversations(group._id)}
                    >
                      Visit Group
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-8">
            <h3
              className={`text-2xl font-bold mb-4  ${
                theme === "dark" ? "text-white font-bold" : "text-black"
              } `}
            >
              Featured Groups
            </h3>
            <div className="grid grid-cols-1 lsm:grid-cols-2 lg:grid-cols-3 gap-6">
              {!filteredFeaturedGroups && featuredGroups.length === 0 ? (
                <p
                  className={` ${
                    theme === "dark" ? "text-gray-200" : "text-gray-600"
                  } text-md font-semibold mt-2`}
                >
                  No featured groups to show right now.
                </p>
              ) : (
                !filteredFeaturedGroups &&
                featuredGroups.map((group) => (
                  <div
                    key={group._id}
                    className={` ${
                      theme === "dark"
                        ? "bg-gray-800 border border-white"
                        : "bg-white"
                    } p-6 rounded-xl shadow-lg hover:shadow-2xl transition-transform duration-300 ease-in-out transform hover:scale-105`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`text-2xl font-semibold  ${
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        }  truncate max-w-[65%] overflow-hidden`}
                      >
                        {group.groupName}
                      </div>

                      {/* Members Count */}
                      <span
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-500"
                        }  whitespace-nowrap flex-shrink-0`}
                      >
                        {group.participants.length} members
                      </span>
                    </div>

                    <p
                      className={`${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      } mt-3 text-lg`}
                    >
                      {group.description}
                    </p>
                    <button
                      className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300"
                      onClick={() => handleJoinGroupFunc(group._id)}
                    >
                      Join Group
                    </button>
                  </div>
                ))
              )}
              {filteredFeaturedGroups && filteredFeaturedGroups.length === 0 ? (
                <p
                  className={`${
                    theme === "dark" ? "text-gray-200" : "text-gray-600"
                  } text-md font-semibold mt-2`}
                >
                  No group found!
                </p>
              ) : (
                filteredFeaturedGroups &&
                filteredFeaturedGroups.map((group) => (
                  <div
                    key={group._id}
                    className={`${
                      theme === "dark"
                        ? "bg-gray-800 border border-white"
                        : "bg-white"
                    } p-6 rounded-xl shadow-lg hover:shadow-2xl transition-transform duration-300 ease-in-out transform hover:scale-105`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`text-2xl font-semibold ${
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        }  truncate max-w-[65%] overflow-hidden`}
                      >
                        {group.groupName}
                      </div>

                      <span
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-300 " : "text-gray-500 "
                        }whitespace-nowrap flex-shrink-0`}
                      >
                        {group.participants.length} members
                      </span>
                    </div>

                    <p
                      className={`${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      } mt-3 text-lg`}
                    >
                      {group.description}
                    </p>
                    <button
                      className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300"
                      onClick={() => handleJoinGroupFunc(group._id)}
                    >
                      Join Group
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Groups;
