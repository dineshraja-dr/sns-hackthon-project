import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  Pencil, 
  Share2, 
  List, 
  LayoutGrid,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function ItineraryView() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get("tripId");
  const [viewMode, setViewMode] = useState("list");

  const { data: trip, isLoading: loadingTrip } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      const trips = await base44.entities.Trip.filter({ id: tripId });
      return trips[0];
    },
    enabled: !!tripId,
  });

  const { data: itinerary = [], isLoading: loadingItinerary } = useQuery({
    queryKey: ["itinerary", tripId],
    queryFn: () => base44.entities.Itinerary.filter({ trip_id: tripId }, "day_number"),
    enabled: !!tripId,
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Trip.update(tripId, { is_public: true });
      const user = await base44.auth.me();
      await base44.entities.CommunityPost.create({
        trip_id: tripId,
        author_name: user.full_name || "Traveler",
        author_email: user.email,
        title: trip.name,
        description: trip.description,
        cover_image: trip.cover_image,
        destinations: itinerary.map(d => d.city_name).filter(Boolean),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
    },
  });

  if (loadingTrip || loadingItinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const totalBudget = itinerary.reduce((sum, day) => sum + (day.budget || 0), 0);
  const totalActivities = itinerary.reduce((sum, day) => sum + (day.activities?.length || 0), 0);
  
  const budgetByDay = itinerary.map(day => ({
    name: `Day ₹{day.day_number}`,
    budget: day.budget || 0,
  }));

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden mb-8"
        >
          <div className="absolute inset-0">
            <img
              src={trip?.cover_image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"}
              alt={trip?.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
          <div className="relative p-8 md:p-12">
            <Link to={createPageUrl("MyTrips")} className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to My Trips
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{trip?.name}</h1>
            {trip?.description && (
              <p className="text-white/80 text-lg max-w-2xl mb-6">{trip?.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge className="bg-white/20 text-white border-0 py-2 px-4">
                <Calendar className="w-4 h-4 mr-2" />
                {trip?.start_date && format(new Date(trip.start_date), "MMM d")} - {trip?.end_date && format(new Date(trip.end_date), "MMM d, yyyy")}
              </Badge>
              <Badge className="bg-white/20 text-white border-0 py-2 px-4">
                <MapPin className="w-4 h-4 mr-2" />
                {new Set(itinerary.map(d => d.city_name).filter(Boolean)).size} destinations
              </Badge>
              <Badge className="bg-white/20 text-white border-0 py-2 px-4">
                <DollarSign className="w-4 h-4 mr-2" />
                ₹{totalBudget} total
              </Badge>
            </div>
            <div className="flex gap-3">
              <Link to={createPageUrl(`ItineraryBuilder?tripId=₹{tripId}`)}>
                <Button variant="secondary" className="rounded-xl">
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Itinerary
                </Button>
              </Link>
              {!trip?.is_public && (
                <Button
                  onClick={() => shareMutation.mutate()}
                  disabled={shareMutation.isPending}
                  className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl"
                >
                  {shareMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Share2 className="w-4 h-4 mr-2" />
                  )}
                  Share Trip
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Budget Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Budget</p>
                  <p className="text-3xl font-bold text-slate-900">₹{totalBudget}</p>
                </div>
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Avg. Daily Cost</p>
                  <p className="text-3xl font-bold text-slate-900">₹{itinerary.length > 0 ? Math.round(totalBudget / itinerary.length) : 0}</p>
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Activities</p>
                  <p className="text-3xl font-bold text-slate-900">{totalActivities}</p>
                </div>
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <Clock className="w-7 h-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Chart */}
        {budgetByDay.length > 0 && (
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Daily Budget Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetByDay}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="budget" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* View Mode Toggle */}
        <div className="flex justify-end mb-6">
          <div className="inline-flex items-center bg-slate-100 rounded-xl p-1">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-lg"
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-lg"
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Grid
            </Button>
          </div>
        </div>

        {/* Itinerary Days */}
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6"}>
          {itinerary.map((day, index) => (
            <motion.div
              key={day.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">
                        {day.day_number}
                      </div>
                      <div>
                        <p className="font-semibold">{format(new Date(day.date), "EEEE")}</p>
                        <p className="text-sm text-blue-100">{format(new Date(day.date), "MMMM d, yyyy")}</p>
                      </div>
                    </span>
                    {day.city_name && (
                      <Badge className="bg-white/20 border-0">
                        <MapPin className="w-3 h-3 mr-1" />
                        {day.city_name}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {day.activities?.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {day.activities.map((activity, actIndex) => (
                        <div
                          key={actIndex}
                          className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl"
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-semibold">
                            {actIndex + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{activity.name}</p>
                            {activity.notes && (
                              <p className="text-sm text-slate-500">{activity.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            {activity.time && (
                              <p className="text-sm text-slate-500">{activity.time}</p>
                            )}
                            <p className="font-semibold text-green-600">₹{activity.cost}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">No activities planned for this day</p>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-slate-500">Daily Total</span>
                    <span className="text-xl font-bold text-slate-900">₹{day.budget || 0}</span>
                  </div>

                  {day.notes && (
                    <div className="mt-4 p-4 bg-amber-50 rounded-xl">
                      <p className="text-sm text-amber-800">{day.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}