const Otp = require("../Models/Otp");
const User = require("../Models/userModel");
const UserFollowings = require("../Models/userFollowing");
const UserFollowers = require("../Models/userFollowers");
const userSetting = require("../Models/userSettingModel");
const blockUsers = require("../Models/blockUsersModel");
const postSchema = require("../Models/postModel");
const likeModel = require("../Models/likePostModel");
const commentModel = require("../Models/commentOnPostModel");
const GroupConversation = require("../Models/groupConversationSchema");
const nodeMailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const NotificationModel = require("../Models/notificationModel");

// ENDPOINT: User Signup (First send an Otp to user Email than verify Otp and save user data in database)
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendMail = async (email, otp) => {
  const transporter = nodeMailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const MailOption = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Vividly: Your One-Time Password (OTP) for Signup",
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h1 style="color: #4CAF50; text-align: center;">Vividly</h1>
      <p style="font-size: 16px;">Dear User,</p>
      <p style="font-size: 16px;">
        Your one-time password (OTP) for completing the signup process is:
      </p>
      <p style="font-size: 24px; color: #FF5722; font-weight: bold; text-align: center; margin: 20px 0;">
        ${otp}
      </p>
      <p style="font-size: 16px;">
        Please enter this code within the next <strong>60 minutes</strong> to verify your account.
      </p>
      <p style="font-size: 16px; margin-top: 20px;">
        Thank you for choosing <strong>Vividly</strong>!<br />
        The Vividly Team
      </p>
      <footer style="font-size: 12px; color: #888; margin-top: 30px; text-align: center;">
        This is an automated message, please do not reply.
      </footer>
    </div>
  `,
  };
  await transporter.sendMail(MailOption);
};

const userSignup = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required input field!",
      });
    }
    const isAlreadyExistEmail = await User.findOne({ email });
    if (isAlreadyExistEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already linked to another account!",
      });
    }
    const otp = generateOtp();
    const expireTime = Date.now() + 3600 * 1000;
    await Otp.create({ email, otp, expiryTime: expireTime });
    sendMail(email, otp);
    return res.status(200).json({
      success: true,
      message: "OTP send to your email successfully!",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Server Down!" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { fullName, userName, email, password, Enterotp } = req.body;
    if (!fullName || !userName || !email || !password || !Enterotp) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and other fields are required!",
      });
    }

    const storedOtpData = await Otp.findOne({ email, otp: Enterotp });
    if (!storedOtpData) {
      return res
        .status(400)
        .json({ success: false, message: "OTP not found or expired" });
    }

    await Otp.deleteOne({ _id: storedOtpData._id });

    const salt = await bcrypt.genSalt(8);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      userName,
      email,
      password: hashPassword,
    });
    await newUser.save();
    await userSetting.create({
      userId: newUser._id,
      userName: newUser.userName,
      password: password,
    });
    await UserFollowings.create({
      userId: newUser._id,
    });
    await UserFollowers.create({
      userId: newUser._id,
    });
    await blockUsers.create({
      userId: newUser._id,
    });

    const userToken = {
      id: newUser._id,
    };

    const token = jwt.sign(userToken, process.env.JWT_SECRET, {
      expiresIn: "10 days",
    });

    if (newUser) {
      return res.status(200).json({
        success: true,
        message: "User Signup Successful!",
        id: newUser._id,
        fullName: newUser.fullName,
        userName: newUser.userName,
        email: newUser.email,
        DOB: newUser.DOB,
        token: token,
      });
    } else {
      return res.status(400).json({ success: false, message: "Server Down!" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error: error.message,
    });
  }
};

const sendMailFuncForChangeSettings = async (email, otp) => {
  const transporter = nodeMailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const MailOption = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Vividly: Verify Your Account Settings Change with OTP",
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4CAF50; text-align: center; font-size: 24px;">Vividly Account Settings Update</h1>
      <p style="font-size: 16px; margin-bottom: 20px;">
        Dear User,
      </p>
      <p style="font-size: 16px; margin-bottom: 20px;">
        We have received a request to update your account settings. To confirm this change, please use the following One-Time Password (OTP):
      </p>
      <p style="font-size: 28px; color: #FF5722; font-weight: bold; text-align: center; margin: 20px 0;">
        ${otp}
      </p>
      <p style="font-size: 16px; margin-bottom: 20px;">
        This OTP is valid for the next <strong>60 minutes</strong>. Please do not share it with anyone to ensure the security of your account.
      </p>
      <p style="font-size: 16px; margin-bottom: 20px;">
        If you did not request this change, you can safely ignore this email. No changes will be made to your account without this confirmation.
      </p>
      <p style="font-size: 16px; margin-top: 30px;">
        Thank you for choosing <strong>Vividly</strong>!<br />
        <span style="color: #888;">The Vividly Team</span>
      </p>
      <footer style="font-size: 12px; color: #888; text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px;">
        This is an automated email. Please do not reply.
      </footer>
    </div>
  `,
  };
  await transporter.sendMail(MailOption);
};

const updateUserSettings = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please fill all required input field!",
    });
  }

  const otp = generateOtp();
  const expireTime = Date.now() + 3600 * 1000;
  await Otp.create({ email, otp, expiryTime: expireTime });
  sendMailFuncForChangeSettings(email, otp);
  return res.status(200).json({
    success: true,
    message: "OTP send to your email!",
  });
};

const verifyOTPForChangeSettings = async (req, res) => {
  try {
    const userId = req.userToken;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Please provide user Id!",
      });
    }
    const { fullName, email, password, gender, dob, picture, Enterotp } =
      req.body;
    if (!fullName || !email || !password || !gender || !picture || !Enterotp) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and other fields are required!",
      });
    }

    const storedOtpData = await Otp.findOne({ email, otp: Enterotp });
    if (!storedOtpData) {
      return res
        .status(400)
        .json({ success: false, message: "OTP not found or expired" });
    }

    await Otp.deleteOne({ _id: storedOtpData._id });

    const salt = await bcrypt.genSalt(8);
    const hashPassword = await bcrypt.hash(password, salt);

    const updateuserInfo = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          fullName: fullName,
          password: hashPassword,
          DOB: dob || "",
          picture: picture,
          gender: gender,
        },
      },
      { new: true }
    );

    const updateUserSettings = await userSetting.findOneAndUpdate(
      { userId: userId },
      {
        $set: {
          password: password,
        },
      },
      { new: true }
    );

    if (updateuserInfo && updateUserSettings) {
      return res.status(200).json({
        success: true,
        message: "User info and their settings updated successfully!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error: error.message,
    });
  }
};

const addAdditionalInfo = async (req, res) => {
  try {
    const { picture, DOB, gender, userName } = req.body;
    if (!picture || !DOB || !gender) {
      return res.status(400).json({
        success: false,
        message: "Picture, DOB and other fields are required!",
      });
    }
    const updateUserInfo = await User.findOneAndUpdate(
      {
        userName: userName,
      },
      { $set: { picture: picture, DOB: DOB, gender: gender } },
      { new: true }
    );
    if (updateUserInfo) {
      return res.status(200).json({
        success: true,
        message: "User Info updated successfully!",
        id: updateUserInfo._id,
        userName: updateUserInfo.userName,
        updatedUserInfo: updateUserInfo,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error: error.message,
    });
  }
};
const skipAdditionalInfo = async (req, res) => {
  try {
    const { picture, userName } = req.body;
    if (!picture) {
      return res.status(400).json({
        success: false,
        message: "Picture fields is required!",
      });
    }
    const updateUserInfo = await User.findOneAndUpdate(
      {
        userName: userName,
      },
      { $set: { picture: picture } },
      { new: true }
    );
    if (updateUserInfo) {
      return res.status(200).json({
        success: true,
        message: "User Info updated successfully!",
        id: updateUserInfo._id,
        userName: updateUserInfo.userName,
        updatedUserInfo: updateUserInfo,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error: error.message,
    });
  }
};

// ENDPOINT: Check UserName already Exists or not
const chkUNameAlreadyTaken = async (req, res) => {
  try {
    const { userName } = req.body;
    if (!userName) {
      return res.status(400).json({
        success: false,
        message: "Username field is required!",
      });
    }
    const isUNameAlreadyTaken = await User.findOne({ userName });
    if (isUNameAlreadyTaken) {
      return res.status(400).json({
        success: false,
        message: "Username is already taken!",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Yes you are allowed to use this userName!",
      });
    }
  } catch {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

// ENDPOINT: User Login
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Both email and password are required to login!",
      });
    }

    const isEmailExist = await User.findOne({ email });
    if (!isEmailExist) {
      return res.status(404).json({
        success: false,
        message: "Email or Password is Invalid!",
      });
    }

    const comparePassword = await bcrypt.compare(
      password,
      isEmailExist.password
    );
    if (!comparePassword) {
      return res.status(401).json({
        success: false,
        message: "Email or Password is Invalid!",
      });
    }

    const userToken = {
      id: isEmailExist._id,
    };
    const token = jwt.sign(userToken, process.env.JWT_SECRET, {
      expiresIn: "10 days",
    });

    return res.status(200).json({
      success: true,
      message: "User Login Successful!",
      id: isEmailExist._id,
      fullName: isEmailExist.fullName,
      userName: isEmailExist.userName,
      email: isEmailExist.email,
      DOB: isEmailExist.DOB,
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// ENDPOINT: Follow/Unfollow User And also update followers List
const followUser = async (req, res) => {
  try {
    const { user } = req.body;
    const { userId } = req.params;

    if (!userId || !user) {
      return res.status(400).json({
        success: false,
        message: "Both userId and user to follow are required!",
      });
    }

    const userWhoFollowedaUser = await User.findOne({ _id: userId });
    if (!userWhoFollowedaUser) {
      return res.status(404).json({
        success: false,
        message: "Id of User who want to follow an user not found!",
      });
    }

    const fetchFollowUserData = await User.findOne({ _id: user });
    if (!fetchFollowUserData) {
      return res.status(404).json({
        success: false,
        message: "User Id not found which you want to follow!",
      });
    }

    const isAlreadyFollow = await UserFollowings.findOne({
      userId: userId,
      "followingList.userName": fetchFollowUserData.userName,
    });

    if (isAlreadyFollow) {
      const unfollowUser = await UserFollowings.findOneAndUpdate(
        { userId: userId },
        {
          $pull: {
            followingList: {
              name: fetchFollowUserData.fullName,
              userPic: fetchFollowUserData.picture,
              userName: fetchFollowUserData.userName, // Match by userName or any unique field
            },
          },
        },
        { new: true }
      );

      if (unfollowUser) {
        // Update Follower List
        await UserFollowers.findOneAndUpdate(
          { userId: fetchFollowUserData._id },
          {
            $pull: {
              followersList: {
                name: userWhoFollowedaUser.fullName,
                userPic: userWhoFollowedaUser.picture,
                userName: userWhoFollowedaUser.userName,
              },
            },
          }
        );
        return res.status(200).json({
          success: true,
          message: "Successfully unfollowed the user.",
        });
      }
    }

    const followUser = await UserFollowings.findOneAndUpdate(
      { userId: userId }, // Find the document with the matching userId
      {
        $push: {
          followingList: {
            name: fetchFollowUserData.fullName,
            userPic: fetchFollowUserData.picture,
            userName: fetchFollowUserData.userName,
          },
        },
      },
      { new: true }
    );

    if (followUser) {
      // Update Follower List
      await UserFollowers.findOneAndUpdate(
        { userId: fetchFollowUserData._id },
        {
          $push: {
            followersList: {
              name: userWhoFollowedaUser.fullName,
              userPic: userWhoFollowedaUser.picture,
              userName: userWhoFollowedaUser.userName,
            },
          },
        }
      );
      const notificationData = await NotificationModel.create({
        user: user,
        sender: userId,
        type: "follow",
        content: `"${userWhoFollowedaUser.fullName}" has started following you.`,
        isRead: false,
      });
      return res.status(200).json({
        success: true,
        message: "Followed the user successfully!",
        notificationData,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User not found in following list!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// ENDPOINT: Check user follow to user User And also update followers List
const chkisFollowTheUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { searchedUserName } = req.body;

    if (!userId || !searchedUserName) {
      return res.status(400).json({
        success: false,
        message: "Both userId and searched userName required!",
      });
    }
    const isFollow = await UserFollowings.findOne({
      userId: userId,
      followingList: { $elemMatch: { userName: searchedUserName } },
    });
    if (isFollow) {
      return res.status(200).json({
        success: true,
        message: "Already follow",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Not follow",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// ENDPOINT: Fetch User FollowingList
const UserFollowingList = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User Id not found!",
      });
    }
    const findUserFollowing = await UserFollowings.findOne({ userId });
    const followedUserData = findUserFollowing.followingList.map(
      (user) => user.userName
    );
    const userData = await User.find({ userName: { $in: followedUserData } });
    if (findUserFollowing) {
      return res.status(200).json({
        success: true,
        followingList: findUserFollowing,
        userData,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User Id not found which you want to follow!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error,
    });
  }
};

// ENDPOINT: Fetch User FollowersList
const UserFollowersList = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User Id not found!",
      });
    }
    const findUserFollowers = await UserFollowers.findOne({ userId });
    const followeruData = findUserFollowers.followersList.map(
      (user) => user.userName
    );
    const fetchFolloweruData = await User.find({
      userName: { $in: followeruData },
    });
    if (findUserFollowers) {
      return res.status(200).json({
        success: true,
        followersList: findUserFollowers,
        fetchFolloweruData,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User Id not found which you want to follow!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};
// ENDPOINT: Fetch User Friends List
const fetchUserFriends = async (req, res) => {
  try {
    const userId = req.userToken;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }
    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const userName = userData.userName;
    if (!userName) {
      return res.status(404).json({
        success: false,
        message: "User does not have a userName.",
      });
    }
    const userFollowing = await UserFollowings.findOne({ userId });
    if (!userFollowing) {
      return res.status(404).json({
        success: false,
        message: "User followings not found.",
      });
    }
    const followingUsernames = userFollowing.followingList.map(
      (user) => user.userName
    );
    const userFollowers = await UserFollowings.find({
      "followingList.userName": userName,
      userId: { $ne: userId },
    }).populate("userId", "fullName userName email picture");
    const mutualFriends = userFollowers.filter((user) => {
      return (
        user.userId &&
        user.userId.userName &&
        followingUsernames.includes(user.userId.userName)
      );
    });

    return res.status(200).json({
      success: true,
      message: "Fetched user friends successfully!",
      friends: mutualFriends,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching mutual friends.",
      error: error.message,
    });
  }
};

// ENDPOINT: Update User Setting
const getUserSetting = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(401)
        .json({ success: false, message: "Access Denied, Not Allowed!" });
    }
    const findUserSetting = await userSetting.findOne({ userId: id });
    if (!findUserSetting) {
      return res
        .status(404)
        .json({ success: false, message: "Setting Id not found!" });
    }
    const moreUserDetails = await User.findById(id);
    if (findUserSetting) {
      return res.status(200).json({
        success: true,
        message: "Fetch User Settings Successfully!",
        settings: findUserSetting,
        moreUserDetails,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error: error.message,
    });
  }
};

// ENDPOINT: Update User Setting
const updateUserSetting = async (req, res) => {
  let updateSetting = {};

  const { id } = req.params;
  if (!id) {
    return res
      .status(401)
      .json({ success: false, message: "Access Denied, Not Allowed!" });
  }
  const findUserSetting = await userSetting.findOne({ userId: id });
  if (!findUserSetting) {
    return res
      .status(404)
      .json({ success: false, message: "Setting Id not found!" });
  }

  const { userName, password, accountType, theme } = req.body;

  if (userName) {
    updateSetting.userName = userName;
    await User.findByIdAndUpdate(
      {
        _id: req.userToken,
      },
      {
        $set: {
          userName: userName,
        },
      },
      {
        new: true,
      }
    );
  }

  if (password) {
    updateSetting.password = password;
    const salt = await bcrypt.genSalt(8);
    const hashPass = await bcrypt.hash(password, salt);
    await User.findByIdAndUpdate(
      {
        _id: req.userToken,
      },
      {
        $set: {
          password: hashPass,
        },
      },
      {
        new: true,
      }
    );
  }

  if (accountType) {
    updateSetting.accountType = accountType;
  }
  if (theme) {
    updateSetting.theme = theme;
  }

  const updateUSetting = await userSetting.findOneAndUpdate(
    { userId: id },
    {
      $set: updateSetting,
    },
    { new: true }
  );
  if (updateUSetting) {
    return res.status(200).json({
      success: true,
      message: "User Settings Updated Successfully!",
    });
  }
};

// ENDPOINT: Delete User Account
const deleteUserAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User Id not found!",
      });
    }
    const findUser = await User.findById({ _id: userId });
    if (!findUser) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. Invalid user Id!",
      });
    }
    const deleteUser = await User.findByIdAndDelete({
      _id: userId,
    });
    await UserFollowings.findOneAndDelete({ userId: userId });
    await UserFollowers.findOneAndDelete({ userId: userId });
    await userSetting.findOneAndDelete({ userId: userId });
    await blockUsers.findOneAndDelete({ userId: userId });
    await postSchema.findOneAndDelete({ userId: userId });

    if (deleteUser) {
      return res.status(200).json({
        success: true,
        message: "User deleted successfully!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// ENDPOINT: Block/Unblock User
const blockUser = async (req, res) => {
  try {
    const { blockUserId } = req.body;
    if (!blockUserId) {
      return res.status(404).json({
        success: false,
        message: "Block user Id not found!",
      });
    }

    const userId = req.userToken;
    if (!userId) {
      return res.status(400).json({
        success: "false",
        message: "User who want to block the user their id not provided!",
      });
    }

    const getBlockUserData = await User.findById(blockUserId).select(
      "fullName picture"
    );
    if (!getBlockUserData) {
      return res.status(400).json({
        success: "false",
        message: "Failed to get block user data!",
      });
    }

    const isAlreadyBlock = await blockUsers.findOne({
      userId: userId,
      "blockUsers.user": blockUserId,
    });
    if (isAlreadyBlock) {
      const unBlockTheUser = await blockUsers.findOneAndUpdate(
        { userId: userId },
        {
          $pull: {
            blockUsers: {
              user: blockUserId,
              name: getBlockUserData.fullName,
              picture: getBlockUserData.picture,
            },
          },
        },
        { new: true }
      );
      if (unBlockTheUser) {
        return res.status(200).json({
          success: true,
          message: "Unblock the user successfully!",
          updatedBlockList: unBlockTheUser,
        });
      }
    }

    const blockTheUser = await blockUsers.findOneAndUpdate(
      { userId: userId },
      {
        $push: {
          blockUsers: {
            user: blockUserId,
            name: getBlockUserData.fullName,
            picture: getBlockUserData.picture,
          },
        },
      },
      { new: true }
    );
    if (blockTheUser) {
      return res.status(200).json({
        success: true,
        message: "Block the user successfully!",
        updatedBlockList: blockTheUser,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

//  ENDPOINT: Get Block Users
const getBlockUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User Id not found!",
      });
    }
    const getBlockUser = await blockUsers.findOne({ userId: userId });
    if (!getBlockUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid user Id !",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Get block users successfully!",
      blockUsers: getBlockUser.blockUsers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

// ENDPOINT: Search User
const searchUser = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { fullName: { $regex: req.query.search, $options: "i" } },
          { userName: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : "";
  const searchuser = await User.find(keyword).select("-password");

  const results = searchuser.filter(
    (user) => user._id.toString() !== req.userToken
  );

  if (searchuser.length === 0) {
    return res.status(404).json({ success: false, message: "User not Found!" });
  }
  return res.status(200).json({
    success: true,
    userData: results,
  });
};

// ENDPOINT: User Profile
const userProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const userInfo = await User.findOne({ _id: userId });
    if (!userInfo) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId!",
      });
    }
    const getUPic = await User.findOne({ _id: userId }).select(
      "picture fullName userName profileCoverPic"
    );
    const getUserposts = await postSchema
      .find({ userId: userId })
      .sort({ createdAt: -1 });

    const getUserFollowers = await UserFollowers.findOne({
      userId: userId,
    }).select("followersList");
    const getUserFollowing = await UserFollowings.findOne({
      userId: userId,
    }).select("followingList");

    return res.status(200).json({
      success: true,
      message: "Fetch user profile successfully!",
      uPic: getUPic.picture,
      profileCoverPic: getUPic.profileCoverPic,
      uFullname: getUPic.fullName,
      uUsername: getUPic.userName,
      uPosts: getUserposts,
      uFollowers: getUserFollowers,
      uFollowing: getUserFollowing,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

// ENDPOINT: FetchUser Insights
const userInsights = async (req, res) => {
  try {
    const { userId } = req.params;
    const userInfo = await User.findOne({ _id: userId });
    if (!userInfo) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId!",
      });
    }
    const findULikes = await likeModel.find({ author: userId });
    const findUComments = await commentModel.find({ author: userId });
    const allLikes = findULikes.flatMap((post) => post.likes);
    const allComments = findUComments.flatMap((post) => post.comments);
    const allJoinedGroups = await GroupConversation.find({
      participants: { $in: [userId] },
    });

    return res.status(200).json({
      success: true,
      message: "Fetch user Insights Successfully!",
      allLikes,
      allComments,
      allJoinedGroups,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

// ENDPOINT: Show suggest to user
const showSuggestion = async (req, res) => {
  try {
    const userId = req.userToken;
    const fetchUserFollowing = await UserFollowings.findOne({ userId });
    const followedUsernames = fetchUserFollowing.followingList.map(
      (user) => user.userName
    );
    const users = await User.find({
      _id: { $ne: userId },
      userName: { $nin: followedUsernames },
    });

    return res.status(200).json({
      success: true,
      message: "Fetch all users successfully!",
      suggestion: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

// ENDPOINT: Searched User Profile
const searchedUserProfile = async (req, res) => {
  try {
    const userId = req.userToken;
    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "Your user id not found!!",
      });
    }
    const { searchUserId } = req.params;
    if (!searchUserId) {
      return res.status(404).json({
        success: false,
        message: "User id not found which you want to search!",
      });
    }

    const findSearchedUser = await User.findOne({ _id: searchUserId });
    if (!findSearchedUser) {
      return res.status(400).json({
        success: false,
        message: "User not found in database!",
      });
    }

    const fetchsearchedUserFollowing = await UserFollowings.findOne({
      userId: findSearchedUser._id,
    }).select("followingList");
    const fetchsearchedUserFollowers = await UserFollowers.findOne({
      userId: findSearchedUser._id,
    }).select("followersList");
    const fetchsearchedUserPosts = await postSchema.find({
      userId: findSearchedUser._id,
    });

    return res.status(200).json({
      success: true,
      message: "Fetch searched user data successfully!",
      userCredentials: findSearchedUser,
      followingList: fetchsearchedUserFollowing,
      followersList: fetchsearchedUserFollowers,
      posts: fetchsearchedUserPosts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

// ENDPOINT: Searched User Profile
const searchedUserCred = async (req, res) => {
  try {
    const userId = req.userToken;
    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "Your user id not found!!",
      });
    }
    const { searchUserId } = req.params;
    if (!searchUserId) {
      return res.status(404).json({
        success: false,
        message: "User id not found which you want to search!",
      });
    }
    const findSearchedUser = await User.findOne({ _id: searchUserId });
    if (!findSearchedUser) {
      return res.status(400).json({
        success: false,
        message: "User not found in database!",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Fetch searched user data successfully!",
      userCredentials: findSearchedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

// ENDPOINT: Update Profile Cover
const updateProfileCover = async (req, res) => {
  try {
    const userId = req.userToken;
    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User Id not found!",
      });
    }
    const profileCover = req.body.profileCover;
    if (!profileCover) {
      return res.status(400).json({
        success: false,
        message: "Please provide profile cover picture!",
      });
    }
    const updatePCover = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          profileCoverPic: profileCover,
        },
      },
      { new: true }
    );
    if (updatePCover) {
      return res.status(200).json({
        success: true,
        message: "Update user profile cover successfully!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

const sendMailFuncForFogotPassword = async (email, otp) => {
  const transporter = nodeMailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const MailOption = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Password Reset with OTP",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4CAF50; text-align: center; font-size: 24px;">Vividly Password Reset</h1>
        <p style="font-size: 16px; margin-bottom: 20px;">
          Dear User,
        </p>
        <p style="font-size: 16px; margin-bottom: 20px;">
          You recently requested to reset your account password. To proceed, please use the following One-Time Password (OTP):
        </p>
        <p style="font-size: 28px; color: #FF5722; font-weight: bold; text-align: center; margin: 20px 0;">
          ${otp}
        </p>
        <p style="font-size: 16px; margin-bottom: 20px;">
          This OTP is valid for the next <strong>60 minutes</strong>. Please do not share this code with anyone to ensure the security of your account.
        </p>
        <p style="font-size: 16px; margin-bottom: 20px;">
          If you did not request this change, you can safely ignore this email. No changes will be made to your account.
        </p>
        <p style="font-size: 16px; margin-top: 30px;">
          Thank you for choosing <strong>Vividly</strong>!<br />
          <span style="color: #888;">The Vividly Team</span>
        </p>
        <footer style="font-size: 12px; color: #888; text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px;">
          This is an automated email. Please do not reply.
        </footer>
      </div>
    `,
  };
  await transporter.sendMail(MailOption);
};

// ENDPOINT: Update Profile Cover
const handleForgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please provide email!",
    });
  }

  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    return res.status(400).json({
      success: false,
      message: "Invalid email!",
    });
  }

  const otp = generateOtp();
  const expireTime = Date.now() + 3600 * 1000;
  await Otp.create({ email, otp, expiryTime: expireTime });
  sendMailFuncForFogotPassword(email, otp);
  return res.status(200).json({
    success: true,
    message: "OTP send to your email!",
  });
};

const verifyOTPForFogotPass = async (req, res) => {
  try {
    const { password, email, Enterotp } = req.body;
    if (!password || !email || !Enterotp) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and other fields are required!",
      });
    }

    const findUser = await User.findOne({ email: email });

    const storedOtpData = await Otp.findOne({ email, otp: Enterotp });
    if (!storedOtpData) {
      return res
        .status(400)
        .json({ success: false, message: "OTP not found or expired" });
    }

    await Otp.deleteOne({ _id: storedOtpData._id });

    const salt = await bcrypt.genSalt(8);
    const hashPassword = await bcrypt.hash(password, salt);

    const updateuserInfo = await User.findByIdAndUpdate(
      findUser._id,
      {
        $set: {
          password: hashPassword,
        },
      },
      { new: true }
    );

    const updateUserSettingsPass = await userSetting.findOneAndUpdate(
      { userId: findUser._id },
      {
        $set: {
          password: password,
        },
      },
      { new: true }
    );

    if (updateuserInfo && updateUserSettingsPass) {
      return res.status(200).json({
        success: true,
        message: "User password updated successfully!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error: error.message,
    });
  }
};

const removeFollower = async (req, res) => {
  try {
    const userId = req.userToken;
    const { followerUserName, myUserName } = req.body;

    if (!followerUserName || !myUserName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    const followerUid = await User.findOne({
      userName: followerUserName,
    });

    const updateFollowerFollowing = await UserFollowings.findOneAndUpdate(
      { userId: followerUid._id },
      {
        $pull: {
          followingList: { userName: myUserName },
        },
      },
      { new: true }
    );

    const updatedUserFollowers = await UserFollowers.findOneAndUpdate(
      { userId: userId },
      {
        $pull: {
          followersList: { userName: followerUserName },
        },
      },
      { new: true }
    );

    if (updatedUserFollowers && updateFollowerFollowing) {
      return res.status(200).json({
        success: true,
        message: "Follower removed successfully!",
        updatedUserFollowers,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User or follower not found!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while removing follower!",
      error: error.message,
    });
  }
};

const changeTheme = async (req, res) => {
  try {
    const userId = req.userToken;
    const findUSetting = await userSetting.findOne({ userId: userId });
    if (!findUSetting) {
      return res.status(400).json({
        success: false,
        message: "User settings not found!",
      });
    }
    let theme;
    if (findUSetting.theme == "light") {
      theme = "dark";
    } else if (findUSetting.theme == "dark") {
      theme = "light";
    }

    const updateTheme = await userSetting.findOneAndUpdate(
      {
        userId: userId,
      },
      {
        $set: {
          theme: theme,
        },
      },
      {
        new: true,
      }
    );
    if (updateTheme) {
      return res.status(200).json({
        success: true,
        message: "Update theme successfully!",
        updateTheme,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while changing theme!",
      error: error.message,
    });
  }
};

const fetchAllUsers = async (req, res) => {
  try {
    const userId = req.userToken;
    const fetchAllUsers = await User.find({ _id: { $ne: userId } });
    return res.status(200).json({
      success: true,
      message: "true",
      allUsers: fetchAllUsers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error fetch all users!",
      error: error.message,
    });
  }
};

module.exports = {
  userSignup,
  verifyOtp,
  userLogin,
  addAdditionalInfo,
  skipAdditionalInfo,
  chkUNameAlreadyTaken,
  UserFollowingList,
  UserFollowersList,
  followUser,
  updateUserSetting,
  deleteUserAccount,
  blockUser,
  searchUser,
  getUserSetting,
  getBlockUsers,
  userProfile,
  showSuggestion,
  userInsights,
  searchedUserProfile,
  chkisFollowTheUser,
  fetchUserFriends,
  updateProfileCover,
  updateUserSettings,
  verifyOTPForChangeSettings,
  handleForgotPassword,
  verifyOTPForFogotPass,
  searchedUserCred,
  removeFollower,
  changeTheme,
  fetchAllUsers,
};
