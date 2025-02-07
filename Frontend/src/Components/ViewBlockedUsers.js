import React, { useContext, useEffect, useState } from "react";
import vividlyContext from "../Context/vividlyContext";
import Avatar from "../Images/Avatar.jpeg";

const ViewBlockedUsers = () => {
  const context = useContext(vividlyContext);
  const { getBlockUsers, blockUsers, blockUnblockUser } = context;

  // Sample blocked users list
  // const [blockedUsers, setBlockedUsers] = useState([
  //   {
  //     id: 1,
  //     name: "Jane Doe",
  //     avatar: "https://via.placeholder.com/40?text=JD",
  //   },
  //   {
  //     id: 2,
  //     name: "John Smith",
  //     avatar: "https://via.placeholder.com/40?text=JS",
  //   },
  //   {
  //     id: 3,
  //     name: "Emily Johnson",
  //     avatar: "https://via.placeholder.com/40?text=EJ",
  //   },
  // ]);

  useEffect(() => {
    getBlockUsers();
  }, []);

  // Handle unblock user
  // const handleUnblock = (id) => {
  //   setBlockedUsers(blockedUsers.filter((user) => user.id !== id));
  // };

  const handleBlockUnblockUser = async (id) => {
    const response = await blockUnblockUser(id);
    if (response.success) {
      await getBlockUsers();
    }
  };

  return (
    <div className="min-h-screen sm:pl-72 sm:pt-24 max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-black">Blocked Users</h1>
      {blockUsers.length > 0 ? (
        <ul className="space-y-4">
          {blockUsers.map((user) => (
            <li
              key={user._id}
              className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={user.picture === "Not set" ? Avatar : user.picture}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <span className="text-gray-800 font-medium">{user.name}</span>
              </div>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
                onClick={() => {
                  const confirm = window.confirm(
                    "Are you sure you want to unblock this user?"
                  );
                  if (confirm) {
                    handleBlockUnblockUser(user.user);
                  }
                }}
              >
                Unblock
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 text-center">
          You haven't blocked any users yet.
        </p>
      )}
    </div>
  );
};

export default ViewBlockedUsers;
