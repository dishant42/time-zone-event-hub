import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/utils/timeUtils";

interface TimeSlot {
  id: string;
  dateTime: string;
  maxBookings: number;
  currentBookings: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  timeSlots: TimeSlot[];
  createdAt: string;
}

const Index = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:3000/api/events");
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();
        // Map backend slot field to frontend timeSlots
        const mapped = data.map((event: any) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          createdBy: event.createdBy, // fallback if missing
          timeSlots: (event.slots || []).map((slot: any) => ({
            id: slot.id,
            dateTime: slot.dateTime,
            maxBookings: slot.maxBookings,
            currentBookings: slot.currentBookings,
          })),
          createdAt: event.createdAt,
        }));
        setEvents(mapped);
      } catch (err: any) {
        setError(err.message || "Error fetching events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getAvailableSlots = (timeSlots: TimeSlot[]) => {
     const now = new Date();
      return timeSlots.filter(slot =>
        slot.currentBookings < slot.maxBookings &&
        new Date(slot.dateTime) > now
    ).length;
  };

  const getTotalSlots = (timeSlots: TimeSlot[]) => {
    return timeSlots.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">EventBook</h1>
              <p className="text-gray-600">Book your spot at amazing events</p>
            </div>
            <div className="flex gap-3">
              <Link to="/my-bookings">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  <Users className="h-4 w-4 mr-2" />
                  My Bookings
                </Button>
              </Link>
              <Link to="/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {events.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No events yet</h2>
            <p className="text-gray-600 mb-6">Be the first to create an event!</p>
            <Link to="/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create First Event
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Events</h2>
              <p className="text-gray-600">Discover and book amazing events happening near you</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {event.createdBy}
                      </Badge>
                      <div className="flex items-center text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {getAvailableSlots(event.timeSlots)}/{getTotalSlots(event.timeSlots)} available
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-xl leading-tight">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-gray-600 mb-4 line-clamp-3">
                      {event.description}
                    </CardDescription>
                    
                    <div className="space-y-2 mb-4">
                      {event.timeSlots.slice(0, 2).map((slot) => {
                        const formatted = formatDateTime(slot.dateTime);
                        const isAvailable = slot.currentBookings < slot.maxBookings && new Date(slot.dateTime) > new Date();
                        return (
                          <div key={slot.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-700">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{formatted.short}</span>
                            </div>
                            <Badge variant={isAvailable ? "default" : "destructive"} className="text-xs">
                              {isAvailable ? "Available" : "Full"}
                            </Badge>
                          </div>
                        );
                      })}
                      {event.timeSlots.length > 2 && (
                        <p className="text-sm text-gray-500">
                          +{event.timeSlots.length - 2} more time slots
                        </p>
                      )}
                    </div>

                    <Link to={`/event/${event.id}`}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        View Details & Book
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
