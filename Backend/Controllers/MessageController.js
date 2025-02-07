const MessageModel = require("../Models/messageModel");
const ConversationModel = require("../Models/conversationModel");
const NotificationModel = require("../Models/notificationModel");
const User = require("../Models/userModel");
const GroupConversation = require("../Models/groupConversationSchema");
const GroupMessage = require("../Models/groupMessageSchema");

const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, media, mediaType, isSharedPost, sharedPostId } =
      req.body;
    const senderId = req.userToken;

    const senderData = await User.findById(senderId);

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver Id is required to send message!",
      });
    }

    const receiverData = await User.findById(receiverId);
    if (!receiverData) {
      return res.status(400).json({
        success: false,
        message: "Receiver not found!",
      });
    }

    let newMessage;
    if (
      text ||
      (media && mediaType) ||
      (media && mediaType && isSharedPost && sharedPostId)
    ) {
      newMessage = await MessageModel.create({
        senderId,
        receiverId,
        text,
        media,
        mediaType,
        isSharedPost,
        sharedPostId,
      });

      let conversation = await ConversationModel.findOne({
        users: { $all: [senderId, receiverId] },
      });

      if (!conversation) {
        conversation = new ConversationModel({
          users: [senderId, receiverId],
          latestMessage: newMessage._id,
          unReadMessage: 1,
        });
      } else {
        conversation.latestMessage = newMessage._id;
        conversation.unReadMessage += 1;
      }

      await conversation.save();

      await NotificationModel.create({
        user: receiverId,
        sender: senderId,
        type: "message",
        content: text
          ? `${senderData.fullName} sent you a message: "${text}"`
          : "You have received a media message.",
        isRead: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
      error: error.message,
    });
  }
};
const getConversation = async (req, res) => {
  try {
    const senderId = req.userToken;
    const { receiverId } = req.params;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver Id is required to fetch conversation!",
      });
    }

    await MessageModel.updateMany(
      {
        $or: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
        readMessage: { $ne: true },
      },
      { $set: { readMessage: true } }
    );

    const conversation = await ConversationModel.findOne({
      users: { $all: [senderId, receiverId] },
    }).populate("latestMessage");

    if (!conversation) {
      return res.status(200).json({
        success: true,
        message: "No conversation started yet.",
        data: [],
      });
    }
    const getMessages = await MessageModel.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });
    return res.status(200).json({
      success: true,
      message: "Conversation retrieved successfully!",
      data: {
        conversation: conversation,
        messages: getMessages,
      },
    });
  } catch (error) {
    console.error("Error in getConversation:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
      error: error.message,
    });
  }
};
const getUserAllConversations = async (req, res) => {
  const userId = req.userToken;

  try {
    const conversations = await ConversationModel.find({
      users: { $in: [userId] },
    })
      .populate("users", "_id fullName userName picture")
      .populate(
        "latestMessage",
        "text media mediaType sender createdAt readMessage"
      )
      .exec();

    const conversationData = conversations.map((conversation) => {
      return {
        conversationId: conversation._id,
        users: conversation.users
          .filter((user) => user._id.toString() !== userId)
          .map((user) => ({
            id: user._id,
            name: user.fullName,
            username: user.userName,
            profilePicture: user.picture,
          })),
        latestMessage: conversation.latestMessage,
        unReadMessage: conversation.unReadMessage,
        isReadMessage: conversation.readMessage,
        updatedAt: conversation.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      message: "Fetch all conversation successfully!",
      conversationData,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

const fetchUnreadNotifications = async (req, res) => {
  const userId = req.userToken;
  try {
    const fetchNotifications = await NotificationModel.find({
      user: userId,
      isRead: false,
    }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Fetch unRead notifications successfully!",
      fetchNotifications,
    });
  } catch (error) {
    console.error("Error fetching unRead Notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unRead Notifications",
      error: error.message,
    });
  }
};

const fetchReadedNotifications = async (req, res) => {
  const userId = req.userToken;
  try {
    const fetchNotifications = await NotificationModel.find({
      user: userId,
      isRead: { $ne: false },
    }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Fetch Readed notifications successfully!",
      fetchNotifications,
    });
  } catch (error) {
    console.error("Error fetching Readed Notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Readed Notifications",
      error: error.message,
    });
  }
};

const updateNotificationToRead = async (req, res) => {
  const { id } = req.params;
  try {
    const updateNotificationStatus = await NotificationModel.findByIdAndUpdate(
      id,
      {
        isRead: true,
      },
      { new: true }
    );
    if (updateNotificationStatus) {
      return res.status(200).json({
        success: true,
        message: "Update Notifications status successfully!!",
      });
    }
  } catch (error) {
    console.error("Error in update Notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed update Notifications",
      error: error.message,
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  const userId = req.userToken;
  try {
    const updateNotificationStatus = await NotificationModel.updateMany(
      { user: userId },
      { $set: { isRead: true } },
      { new: true }
    );

    if (updateNotificationStatus) {
      return res.status(200).json({
        success: true,
        message: "Update Notifications status successfully!!",
      });
    }
  } catch (error) {
    console.error("Error in update Notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed update Notifications",
      error: error.message,
    });
  }
};

const createGroup = async (req, res) => {
  try {
    const { groupName, groupPicture, participants, description } = req.body;
    const userId = req.userToken;

    if (!groupName || !participants || participants.length < 2) {
      return res.status(400).json({
        success: false,
        message: "A group must have a name and at least 2 participants.",
      });
    }

    const usersExist = await User.find({ _id: { $in: participants } });
    if (usersExist.length !== participants.length) {
      return res.status(404).json({
        success: false,
        message: "One or more participants do not exist.",
      });
    }

    if (!participants.includes(userId)) {
      participants.push(userId);
    }

    const newGroup = new GroupConversation({
      groupName,
      groupPicture: groupPicture || "",
      participants,
      admins: [userId],
      createdBy: userId,
      description: description || "",
    });

    const savedGroup = await newGroup.save();

    return res.status(201).json({
      success: true,
      message: "Group created successfully!",
      data: savedGroup,
    });
  } catch (error) {
    console.error("Error creating group:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the group.",
    });
  }
};

const groupData = async (req, res) => {
  try {
    const { groupId } = req.params;
    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Please provide group Id!",
      });
    }
    const groupData = await GroupConversation.findById(groupId);
    const userDetails = await User.find({
      _id: { $in: groupData.participants },
    });
    if (groupData) {
      return res.status(200).json({
        success: true,
        message: "Fetch group data successfully!",
        data: groupData,
        userDetails,
      });
    }
  } catch (error) {
    console.error("Error creating group:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetch group data!",
    });
  }
};

const sendGroupMessage = async (req, res) => {
  try {
    const { groupId, senderId, text, attachments } = req.body;

    if (!groupId || !senderId || !text) {
      return res.status(400).json({
        success: false,
        message: "groupId, senderId, and text are required!",
      });
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "Sender not found!",
      });
    }

    const group = await GroupConversation.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group conversation not found!",
      });
    }

    if (!group.participants.includes(senderId)) {
      return res.status(403).json({
        success: false,
        message: "Sender is not a participant in this group conversation.",
      });
    }

    // Create the new group message
    const newGroupMessage = new GroupMessage({
      groupId,
      senderId,
      text,
      attachments: attachments || [],
      readBy: [senderId],
    });

    const savedMessage = await newGroupMessage.save();

    // Update the group with the last message
    group.lastMessage = savedMessage._id;
    await group.save();

    // Populate sender details to return them in the response
    const senderDetails = {
      _id: sender._id,
      fullName: sender.fullName,
      email: sender.email,
      picture: sender.picture || "default-avatar-url", // Use a default avatar if no picture is available
    };

    // Return the response with the new message details
    return res.status(201).json({
      success: true,
      message: "Message sent successfully!",
      data: [
        {
          _id: savedMessage._id,
          groupId: savedMessage.groupId,
          senderId: senderDetails, // Send sender details
          text: savedMessage.text,
          attachments: savedMessage.attachments,
          readBy: savedMessage.readBy,
          createdAt: savedMessage.createdAt,
          updatedAt: savedMessage.updatedAt,
        },
      ],
    });
  } catch (error) {
    console.error("Error sending group message:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while sending the message.",
    });
  }
};

const fetchGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Group ID is required.",
      });
    }
    const group = await GroupConversation.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group conversation not found.",
      });
    }
    const messages = await GroupMessage.find({ groupId })
      .populate("senderId", "fullName email picture")
      .sort({ createdAt: 1 });
    return res.status(200).json({
      success: true,
      message: "Group messages retrieved successfully.",
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching group messages:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching group messages.",
    });
  }
};

const fetchJoinedGroups = async (req, res) => {
  try {
    const userId = req.userToken;
    const joinedGroups = await GroupConversation.find({
      participants: { $in: [userId] },
    }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Fetch joined groups successfully!",
      data: joinedGroups,
    });
  } catch (error) {
    console.error("Error fetching joined groups:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching joined groups.",
    });
  }
};

const fetchFeaturedGroups = async (req, res) => {
  try {
    const userId = req.userToken;
    const featuredGroups = await GroupConversation.find({
      participants: { $nin: [userId] },
    });
    return res.status(200).json({
      success: true,
      message: "Fetch featured groups successfully!",
      data: featuredGroups,
    });
  } catch (error) {
    console.error("Error fetching featured groups:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching featured groups.",
    });
  }
};

const joinGroup = async (req, res) => {
  try {
    const userId = req.userToken; // Get userId from the token
    const { groupId } = req.params; // Extract groupId from the request parameters

    // Validate groupId
    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Please provide group Id to join group!",
      });
    }

    // Add user to the group's participants
    const addInGroup = await GroupConversation.findByIdAndUpdate(
      groupId,
      {
        $addToSet: { participants: userId }, // Prevent duplicate entries
      },
      { new: true } // Return the updated group
    );

    if (addInGroup) {
      return res.status(200).json({
        success: true,
        message: "Successfully added to the group",
        data: {
          _id: addInGroup._id,
          groupName: addInGroup.groupName,
          groupPicture: addInGroup.groupPicture,
          participants: addInGroup.participants,
          admins: addInGroup.admins,
          createdBy: addInGroup.createdBy,
          description: addInGroup.description,
          createdAt: addInGroup.createdAt,
          updatedAt: addInGroup.updatedAt,
        },
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Group not found!",
      });
    }
  } catch (error) {
    console.error("Failed to add a member to the group:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding a member to the group",
    });
  }
};

const updateGroupInfo = async (req, res) => {
  try {
    const userId = req.userToken;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Please provide user Id!",
      });
    }
    const { groupId } = req.params;
    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Please provide group Id to join group!",
      });
    }
    const { groupName, description, groupPicture, participants } = req.body;

    const updateInfo = {};
    if (groupName) {
      updateInfo.groupName = groupName;
    }
    if (description) {
      updateInfo.description = description;
    }
    if (groupPicture) {
      updateInfo.groupPicture = groupPicture;
    }
    if (participants) {
      updateInfo.participants = participants;
    }

    const updateGroupInfo = await GroupConversation.findByIdAndUpdate(
      groupId,
      {
        $set: updateInfo,
      },
      { new: true }
    );

    if (updateGroupInfo) {
      return res.status(200).json({
        success: true,
        message: "Successfully updated group Info",
        data: {
          _id: updateGroupInfo._id,
          groupName: updateGroupInfo.groupName,
          groupPicture: updateGroupInfo.groupPicture,
          participants: updateGroupInfo.participants,
          admins: updateGroupInfo.admins,
          createdBy: updateGroupInfo.createdBy,
          description: updateGroupInfo.description,
          createdAt: updateGroupInfo.createdAt,
          updatedAt: updateGroupInfo.updatedAt,
        },
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Group not found!",
      });
    }
  } catch (error) {
    console.error("Failed to add a member to the group:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating group info",
    });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Please provide group Id to join group!",
      });
    }

    const delGroup = await GroupConversation.findByIdAndDelete(groupId);
    if (delGroup) {
      return res.status(200).json({
        success: true,
        message: "Successfully delete the group!",
      });
    }
  } catch (error) {
    console.error("Failed to delete the group:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while delete the group",
    });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const userId = req.userToken;
    const { groupId } = req.params;
    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Please provide group Id to leave group!",
      });
    }
    const leaveGroup = await GroupConversation.findByIdAndUpdate(
      groupId,
      {
        $pull: {
          participants: userId,
        },
      },
      { new: true }
    );
    if (leaveGroup) {
      return res.status(200).json({
        success: true,
        message: "Successfully leave the group!",
      });
    }
  } catch (error) {
    console.error("Failed to leave the group:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while leave the group",
    });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getUserAllConversations,
  createGroup,
  sendGroupMessage,
  fetchGroupMessages,
  fetchFeaturedGroups,
  fetchJoinedGroups,
  groupData,
  joinGroup,
  updateGroupInfo,
  deleteGroup,
  leaveGroup,
  fetchUnreadNotifications,
  updateNotificationToRead,
  fetchReadedNotifications,
  markAllNotificationsAsRead,
};
