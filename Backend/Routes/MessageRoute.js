const express = require("express");
const router = express.Router();
const Middleware = require("../Middleware/index");
const {
  sendMessage,
  getConversation,
  getUserAllConversations,
  fetchUnreadNotifications,
  fetchReadedNotifications,
  updateNotificationToRead,
  markAllNotificationsAsRead,
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
} = require("../Controllers/MessageController");

router.post("/sendMessage", Middleware, sendMessage);
router.get("/getConversation/:receiverId", Middleware, getConversation);
router.get("/groupData/:groupId", Middleware, groupData);
router.get("/getUserAllConversations", Middleware, getUserAllConversations);
router.get("/fetchUnreadNotifications", Middleware, fetchUnreadNotifications);
router.get("/fetchReadedNotifications", Middleware, fetchReadedNotifications);
router.put(
  "/updateNotificationToRead/:id",
  Middleware,
  updateNotificationToRead
);
router.put(
  "/markAllNotificationsAsRead",
  Middleware,
  markAllNotificationsAsRead
);
router.post("/createGroup", Middleware, createGroup);
router.post("/sendGroupMessage", Middleware, sendGroupMessage);
router.get("/fetchGroupMessages/:groupId", Middleware, fetchGroupMessages);
router.get("/fetchFeaturedGroups", Middleware, fetchFeaturedGroups);
router.get("/fetchJoinedGroups", Middleware, fetchJoinedGroups);
router.post("/joinGroup/:groupId", Middleware, joinGroup);
router.put("/updateGroupInfo/:groupId", Middleware, updateGroupInfo);
router.delete("/deleteGroup/:groupId", Middleware, deleteGroup);
router.put("/leaveGroup/:groupId", Middleware, leaveGroup);

module.exports = router;
