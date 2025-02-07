const Story = require("../Models/storySchema");
const UserModel = require("../Models/userModel");
const UserFollowings = require("../Models/userFollowing");

const createStory = async (req, res) => {
  try {
    const { imageUrl, text } = req.body;
    const userId = req.userToken;
    if (!imageUrl && !text) {
      return res
        .status(400)
        .json({ message: "Either imageUrl or text must be provided." });
    }
    const newStory = new Story({
      user: userId,
      imageUrl,
      text,
    });
    const savedStory = await newStory.save();
    res.status(200).json({
      success: true,
      message: "Story created successfully!",
      savedStory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error, could not create story." });
  }
};

const getUserStories = async (req, res) => {
  try {
    const userId = req.userToken;
    const stories = await Story.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user");
    res.status(200).json({
      success: true,
      message: "Fetched user stories successfully!",
      stories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error, could not retrieve stories.",
    });
  }
};

const getFollowUserStories = async (req, res) => {
  try {
    const userId = req.userToken;
    const followingData = await UserFollowings.findOne({ userId });
    if (!followingData) {
      return res
        .status(404)
        .json({ success: false, message: "No following data found." });
    }
    const followingUserNames = followingData.followingList.map(
      (following) => following.userName
    );

    const followedUsers = await UserModel.find({
      userName: { $in: followingUserNames },
    });

    const followedUserIds = followedUsers.map((user) => user._id);

    const stories = await Story.find({
      user: { $in: followedUserIds },
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .populate("user");

    if (stories.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No stories found for the users you're following.",
      });
    }

    return res.status(200).json({ success: true, stories, followedUserIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error, could not fetch stories.",
    });
  }
};

const deleteStory = async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.userToken;

    const story = await Story.findById(storyId);
    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: "Story not found" });
    }

    if (story.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this story",
      });
    }

    await Story.findByIdAndDelete(storyId);

    res
      .status(200)
      .json({ success: true, message: "Story deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error, could not delete story.",
    });
  }
};

module.exports = {
  createStory,
  getUserStories,
  getFollowUserStories,
  deleteStory,
};
