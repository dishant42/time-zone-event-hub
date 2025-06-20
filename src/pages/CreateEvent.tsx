import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  getCurrentDateString, 
  getCurrentTimeString, 
  convertLocalInputsToUtc, 
  validateDateTime,
  formatDateTime 
} from "@/utils/timeUtils";

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  maxBookings: number;
}

const CreateEvent = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    createdBy: ""
  });
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: "1", date: "", time: "", maxBookings: 8 }
  ]);

  const addTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      date: "",
      time: "",
      maxBookings: 8
    };
    setTimeSlots([...timeSlots, newSlot]);
  };

  const removeTimeSlot = (id: string) => {
    if (timeSlots.length > 1) {
      setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    }
  };

  const updateTimeSlot = (id: string, field: keyof TimeSlot, value: string | number) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const validateForm = () => {
    if (!eventForm.title.trim()) {
      toast.error("Event title is required");
      return false;
    }
    if (!eventForm.description.trim()) {
      toast.error("Event description is required");
      return false;
    }
    if (!eventForm.createdBy.trim()) {
      toast.error("Creator name is required");
      return false;
    }

    const now = new Date();
    const currentDateStr = getCurrentDateString();
    const currentTimeStr = getCurrentTimeString();

    for (const slot of timeSlots) {
      if (!slot.date || !slot.time) {
        toast.error("All time slots must have a date and time");
        return false;
      }
      
      // Check if date/time is in the future
      if (slot.date < currentDateStr || (slot.date === currentDateStr && slot.time <= currentTimeStr)) {
        toast.error("All time slots must be in the future");
        return false;
      }

      if (slot.maxBookings < 1 || slot.maxBookings > 100) {
        toast.error("Max bookings must be between 1 and 100");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsCreating(true);

    // Convert time slots to UTC format using utility
    const formattedTimeSlots = timeSlots.map(slot => {
      const utcDateTime = convertLocalInputsToUtc(slot.date, slot.time);
      return {
        id: slot.id,
        dateTime: utcDateTime,
        maxBookings: slot.maxBookings,
        currentBookings: 0,
        bookings: []
      };
    });

    // Simulate API call
    setTimeout(() => {
      console.log("Creating event:", {
        ...eventForm,
        timeSlots: formattedTimeSlots
      });
      
      toast.success("Event created successfully!");
      setIsCreating(false);
      navigate("/");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600">Set up your event with available time slots</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Event Details */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Event Information</CardTitle>
              <CardDescription>
                Provide basic details about your event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g. Premium Networking Brunch"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Event Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event, what attendees can expect, dress code, etc."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  required
                  className="mt-1 min-h-[100px]"
                />
              </div>
              <div>
                <Label htmlFor="createdBy">Created By *</Label>
                <Input
                  id="createdBy"
                  type="text"
                  placeholder="Your name or organization"
                  value={eventForm.createdBy}
                  onChange={(e) => setEventForm({...eventForm, createdBy: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Time Slots */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Time Slots</CardTitle>
              <CardDescription>
                Add multiple time slots for your event. Times will be displayed in each user's local timezone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {timeSlots.map((slot, index) => (
                <div key={slot.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">
                      Time Slot {index + 1}
                    </h3>
                    {timeSlots.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimeSlot(slot.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`date-${slot.id}`}>Date *</Label>
                      <Input
                        id={`date-${slot.id}`}
                        type="date"
                        min={getCurrentDateString()}
                        value={slot.date}
                        onChange={(e) => updateTimeSlot(slot.id, 'date', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`time-${slot.id}`}>Time *</Label>
                      <Input
                        id={`time-${slot.id}`}
                        type="time"
                        value={slot.time}
                        onChange={(e) => updateTimeSlot(slot.id, 'time', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`maxBookings-${slot.id}`}>Max Bookings *</Label>
                      <Input
                        id={`maxBookings-${slot.id}`}
                        type="number"
                        min="1"
                        max="100"
                        value={slot.maxBookings}
                        onChange={(e) => updateTimeSlot(slot.id, 'maxBookings', parseInt(e.target.value) || 1)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  {slot.date && slot.time && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          Preview: {formatDateTime(`${slot.date}T${slot.time}`).full} at {formatDateTime(`${slot.date}T${slot.time}`).time}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTimeSlot}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Time Slot
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Link to="/" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Event
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
