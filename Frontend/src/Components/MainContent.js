import React from "react";

const MainContent = ({ children }) => {
  return (
    <main className="ml-64 pt-20 p-6 bg-gray-50 min-h-screen">{children}</main>
  );
};

export default MainContent;
