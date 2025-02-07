import React from "react";

const Subscriptions = () => {
  return (
    <div className="min-h-screen sm:pl-72 sm:pt-24 container mx-auto p-6">
      {/* Header */}
      <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="mt-2 text-lg">
          Unlock exclusive features and premium content by upgrading to a
          premium subscription.
        </p>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-800">Basic</h3>
          <p className="text-xl text-gray-500 mt-2">$9.99 / month</p>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li>Access to standard features</li>
            <li>Limited content</li>
            <li>Ads included</li>
          </ul>
          <button className="mt-6 bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 w-full">
            Subscribe
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-blue-500">
          <h3 className="text-2xl font-semibold text-gray-800">Premium</h3>
          <p className="text-xl text-gray-500 mt-2">$19.99 / month</p>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li>Access to exclusive features</li>
            <li>Ad-free experience</li>
            <li>Priority customer support</li>
            <li>Access to premium content</li>
          </ul>
          <button className="mt-6 bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 w-full">
            Buy Premium
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-800">
          <h3 className="text-2xl font-semibold text-gray-800">VIP</h3>
          <p className="text-xl text-gray-500 mt-2">$29.99 / month</p>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li>All premium features</li>
            <li>Early access to new features</li>
            <li>Exclusive VIP content</li>
            <li>Dedicated account manager</li>
          </ul>
          <button className="mt-6 bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 w-full">
            Buy VIP
          </button>
        </div>
      </div>

      {/* Premium Features Section */}
      <div className="bg-white p-6 mt-8 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold mb-4">Premium Features</h3>
        <ul className="space-y-3 text-gray-700">
          <li>Ad-free browsing</li>
          <li>Access to exclusive content</li>
          <li>Early access to new features</li>
          <li>Priority customer support</li>
          <li>Premium badge on profile</li>
        </ul>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md mt-8">
        <h2 className="text-3xl font-semibold">Unlock Premium Features Now</h2>
        <p className="mt-2 text-lg">
          Subscribe to a premium plan and get access to exclusive content and a
          better experience!
        </p>
        <button className="mt-4 bg-yellow-500 text-white py-3 px-8 rounded-lg hover:bg-yellow-600">
          Get Premium
        </button>
      </div>
    </div>
  );
};

export default Subscriptions;
