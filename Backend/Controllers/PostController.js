const postModel = require("../Models/postModel");
const likeModel = require("../Models/likePostModel");
const commentModel = require("../Models/commentOnPostModel");
const UserFollowings = require("../Models/userFollowing");
const User = require("../Models/userModel");
const NotificationModel = require("../Models/notificationModel");
const createPost = async (req, res) => {
  try {
    const { description, media, mediaType } = req.body;
    if (!description || !media | !mediaType) {
      return res.status(400).json({
        success: false,
        message: "All fields are required to create a post!",
      });
    }
    const userId = req.userToken;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User Id not found!",
      });
    }

    const createPost = await postModel.create({
      userId,
      description,
      media,
      mediaType,
    });
    await likeModel.create({ author: req.userToken, postId: createPost._id });
    await commentModel.create({
      author: req.userToken,
      postId: createPost._id,
    });

    if (createPost) {
      return res.status(200).json({
        success: true,
        message: "Post created successfully!",
        id: createPost._id,
        userId: createPost.userId,
        description: createPost.description,
        media: createPost.media,
        mediaType: createPost.mediaType,
      });
    }
  } catch {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};
const updatepost = async (req, res) => {
  try {
    const updatePost = {};
    const { description, media, mediaType } = req.body;
    const { postId } = req.params;

    if (!postId) {
      return res.status(404).json({
        success: false,
        message: "Post Id not provided!",
      });
    }

    const userId = req.userToken;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Access denied, user Id not provided!",
      });
    }

    const isPostExists = await postModel.findById(postId);
    if (!isPostExists) {
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }

    const isUserPost = await postModel.findOne({
      _id: postId,
      userId: userId,
    });
    if (!isUserPost) {
      return res.status(401).json({
        success: false,
        message: "Access denied, you cannot update another user's post!",
      });
    }

    if (description) updatePost.description = description;
    if (media) updatePost.media = media;
    if (mediaType) updatePost.mediaType = mediaType;

    const updateThePost = await postModel.findOneAndUpdate(
      { _id: postId, userId: userId },
      { $set: updatePost },
      { new: true }
    );

    if (updateThePost) {
      return res.status(200).json({
        success: true,
        message: "Post updated successfully!",
        post: updateThePost,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to update the post!",
      });
    }
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      return res.status(404).json({
        success: false,
        message: "Post Id not found!",
      });
    }
    const userId = req.userToken;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Access denied user Id not provided!!",
      });
    }
    const isPostExists = await postModel.findById(postId);

    if (!isPostExists) {
      return res.status(404).json({
        success: false,
        message: "Post not found which you want to delete!",
      });
    }

    const isUserPost = await postModel.findOne({
      userId: userId,
    });
    if (!isUserPost) {
      return res.status(401).json({
        success: false,
        message: "Accces denied, Not Allowed to delete other user post!",
      });
    }

    const delPost = await postModel.findByIdAndDelete({
      _id: postId,
    });
    await likeModel.findOneAndDelete({ postId: postId });
    await NotificationModel.deleteMany({ postId: postId });

    if (delPost) {
      return res.status(200).json({
        success: true,
        message: "Post delete successfully!",
      });
    }
  } catch {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const fetchUserPost = async (req, res) => {
  try {
    const findUPosts = await postModel
      .find({ userId: req.userToken })
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Fetch user Posts Successully!",
      uPost: findUPosts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
      error: error.message,
    });
  }
};

const fetchFollowedUserPost = async (req, res) => {
  try {
    const followingList = await UserFollowings.findOne({
      userId: req.userToken,
    });
    if (!followingList) {
      return res.status(404).json({
        success: false,
        message: "User following list not found!",
      });
    }
    const followedUsersUsernames = followingList.followingList.map(
      (user) => user.userName
    );

    const findFollowedUsers = await User.find({
      userName: followedUsersUsernames,
    });
    const followedUserIds = findFollowedUsers.map((user) => user._id);

    const findUPosts = await postModel
      .find({ userId: followedUserIds })
      .populate("userId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Fetch followed user posts Successully!",
      uPost: findUPosts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
      error: error.message,
    });
  }
};

const fetchTrendingReels = async (req, res) => {
  try {
    const trendingReels = await postModel.aggregate([
      {
        $match: { mediaType: "video" },
      },
      {
        $lookup: {
          from: "users", // The name of the User collection
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: "$userData", // Flatten the userData array for easier access
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "postId",
          as: "likesData",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postId",
          as: "commentsData",
        },
      },
      {
        $addFields: {
          totalLikes: {
            $sum: {
              $map: {
                input: "$likesData",
                as: "like",
                in: { $size: "$$like.likes" },
              },
            },
          },
          totalComments: {
            $sum: {
              $map: {
                input: "$commentsData",
                as: "comment",
                in: { $size: "$$comment.comments" },
              },
            },
          },
        },
      },
      {
        $addFields: {
          engagementScore: { $add: ["$totalLikes", "$totalComments"] },
        },
      },
      {
        $sort: { engagementScore: -1, createdAt: -1 },
      },
      {
        $limit: 20,
      },
      {
        $project: {
          likesData: 0,
          commentsData: 0,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Trending reels fetched successfully!",
      reels: trendingReels,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
      error: error.message,
    });
  }
};

const fetchLikedPost = async (req, res) => {
  const userId = req.userToken;
  try {
    const posts = await likeModel
      .find({
        likes: { $elemMatch: { user: userId } },
      })
      .populate({
        path: "postId",
        populate: {
          path: "userId",
          select: "fullName userName picture",
        },
      });

    if (posts) {
      return res.status(200).json({
        success: true,
        message: "Fetch Liked Posts Successully!",
        likedPost: posts,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
      error: error.message,
    });
  }
};
const getTrendingPosts = async (req, res) => {
  try {
    const postLikes = await likeModel.aggregate([
      {
        $unwind: "$likes",
      },
      {
        $group: {
          _id: "$postId",
          likeCount: { $sum: 1 },
        },
      },
    ]);

    const postComments = await commentModel.aggregate([
      {
        $unwind: "$comments",
      },
      {
        $group: {
          _id: "$postId",
          commentCount: { $sum: 1 },
        },
      },
    ]);

    const postLikesMap = postLikes.reduce((acc, item) => {
      acc[item._id] = item.likeCount;
      return acc;
    }, {});

    const postCommentsMap = postComments.reduce((acc, item) => {
      acc[item._id] = item.commentCount;
      return acc;
    }, {});

    const allPosts = await postModel.find().populate("userId");

    const postsWithEngagement = allPosts.map((post) => {
      const postId = post._id.toString();
      return {
        ...post.toObject(),
        likeCount: postLikesMap[postId] || 0,
        commentCount: postCommentsMap[postId] || 0,
        engagementScore:
          (postLikesMap[postId] || 0) + (postCommentsMap[postId] || 0),
      };
    });

    postsWithEngagement.sort((a, b) => b.engagementScore - a.engagementScore);

    return res.status(200).json({
      success: true,
      message: "Trending posts fetched successfully",
      data: postsWithEngagement,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch trending posts",
      error: error.message,
    });
  }
};

const fetchSpecificPostData = async (req, res) => {
  try {
    const userId = req.userToken;
    const { postId } = req.params;
    const findPost = await postModel.findById(postId);
    if (!findPost) {
      return res.status(400).json({
        success: false,
        message: "Post not found",
      });
    }
    const authordata = await User.findById(findPost.userId);

    const fetchUserData = await User.findById(userId);
    const fetchLikes = await likeModel
      .findOne({ postId: postId })
      .select("likes");

    const fetchComments = await commentModel
      .findOne({ postId: postId })
      .select("comments");

    return res.status(200).json({
      success: true,
      message: "Fetch Post Data Successfully!",
      fetchUserData,
      authordata,
      findPost,
      fetchLikes,
      fetchComments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch specific post",
      error: error.message,
    });
  }
};

module.exports = {
  createPost,
  updatepost,
  deletePost,
  fetchUserPost,
  fetchTrendingReels,
  fetchLikedPost,
  fetchFollowedUserPost,
  getTrendingPosts,
  fetchSpecificPostData,
};
