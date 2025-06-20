import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Calendar, Clock, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, isUpcomingDateTime } from "@/utils/timeUtils";

interface Booking {
  name: string;
  email: string;
  bookedAt: string;
}

interface TimeSlot {
  id: string;
  dateTime: string;
  maxBookings: number;
  currentBookings: number;
  bookings: Booking[];
}

interface Event {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  timeSlots: TimeSlot[];
  createdAt: string;
}

interface UserBooking {
  eventId: string;
  eventTitle: string;
  eventDescription: string;
  slotDateTime: string;
  bookedAt: string;
  name: string;
}

const MyBookings = () => {
  const [email, setEmail] = useState("");
  const [userBookings, setUserBookings] = useState<UserBooking[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Mock events data - in real app this would come from API/context
  const mockEvents: Event[] = [
    {
      id: "1",
      title: "Premium Networking Brunch",
      description: "Join us for a curated networking brunch with industry leaders.",
      createdBy: "Event Manager",
      timeSlots: [
        { 
          id: "1", 
          dateTime: "2025-06-21T09:00:00Z", 
          maxBookings: 8, 
          currentBookings: 6,
          bookings: [
            { name: "John Smith", email: "john@example.com", bookedAt: "2025-06-20T10:00:00Z" },
            { name: "Sarah Johnson", email: "sarah@example.com", bookedAt: "2025-06-20T11:00:00Z" }
          ]
        },
        { 
          id: "3", 
          dateTime: "2025-06-21T14:00:00Z", 
          maxBookings: 8, 
          currentBookings: 2,
          bookings: [
            { name: "Mike Wilson", email: "mike@example.com", bookedAt: "2025-06-20T12:00:00Z" }
          ]
        }
      ],
      createdAt: "2025-06-20T08:00:00Z"
    },
    {
      id: "2",
      title: "Tech Workshop: React Advanced Patterns",
      description: "Deep dive into advanced React patterns including custom hooks.",
      createdBy: "TechCorp Training",
      timeSlots: [
        { 
          id: "5", 
          dateTime: "2025-06-23T13:00:00Z", 
          maxBookings: 12, 
          currentBookings: 8,
          bookings: [
            { name: "John Smith", email: "john@example.com", bookedAt: "2025-06-20T13:00:00Z" },
            { name: "Alex Chen", email: "alex@example.com", bookedAt: "2025-06-20T14:00:00Z" }
          ]
        }
      ],
      createdAt: "2025-06-19T10:00:00Z"
    }
  ];

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      full: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      })
    };
  };

  const searchBookings = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;
    
    setIsSearching(true);
    setHasSearched(false);

    // Simulate API call
    setTimeout(() => {
      const bookings: UserBooking[] = [];
      
      mockEvents.forEach(event => {
        event.timeSlots.forEach(slot => {
          const userBooking = slot.bookings.find(booking => 
            booking.email.toLowerCase() === email.toLowerCase()
          );
          
          if (userBooking) {
            bookings.push({
              eventId: event.id,
              eventTitle: event.title,
              eventDescription: event.description,
              slotDateTime: slot.dateTime,
              bookedAt: userBooking.bookedAt,
              name: userBooking.name
            });
          }
        });
      });

      setUserBookings(bookings);
      setIsSearching(false);
      setHasSearched(true);
    }, 800);
  };

  const isUpcomingDateTime = (dateTime: string) => {
    return new Date(dateTime) > new Date();
  };

  const upcomingBookings = userBookings.filter(booking => isUpcomingDateTime(booking.slotDateTime));
  const pastBookings = userBookings.filter(booking => !isUpcomingDateTime(booking.slotDateTime));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600">View your event booking history</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Form */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Find Your Bookings</CardTitle>
            <CardDescription>
              Enter the email address you used when booking events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={searchBookings} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="flex gap-2 mt-1">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
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
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {hasSearched && (
          <>
            {userBookings.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-16">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Bookings Found</h2>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any bookings for <strong>{email}</strong>
                  </p>
                  <p className="text-gray-500 text-sm">
                    Make sure you entered the correct email address you used when booking.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Your Bookings ({userBookings.length})
                  </h2>
                  <p className="text-gray-600">Found for {email}</p>
                </div>

                {/* Upcoming Bookings */}
                {upcomingBookings.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-green-600" />
                      Upcoming Events ({upcomingBookings.length})
                    </h3>
                    <div className="grid gap-4">
                      {upcomingBookings.map((booking, index) => {
                        const formatted = formatDateTime(booking.slotDateTime);
                        return (
                          <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md border-l-4 border-l-green-500">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  Upcoming
                                </Badge>
                                <div className="text-sm text-gray-500">
                                  Booked {new Date(booking.bookedAt).toLocaleDateString()}
                                </div>
                              </div>
                              <CardTitle className="text-lg">{booking.eventTitle}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex items-center text-gray-700">
                                  <Clock className="h-4 w-4 mr-2" />
                                  <span><strong>{formatted.full}</strong> at <strong>{formatted.time}</strong></span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                  <User className="h-4 w-4 mr-2" />
                                  <span>Booked for: <strong>{booking.name}</strong></span>
                                </div>
                                <Link to={`/event/${booking.eventId}`}>
                                  <Button variant="outline" className="w-full mt-3">
                                    View Event Details
                                  </Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Past Bookings */}
                {pastBookings.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-gray-600" />
                      Past Events ({pastBookings.length})
                    </h3>
                    <div className="grid gap-4">
                      {pastBookings.map((booking, index) => {
                        const formatted = formatDateTime(booking.slotDateTime);
                        return (
                          <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md border-l-4 border-l-gray-400">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <Badge variant="secondary">
                                  Past Event
                                </Badge>
                                <div className="text-sm text-gray-500">
                                  Booked {new Date(booking.bookedAt).toLocaleDateString()}
                                </div>
                              </div>
                              <CardTitle className="text-lg text-gray-700">{booking.eventTitle}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex items-center text-gray-600">
                                  <Clock className="h-4 w-4 mr-2" />
                                  <span>{formatted.full} at {formatted.time}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <User className="h-4 w-4 mr-2" />
                                  <span>Attended as: {booking.name}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
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
