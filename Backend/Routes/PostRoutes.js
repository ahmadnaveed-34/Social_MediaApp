const express = require("express");
const router = express.Router();
const Middleware = require("../Middleware/index");
const {
  createPost,
  updatepost,
  deletePost,
  fetchUserPost,
  fetchTrendingReels,
  fetchLikedPost,
  fetchFollowedUserPost,
  getTrendingPosts,
  fetchSpecificPostData,
} = require("../Controllers/PostController");

router.post("/createPost", Middleware, createPost);
router.put("/updatePost/:postId", Middleware, updatepost);
router.delete("/deletePost/:postId", Middleware, deletePost);
router.get("/fetchUserPosts", Middleware, fetchUserPost);
router.get("/followedUserPosts", Middleware, fetchFollowedUserPost);
router.get("/fetchTrendingReels", Middleware, fetchTrendingReels);
router.get("/fetchLikedPosts", Middleware, fetchLikedPost);
router.get("/fetchTrendingPosts", Middleware, getTrendingPosts);
router.get("/fetchSpecificPostData/:postId", Middleware, fetchSpecificPostData);
module.exports = router;
