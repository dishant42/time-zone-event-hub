
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Users, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TimeSlot {
  id: string;
  dateTime: string;
  maxBookings: number;
  currentBookings: number;
  bookings: Array<{ name: string; email: string; bookedAt: string }>;
}

interface Event {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  timeSlots: TimeSlot[];
  createdAt: string;
}

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState({ name: "", email: "" });
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      if (id === "1") {
        setEvent({
          id: "1",
          title: "Premium Networking Brunch",
          description: "Join us for a curated networking brunch with industry leaders. Enjoy gourmet bites, insightful conversations, and exclusive connections. Limited seats available. Dress code: business casual.",
          createdBy: "Event Manager",
          timeSlots: [
            { 
              id: "1", 
              dateTime: "2025-06-21T09:00:00Z", 
              maxBookings: 8, 
              currentBookings: 6,
              bookings: []
            },
            { 
              id: "2", 
              dateTime: "2025-06-21T11:00:00Z", 
              maxBookings: 8, 
              currentBookings: 8,
              bookings: []
            },
            { 
              id: "3", 
              dateTime: "2025-06-21T14:00:00Z", 
              maxBookings: 8, 
              currentBookings: 2,
              bookings: []
            },
            { 
              id: "4", 
              dateTime: "2025-06-22T10:00:00Z", 
              maxBookings: 8, 
              currentBookings: 0,
              bookings: []
            }
          ],
          createdAt: "2025-06-20T08:00:00Z"
        });
      } else if (id === "2") {
        setEvent({
          id: "2",
          title: "Tech Workshop: React Advanced Patterns",
          description: "Deep dive into advanced React patterns including custom hooks, context optimization, and performance techniques. Perfect for intermediate to advanced developers.",
          createdBy: "TechCorp Training",
          timeSlots: [
            { 
              id: "5", 
              dateTime: "2025-06-23T13:00:00Z", 
              maxBookings: 12, 
              currentBookings: 8,
              bookings: []
            },
            { 
              id: "6", 
              dateTime: "2025-06-24T13:00:00Z", 
              maxBookings: 12, 
              currentBookings: 4,
              bookings: []
            }
          ],
          createdAt: "2025-06-19T10:00:00Z"
        });
      }
      setLoading(false);
    }, 800);
  }, [id]);

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
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  };

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlot || !event) return;
    
    // Validation
    if (!bookingForm.name.trim() || !bookingForm.email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const slot = event.timeSlots.find(s => s.id === selectedSlot);
    if (!slot) return;

    if (slot.currentBookings >= slot.maxBookings) {
      toast.error("This time slot is now full");
      return;
    }

    // Check for duplicate booking
    const existingBooking = slot.bookings.find(b => b.email === bookingForm.email);
    if (existingBooking) {
      toast.error("You have already booked this time slot");
      return;
    }

    setIsBooking(true);

    // Simulate API call
    setTimeout(() => {
      // Update the event state
      setEvent(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          timeSlots: prev.timeSlots.map(s => 
            s.id === selectedSlot 
              ? {
                  ...s,
                  currentBookings: s.currentBookings + 1,
                  bookings: [...s.bookings, {
                    name: bookingForm.name,
                    email: bookingForm.email,
                    bookedAt: new Date().toISOString()
                  }]
                }
              : s
          )
        };
      });

      toast.success("Booking confirmed! Check your email for details.");
      setSelectedSlot(null);
      setBookingForm({ name: "", email: "" });
      setIsBooking(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Event Info */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start mb-4">
              <Badge variant="secondary">{event.createdBy}</Badge>
              <div className="flex items-center text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  Created {new Date(event.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <CardTitle className="text-3xl mb-2">{event.title}</CardTitle>
            <CardDescription className="text-lg text-gray-700">
              {event.description}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Available Time Slots */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Available Time Slots</CardTitle>
            <CardDescription>
              Times shown in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {event.timeSlots.map((slot) => {
                const { full, time, timezone } = formatDateTime(slot.dateTime);
                const isAvailable = slot.currentBookings < slot.maxBookings;
                const isSelected = selectedSlot === slot.id;
                
                return (
                  <div
                    key={slot.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : isAvailable 
                          ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                    onClick={() => isAvailable && handleSlotSelect(slot.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center mb-1">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-semibold">{full}</span>
                        </div>
                        <div className="text-lg font-bold text-blue-600 mb-1">
                          {time}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={isAvailable ? "default" : "destructive"}
                          className="mb-2"
                        >
                          {isAvailable ? "Available" : "Full"}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{slot.currentBookings}/{slot.maxBookings} booked</span>
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center text-blue-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span className="font-medium">Selected for booking</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        {selectedSlot && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Book Your Slot</CardTitle>
              <CardDescription>
                Complete the form below to secure your booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isBooking}
                  >
                    {isBooking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Booking...
                      </>
                    ) : (
                      "Confirm Booking"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
