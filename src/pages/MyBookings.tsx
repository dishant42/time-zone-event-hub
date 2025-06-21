import { useState } from "react";
import { ArrowLeft, Mail, Calendar, Clock, User, Search, TrendingUp, CheckCircle, XCircle, Clock3, BarChart3 } from "lucide-react";

interface SlotData {
  id: string;
  dateTime: string;
  maxBookings: number;
  currentBookings: number;
}

interface EventData {
  id: string;
  title: string;
  description: string;
}

interface BackendBooking {
  id: string;
  userId: string;
  slotId: string;
  eventId: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'WAITLISTED';
  bookedAt: string;
  slot: SlotData;
  event: EventData;
  isPastEvent: boolean;
  availableSpots: number;
  slotStatus: 'FULL' | 'AVAILABLE';
}

interface UserStatistics {
  total: number;
  byStatus: {
    confirmed: number;
    cancelled: number;
    waitlisted: number;
  };
  byTime: {
    upcoming: number;
    past: number;
  };
  memberSince: string;
}

interface BackendResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
    };
    bookings: BackendBooking[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

interface StatsResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      createdAt: string;
    };
    statistics: UserStatistics;
  };
}

interface UserBooking {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDescription: string;
  slotDateTime: string;
  bookedAt: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'WAITLISTED';
  isPastEvent: boolean;
  availableSpots: number;
  slotStatus: 'FULL' | 'AVAILABLE';
}

const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime);
  return {
    full: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};

const MyBookings = () => {
  const [email, setEmail] = useState("");
  const [userBookings, setUserBookings] = useState<UserBooking[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserStats = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}/stats`);
      if (response.ok) {
        const data: StatsResponse = await response.json();
        setUserStats(data.data.statistics);
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  const searchBookings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSearching(true);
    setHasSearched(false);
    setError(null);
    try {
      // Updated API endpoint to match backend
      const response = await fetch(`http://localhost:3000/api/users/email/${encodeURIComponent(email)}/bookings`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("No user found with this email address");
        }
        throw new Error("Error fetching bookings");
      }
      
      const data: BackendResponse = await response.json();
      
      // Map backend response to frontend format
      const bookings: UserBooking[] = data.data.bookings.map((booking: BackendBooking) => ({
        id: booking.id,
        eventId: booking.eventId,
        eventTitle: booking.event.title,
        eventDescription: booking.event.description,
        slotDateTime: booking.slot.dateTime,
        bookedAt: booking.bookedAt,
        status: booking.status,
        isPastEvent: booking.isPastEvent,
        availableSpots: booking.availableSpots,
        slotStatus: booking.slotStatus
      }));
      
      setUserBookings(bookings);
      setUserName(data.data.user.name || email);
      setUserId(data.data.user.id);
      
      // Fetch user statistics
      await fetchUserStats(data.data.user.id);
      
    } catch (err: any) {
      setUserBookings([]);
      setUserName("");
      setUserId("");
      setUserStats(null);
      setError(err.message || "Error fetching bookings");
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const isUpcomingDateTime = (dateTime: string) => {
    return new Date(dateTime) > new Date();
  };

  // Filter bookings by status and time
  const confirmedBookings = userBookings.filter(booking => booking.status === 'CONFIRMED');
  const upcomingBookings = confirmedBookings.filter(booking => isUpcomingDateTime(booking.slotDateTime));
  const pastBookings = confirmedBookings.filter(booking => !isUpcomingDateTime(booking.slotDateTime));
  const cancelledBookings = userBookings.filter(booking => booking.status === 'CANCELLED');
  const waitlistedBookings = userBookings.filter(booking => booking.status === 'WAITLISTED');

  const getStatusBadge = (status: string, isPast: boolean = false) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'CONFIRMED':
        return isPast ? (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Past Event</span>
        ) : (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>Confirmed</span>
        );
      case 'CANCELLED':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Cancelled</span>;
      case 'WAITLISTED':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-500`}>Waitlisted</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  const renderStatsCard = () => {
    if (!userStats) return null;

    const memberSince = new Date(userStats.memberSince).toLocaleDateString();
    const statsCards = [
      {
        title: "Total Bookings",
        value: userStats.total,
        icon: BarChart3,
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      },
      {
        title: "Confirmed",
        value: userStats.byStatus.confirmed,
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50"
      },
      {
        title: "Upcoming",
        value: userStats.byTime.upcoming,
        icon: Calendar,
        color: "text-purple-600",
        bgColor: "bg-purple-50"
      },
      {
        title: "Past Events",
        value: userStats.byTime.past,
        icon: Clock,
        color: "text-gray-600",
        bgColor: "bg-gray-50"
      },
      {
        title: "Waitlisted",
        value: userStats.byStatus.waitlisted,
        icon: Clock3,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50"
      },
      {
        title: "Cancelled",
        value: userStats.byStatus.cancelled,
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50"
      }
    ];

    return (
      <div className="mb-8 bg-white rounded-lg shadow-lg border-0 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Your Booking Statistics
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Member since {memberSince}
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statsCards.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className={`${stat.bgColor} rounded-lg p-4 text-center`}>
                  <IconComponent className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderBookingCard = (booking: UserBooking, index: number, isPast: boolean = false) => {
    const formatted = formatDateTime(booking.slotDateTime);
    const borderColor = isPast ? 'border-l-gray-400' : 
                       booking.status === 'CONFIRMED' ? 'border-l-green-500' :
                       booking.status === 'CANCELLED' ? 'border-l-red-500' : 'border-l-yellow-500';
    
    return (
      <div key={`${booking.id}-${index}`} className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 ${borderColor} overflow-hidden`}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            {getStatusBadge(booking.status, isPast)}
            <div className="text-sm text-gray-500">
              Booked {new Date(booking.bookedAt).toLocaleDateString()}
            </div>
          </div>
          <h4 className={`text-lg font-semibold mb-2 ${isPast ? 'text-gray-700' : 'text-gray-900'}`}>
            {booking.eventTitle}
          </h4>
          {booking.eventDescription && (
            <p className="text-sm text-gray-600 mb-4">
              {booking.eventDescription}
            </p>
          )}
          
          <div className="space-y-3">
            <div className={`flex items-center ${isPast ? 'text-gray-600' : 'text-gray-700'}`}>
              <Clock className="h-4 w-4 mr-2" />
              <span>
                <strong>{formatted.full}</strong> at <strong>{formatted.time}</strong>
              </span>
            </div>
            <div className={`flex items-center ${isPast ? 'text-gray-600' : 'text-gray-700'}`}>
              <User className="h-4 w-4 mr-2" />
              <span>{isPast ? 'Attended as:' : 'Booked for:'} <strong>{userName}</strong></span>
            </div>
            {booking.status === 'CONFIRMED' && !isPast && (
              <div className="flex items-center text-gray-600 text-sm">
                <span>Available spots: {booking.availableSpots} | Status: {booking.slotStatus}</span>
              </div>
            )}
            <button 
              onClick={() => window.location.href = `/event/${booking.eventId}`}
              className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              View Event Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <a href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </a>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600">View your event booking history and statistics</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="mb-8 bg-white rounded-lg shadow-lg border-0 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Find Your Bookings</h3>
            <p className="text-sm text-gray-600 mt-1">
              Enter the email address you used when booking events
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="flex gap-2 mt-1">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <button 
                    onClick={searchBookings}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {hasSearched && (
          <>
            {userBookings.length === 0 && !error ? (
              <div className="bg-white rounded-lg shadow-lg border-0 overflow-hidden">
                <div className="text-center py-16 px-6">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Bookings Found</h2>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any bookings for <strong>{email}</strong>
                  </p>
                  <p className="text-gray-500 text-sm">
                    Make sure you entered the correct email address you used when booking.
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-lg border-0 overflow-hidden">
                <div className="text-center py-16 px-6">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error</h2>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <p className="text-gray-500 text-sm">
                    Make sure you entered the correct email address you used when booking.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Your Bookings ({userBookings.length})
                  </h2>
                  <p className="text-gray-600">Found for {email}</p>
                </div>

                {/* Statistics Section */}
                {renderStatsCard()}

                {/* Upcoming Confirmed Bookings */}
                {upcomingBookings.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-green-600" />
                      Upcoming Events ({upcomingBookings.length})
                    </h3>
                    <div className="grid gap-4">
                      {upcomingBookings.map((booking, index) => renderBookingCard(booking, index, false))}
                    </div>
                  </div>
                )}

                {/* Waitlisted Bookings */}
                {waitlistedBookings.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                      Waitlisted Events ({waitlistedBookings.length})
                    </h3>
                    <div className="grid gap-4">
                      {waitlistedBookings.map((booking, index) => renderBookingCard(booking, index, false))}
                    </div>
                  </div>
                )}

                {/* Past Confirmed Bookings */}
                {pastBookings.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-gray-600" />
                      Past Events ({pastBookings.length})
                    </h3>
                    <div className="grid gap-4">
                      {pastBookings.map((booking, index) => renderBookingCard(booking, index, true))}
                    </div>
                  </div>
                )}

                {/* Cancelled Bookings */}
                {cancelledBookings.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-red-600" />
                      Cancelled Events ({cancelledBookings.length})
                    </h3>
                    <div className="grid gap-4">
                      {cancelledBookings.map((booking, index) => renderBookingCard(booking, index, false))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookings;