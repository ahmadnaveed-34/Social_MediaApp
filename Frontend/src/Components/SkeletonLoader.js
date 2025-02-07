import React from "react";

const SkeletonLoader = () => {
  const theme = JSON.parse(localStorage.getItem("theme"));
  return (
    <div
      className={`w-full ${
        theme === "dark" ? "bg-gray-700" : "bg-white"
      }  shadow-lg rounded-lg overflow-hidden`}
    >
      {/* Skeleton Header */}
      <div className="animate-pulse space-y-4">
        <div
          className={`h-12 ${
            theme === "dark" ? "bg-gray-800" : "bg-gray-300"
          }  rounded-full w-3/4 mx-auto`}
        ></div>
        <div
          className={`h-4${
            theme === "dark" ? "bg-gray-800" : "bg-gray-300"
          } rounded w-1/2 mx-auto`}
        ></div>
        <div
          className={`h-3 ${
            theme === "dark" ? "bg-gray-800" : "bg-gray-300"
          }  rounded w-1/3 mx-auto`}
        ></div>
      </div>
      {/* Skeleton Image */}
      <div
        className={`h-64 ${
          theme === "dark" ? "bg-gray-800" : "bg-gray-300"
        }  animate-pulse rounded-t-lg`}
      ></div>
      {/* Skeleton Content */}
      <div className="p-4 space-y-4">
        <div
          className={`h-4 ${
            theme === "dark" ? " bg-gray-800" : " bg-gray-300"
          } rounded w-full animate-pulse`}
        ></div>
        <div
          className={`h-4 ${
            theme === "dark" ? " bg-gray-800" : " bg-gray-300"
          } rounded w-5/6 animate-pulse`}
        ></div>
        <div
          className={`h-4 ${
            theme === "dark" ? " bg-gray-800" : " bg-gray-300"
          } rounded w-3/4 animate-pulse`}
        ></div>
        <div
          className={`h-4 ${
            theme === "dark" ? " bg-gray-800" : " bg-gray-300"
          } rounded w-1/2 animate-pulse`}
        ></div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
