import React, { useRef, useState } from "react";

const HelpCenter = () => {
  const inputRef = useRef(null);
  const theme = JSON.parse(localStorage.getItem("theme"));

  const [faqs, setFaqs] = useState([
    {
      question: "How do I reset my password?",
      answer:
        "Navigate to Account Settings, click the edit icon, and a modal will open. From there, select a new password.",
      open: false,
    },
    {
      question: "How can I change the theme?",
      answer:
        "Go to Account Settings. In General Settings, there is a button to change the theme.",
      open: false,
    },
    {
      question: "How do I customize my profile?",
      answer:
        "Visit your profile page and click 'Edit Profile' to update your details and settings.",
      open: false,
    },
    {
      question: "What is the Dashboard?",
      answer:
        "The Dashboard provides insights about your activity, including total comments, likes, shares, and other user interactions.",
      open: false,
    },
    {
      question:
        "How does the post algorithm work for showing posts on the Explore page?",
      answer:
        "The Explore page algorithm prioritizes posts based on engagement scores, which are calculated using likes, comments, shares, and views.",
      open: false,
    },
    {
      question: "How do notifications work?",
      answer:
        "You receive notifications for likes, comments, follows, and messages. You can manage your notification preferences in Account Settings.",
      open: false,
    },
  ]);

  const [filteredFaqs, setFilteredFaqs] = useState(false);
  const handleSearchFAQ = () => {
    const query = inputRef.current.value.toLowerCase();
    setFilteredFaqs(
      faqs.filter((faq) => faq.question.toLowerCase().includes(query))
    );
  };

  const toggleFaq = (index) => {
    setFaqs(
      faqs.map((faq, i) =>
        i === index ? { ...faq, open: !faq.open } : { ...faq, open: false }
      )
    );
  };

  const toggleFilteredFaq = (index) => {
    setFilteredFaqs(
      filteredFaqs.map((faq, i) =>
        i === index ? { ...faq, open: !faq.open } : { ...faq, open: false }
      )
    );
  };

  return (
    <div
      className={`min-h-screen sm:pl-72 sm:pt-24 mx-auto p-6 ${
        theme === "dark" ? "bg-gray-900" : "bg-white rounded-lg"
      }   shadow-md`}
    >
      <h1
        className={`text-3xl font-bold mb-6 text-center ${
          theme === "dark" ? "text-white font-bold" : "text-black"
        } `}
      >
        Help Center
      </h1>

      <div className="mb-6">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for help topics..."
          className={`w-full p-4 ${
            theme === "dark"
              ? "text-white bg-gray-800 border border-white"
              : "text-black bg-white"
          }  border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          onKeyDown={handleSearchFAQ}
        />
      </div>

      {/* FAQ Section */}
      <div className="mb-6">
        <h2
          className={`text-xl font-semibold mb-4 ${
            theme === "dark" ? "text-gray-200" : "text-black"
          } `}
        >
          Frequently Asked Questions
        </h2>

        {!filteredFaqs &&
          faqs.map((faq, index) => (
            <div key={index} className="mb-4">
              <button
                onClick={() => toggleFaq(index)}
                className={`w-full text-left p-4 ${
                  theme === "dark" ? "bg-gray-300" : "bg-gray-100"
                }  rounded-lg shadow-md focus:outline-none`}
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`${
                      theme === "dark" ? "text-black" : "text-gray-800"
                    }  font-medium`}
                  >
                    {faq.question}
                  </span>
                  <span className={`${theme === "dark" ? "text-black" : ""}`}>
                    {faq.open ? "▲" : "▼"}
                  </span>
                </div>
              </button>
              {faq.open && (
                <div
                  className={`mt-2 ${
                    theme === "dark"
                      ? "text-black p-4 bg-gray-100"
                      : "text-gray-600 p-4 bg-gray-50"
                  }  rounded-lg`}
                >
                  {faq.answer}
                </div>
              )}
            </div>
          ))}

        {filteredFaqs && (
          <>
            {filteredFaqs.map((faq, index) => (
              <div key={index} className="mb-4">
                <button
                  onClick={() => toggleFilteredFaq(index)}
                  className={`w-full text-left p-4 ${
                    theme === "dark" ? "bg-gray-300" : "bg-gray-100"
                  }  rounded-lg shadow-md focus:outline-none`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`${
                        theme === "dark" ? "text-black" : "text-gray-800"
                      } font-medium`}
                    >
                      {faq.question}
                    </span>
                    <span className={`${theme === "dark" ? "text-black" : ""}`}>
                      {faq.open ? "▲" : "▼"}
                    </span>
                  </div>
                </button>
                {faq.open && (
                  <div
                    className={`mt-2 ${
                      theme === "dark"
                        ? "text-black p-4 bg-white"
                        : "text-gray-600 p-4 bg-gray-50"
                    }  rounded-lg`}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
            {filteredFaqs.length === 0 ? (
              <p
                className={`text-xl text-center ${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                } `}
              >
                No frequently asked questions available.
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default HelpCenter;
