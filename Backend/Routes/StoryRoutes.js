const express = require("express");
const router = express.Router();
const Middleware = require("../Middleware/index");

const {
  createStory,
  getUserStories,
  getFollowUserStories,
  deleteStory,
} = require("../Controllers/StoryController");

router.post("/create", Middleware, createStory);
router.get("/getUStories", Middleware, getUserStories);
router.get("/getFollowUserStories", Middleware, getFollowUserStories);
router.delete("/delStory/:id", Middleware, deleteStory);

module.exports = router;
