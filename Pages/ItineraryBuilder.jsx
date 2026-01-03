import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays, differenceInDays } from "date-fns";
import { Plus, Trash2, MapPin, Calendar, DollarSign, Loader2, Save, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ItineraryBuilder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get("tripId");

  const [itineraryDays, setItineraryDays] = useState([]);

  const { data: trip, isLoading: loadingTrip } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      const trips = await base44.entities.Trip.filter({ id: tripId });
      return trips[0];
    },
    enabled: !!tripId,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: () => base44.entities.City.list("-popularity"),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: () => base44.entities.Activity.list(),
  });

  const { data: existingItinerary = [] } = useQuery({
    queryKey: ["itinerary", tripId],
    queryFn: () => base44.entities.Itinerary.filter({ trip_id: tripId }, "day_number"),
    enabled: !!tripId,
  });

  useEffect(() => {
    if (trip && existingItinerary.length === 0) {
      const numDays = differenceInDays(new Date(trip.end_date), new Date(trip.start_date)) + 1;
      const days = Array.from({ length: numDays }, (_, i) => ({
        day_number: i + 1,
        date: format(addDays(new Date(trip.start_date), i), "yyyy-MM-dd"),
        city_id: "",
        city_name: "",
        activities: [],
        budget: 0,
        notes: "",
      }));
      setItineraryDays(days);
    } else if (existingItinerary.length > 0) {
      setItineraryDays(existingItinerary);
    }
  }, [trip, existingItinerary]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Delete existing itinerary items
      for (const item of existingItinerary) {
        await base44.entities.Itinerary.delete(item.id);
      }
      // Create new ones
      for (const day of itineraryDays) {
        await base44.entities.Itinerary.create({
          ...day,
          trip_id: tripId,
        });
      }
      // Update trip budget
      const totalBudget = itineraryDays.reduce((sum, day) => sum + (day.budget || 0), 0);
      await base44.entities.Trip.update(tripId, { total_budget: totalBudget });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  const updateDay = (dayIndex, field, value) => {
    setItineraryDays(prev => {
      const updated = [...prev];
      updated[dayIndex] = { ...updated[dayIndex], [field]: value };
      
      // Auto-update city name when city_id changes
      if (field === "city_id") {
        const selectedCity = cities.find(c => c.id === value);
        updated[dayIndex].city_name = selectedCity?.name || "";
      }
      
      return updated;
    });
  };

  const addActivityToDay = (dayIndex, activity) => {
    setItineraryDays(prev => {
      const updated = [...prev];
      const existingActivities = updated[dayIndex].activities || [];
      updated[dayIndex].activities = [
        ...existingActivities,
        {
          activity_id: activity.id,
          name: activity.name,
          time: "",
          cost: activity.cost || 0,
          notes: "",
        }
      ];
      updated[dayIndex].budget = (updated[dayIndex].budget || 0) + (activity.cost || 0);
      return updated;
    });
  };

  const removeActivityFromDay = (dayIndex, activityIndex) => {
    setItineraryDays(prev => {
      const updated = [...prev];
      const removedActivity = updated[dayIndex].activities[activityIndex];
      updated[dayIndex].activities = updated[dayIndex].activities.filter((_, i) => i !== activityIndex);
      updated[dayIndex].budget = (updated[dayIndex].budget || 0) - (removedActivity.cost || 0);
      return updated;
    });
  };

  const addNewSection = () => {
    const lastDay = itineraryDays[itineraryDays.length - 1];
    const newDay = {
      day_number: itineraryDays.length + 1,
      date: lastDay ? format(addDays(new Date(lastDay.date), 1), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      city_id: "",
      city_name: "",
      activities: [],
      budget: 0,
      notes: "",
    };
    setItineraryDays([...itineraryDays, newDay]);
  };

  if (loadingTrip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const cityActivities = (cityId) => activities.filter(a => a.city_id === cityId);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Build Itinerary</h1>
            <p className="text-slate-500">{trip?.name}</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl(`ItineraryView?tripId=₹{tripId}`))}
              className="rounded-xl"
            >
              Preview
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Itinerary
            </Button>
          </div>
        </motion.div>

        <AnimatePresence>
          {itineraryDays.map((day, dayIndex) => (
            <motion.div
              key={dayIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: dayIndex * 0.05 }}
            >
              <Card className="mb-6 border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Day {day.day_number} - {format(new Date(day.date), "EEEE, MMM d")}
                    </span>
                    <span className="flex items-center gap-1 text-blue-100">
                      <DollarSign className="w-4 h-4" />
                      {day.budget || 0}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">City</label>
                      <Select
                        value={day.city_id}
                        onValueChange={(value) => updateDay(dayIndex, "city_id", value)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                              <span className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                {city.name}, {city.country}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Daily Budget</label>
                      <Input
                        type="number"
                        value={day.budget}
                        onChange={(e) => updateDay(dayIndex, "budget", parseFloat(e.target.value) || 0)}
                        className="rounded-xl"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="mb-6">
                    <label className="text-sm font-medium text-slate-700 mb-3 block">Activities</label>
                    <div className="space-y-2 mb-4">
                      {day.activities?.map((activity, actIndex) => (
                        <div
                          key={actIndex}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm font-medium">
                              {actIndex + 1}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{activity.name}</p>
                              <p className="text-sm text-slate-500">₹{activity.cost}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeActivityFromDay(dayIndex, actIndex)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {day.city_id && cityActivities(day.city_id).length > 0 && (
                      <Select onValueChange={(value) => {
                        const activity = activities.find(a => a.id === value);
                        if (activity) addActivityToDay(dayIndex, activity);
                      }}>
                        <SelectTrigger className="rounded-xl border-dashed">
                          <SelectValue placeholder="+ Add activity" />
                        </SelectTrigger>
                        <SelectContent>
                          {cityActivities(day.city_id).map((activity) => (
                            <SelectItem key={activity.id} value={activity.id}>
                              {activity.name} - ₹{activity.cost}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Notes</label>
                    <Textarea
                      value={day.notes}
                      onChange={(e) => updateDay(dayIndex, "notes", e.target.value)}
                      placeholder="Add notes for this day..."
                      className="rounded-xl min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        <Button
          variant="outline"
          onClick={addNewSection}
          className="w-full rounded-xl border-dashed h-14"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Day
        </Button>
      </div>
    </div>
  );
}