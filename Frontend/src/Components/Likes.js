import React, { useContext, useEffect, useState } from "react";
import vividlyContext from "../Context/vividlyContext";
import SkeletonLoader from "./SkeletonLoader";
import { useNavigate } from "react-router-dom";

const Likes = () => {
  const theme = JSON.parse(localStorage.getItem("theme"));
  const context = useContext(vividlyContext);
  const navigate = useNavigate("");
  const { fetchLikedPostsFunc, likedPosts } = context;
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [countLoading, setCountLoading] = useState(0);
  const handleShowSkeleton = async () => {
    if (countLoading === 0) {
      setShowSkeleton(true);
    }
    await fetchLikedPostsFunc();
    setCountLoading(1);
    setShowSkeleton(false);
  };

  useEffect(() => {
    handleShowSkeleton();
  }, []);

  const handleSharedPostPreview = (postId) => {
    localStorage.setItem("postPreview", JSON.stringify(postId));
    navigate("/postPreview");
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      } sm:pl-72 sm:pt-24 mx-auto p-6`}
    >
      {showSkeleton && <SkeletonLoader />}
      {!showSkeleton && (
        <>
          {/* Header */}
          <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md mb-8">
            <h1 className="text-3xl font-bold">Liked Posts</h1>
            <p className="mt-2 text-lg">
              Explore all the posts you've liked. Keep track of your favorite
              content.
            </p>
          </div>

          {/* Liked Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {likedPosts.map((post) => (
              <div
                key={post._id}
                className={`${
                  theme === "dark"
                    ? "bg-gray-800 border-t-2  border-b-2 border-gray-200"
                    : "bg-gray-50 border-b-2 border-gray-800"
                } p-4 rounded-lg  shadow-md hover:shadow-lg  transition-transform hover:scale-[103%] duration-300`}
              >
                {post.postId.mediaType === "image" ? (
                  <img
                    src={post.postId.media}
                    alt="Failed to load img"
                    className="w-full h-48 object-cover rounded-md"
                  />
                ) : (
                  <video
                    src={post.postId.media}
                    controls
                    className="w-full h-48 object-cover rounded-md"
                  />
                )}
                <div
                  className="hover:cursor-pointer"
                  onClick={() => handleSharedPostPreview(post.postId._id)}
                >
                  {post.postId.userId && (
                    <div className="flex items-center mt-4">
                      <img
                        src={post.postId.userId.picture}
                        alt="User Profile"
                        className={`w-10 h-10 rounded-full object-cover ${
                          theme === "dark"
                            ? "border-2 border-gray-300"
                            : "border-2 border-gray-800"
                        } `}
                      />

                      <p
                        className={`ml-3 text-lg font-bold ${
                          theme === "dark"
                            ? "text-gray-100 font-bold"
                            : "text-black"
                        } `}
                      >
                        {post.postId.userId.fullName}
                      </p>
                    </div>
                  )}
                  <div className="mt-4">
                    <h3
                      className={`${
                        theme === "dark"
                          ? "text-gray-200 font-bold"
                          : "text-gray-800"
                      } flex`}
                    >
                      <p className="font-semibold mr-2">Description: </p>
                      {post.postId.description}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {likedPosts.length === 0 ? (
            <p
              className={`text-2xl text-center ${
                theme === "dark" ? "text-gray-200" : "text-gray-600"
              }  mt-5`}
            >
              You haven’t liked any posts yet.
            </p>
          ) : (
            ""
          )}
        </>
      )}
    </div>
  );
};

export default Likes;
