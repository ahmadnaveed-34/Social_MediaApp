import React, { useEffect, useState } from "react";

const Events = () => {
  const upcomingEventsData = [
    {
      id: 1,
      name: "Tech Conference 2024",
      date: "2024-03-15",
      location: "San Francisco, CA",
      description: "A conference for tech enthusiasts.",
      image: "https://via.placeholder.com/300x200?text=Tech+Conference",
    },
    {
      id: 2,
      name: "Music Festival",
      date: "2024-06-20",
      location: "Los Angeles, CA",
      description: "The biggest music festival of the year.",
      image: "https://via.placeholder.com/300x200?text=Music+Festival",
    },
    {
      id: 3,
      name: "Networking Meet-up",
      date: "2024-05-10",
      location: "New York, NY",
      description:
        "An opportunity to connect with professionals in the industry.",
      image: "https://via.placeholder.com/300x200?text=Networking+Meetup",
    },
  ];

  const pastEventsData = [
    {
      id: 4,
      name: "Startup Pitch Event",
      date: "2023-12-10",
      location: "San Francisco, CA",
      description: "Pitching the next big startup ideas.",
      image: "https://via.placeholder.com/300x200?text=Startup+Pitch",
    },
    {
      id: 5,
      name: "Annual Charity Gala",
      date: "2023-11-05",
      location: "Los Angeles, CA",
      description: "A night of giving back and celebration.",
      image: "https://via.placeholder.com/300x200?text=Charity+Gala",
    },
  ];

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);

  useEffect(() => {
    setUpcomingEvents(upcomingEventsData);
    setPastEvents(pastEventsData);
  }, []);

  const handleRSVP = (eventId) => {
    console.log(`RSVP'd to event with ID: ${eventId}`);
  };

  return (
    <div className="min-h-screen sm:pl-72 sm:pt-24 bg-white p-6 rounded-lg shadow-md mt-4">
      <h2 className="text-3xl font-bold text-center text-black">
        Upcoming Events
      </h2>

      {/* Search Bar */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Search for events"
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Event Categories (Optional) */}
      <div className="mt-6 flex justify-between items-center">
        <div>
          <span className="text-lg font-semibold text-gray-700">
            Event Categories:
          </span>
          <button className="ml-2 text-sm text-blue-500 hover:underline">
            All
          </button>
          <button className="ml-2 text-sm text-blue-500 hover:underline">
            Tech
          </button>
          <button className="ml-2 text-sm text-blue-500 hover:underline">
            Music
          </button>
          <button className="ml-2 text-sm text-blue-500 hover:underline">
            Networking
          </button>
        </div>
        <button className="py-2 px-4 bg-blue-500 text-white rounded-lg">
          Create Event
        </button>
      </div>

      {/* Upcoming Events */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4 text-black">Upcoming Events</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="bg-gray-100 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={event.image}
                alt={event.name}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="mt-4">
                <h4 className="text-xl font-semibold text-gray-800">
                  {event.name}
                </h4>
                <p className="text-sm text-gray-500">{event.location}</p>
                <p className="mt-2 text-gray-700">{event.description}</p>
                <p className="mt-2 text-gray-500">
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <button
                  onClick={() => handleRSVP(event.id)}
                  className="mt-4 py-2 px-6 bg-blue-500 text-white rounded-lg"
                >
                  RSVP
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Events */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4 text-black">Past Events</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastEvents.map((event) => (
            <div
              key={event.id}
              className="bg-gray-100 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={event.image}
                alt={event.name}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="mt-4">
                <h4 className="text-xl font-semibold text-gray-800">
                  {event.name}
                </h4>
                <p className="text-sm text-gray-500">{event.location}</p>
                <p className="mt-2 text-gray-700">{event.description}</p>
                <p className="mt-2 text-gray-500">
                  {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;
