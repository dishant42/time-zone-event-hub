import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Users, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatUtcInLocalTimezone, getUserTimezone, isPastDateTime } from "@/utils/timeUtils";

import TimezoneIndicator from "@/components/TimezoneIndicator";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/events/${id}`);
        if (!response.ok) throw new Error("Event not found");
        const data = await response.json();
        // Map backend slots to frontend timeSlots
        setEvent({
          id: data.id,
          title: data.title,
          description: data.description,
          createdBy: data.createdBy || "Unknown",
          timeSlots: (data.slots || []).map((slot: any) => ({
            id: slot.id,
            dateTime: slot.dateTime,
            maxBookings: slot.maxBookings,
            currentBookings: slot.currentBookings,
            bookings: slot.bookings || [],
          })),
          createdAt: data.createdAt,
        });
      } catch (err: any) {
        setError(err.message || "Error fetching event");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !event) return;
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
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          slotId: selectedSlot,
          name: bookingForm.name,
          email: bookingForm.email
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Booking failed");
      }
      toast.success("Booking confirmed! Check your email for details.");
      setSelectedSlot(null);
      setBookingForm({ name: "", email: "" });
      // Refresh event data to update bookings
      const updatedEvent = await response.json();
      setEvent(prev => prev ? {
        ...prev,
        timeSlots: (updatedEvent.slots || []).map((slot: any) => ({
          id: slot.id,
          dateTime: slot.dateTime,
          maxBookings: slot.maxBookings,
          currentBookings: slot.currentBookings,
          bookings: slot.bookings || [],
        }))
      } : prev);
    } catch (err: any) {
      toast.error(err.message || "Error booking slot");
    } finally {
      setIsBooking(false);
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!event) return null;

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
                  Created {formatUtcInLocalTimezone(event.createdAt).date}
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
            <div className="flex items-center gap-2 text-gray-600 text-sm font-normal">
              Times shown in your local timezone
              <TimezoneIndicator />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {event.timeSlots.map((slot) => {
                const formatted = formatUtcInLocalTimezone(slot.dateTime);
                const isAvailable = slot.currentBookings < slot.maxBookings;
                const isPast = isPastDateTime(slot.dateTime);
                const isSelected = selectedSlot === slot.id;
                const canSelect = isAvailable && !isPast;
                
                return (
                  <div
                    key={slot.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : canSelect 
                          ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                    onClick={() => canSelect && handleSlotSelect(slot.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center mb-1">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-semibold">{formatted.full}</span>
                        </div>
                        <div className="text-lg font-bold text-blue-600 mb-1">
                          {formatted.time}
                        </div>
                        {isPast && (
                          <div className="text-sm text-red-500 font-medium">
                            Past Event
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            isPast 
                              ? "outline" 
                              : isAvailable 
                                ? "default" 
                                : "destructive"
                          }
                          className="mb-2"
                        >
                          {isPast ? "Past" : isAvailable ? "Available" : "Full"}
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