import React from "react";

const Marketplace = () => {
  return (
    <div className="min-h-screen sm:pl-72 sm:pt-24 container mx-auto p-4">
      <h2 className="text-3xl font-semibold mb-6 text-black">Marketplace</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
        {/* Product Cards */}
        {Array(10)
          .fill("")
          .map((_, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-md">
              <img
                src={`https://via.placeholder.com/300?text=Product+${
                  index + 1
                }`}
                alt={`Product ${index + 1}`}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">Product Name</h3>
                <p className="text-gray-600">$19.99</p>
                <button className="mt-2 bg-blue-500 text-white p-2 rounded">
                  Buy Now
                </button>
              </div>
            </div>
          ))}
      </div>

      <div className="flex justify-between items-center">
        <button className="px-4 py-2 bg-blue-500 text-white rounded">
          Prev
        </button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded">
          Next
        </button>
      </div>
    </div>
  );
};

export default Marketplace;
