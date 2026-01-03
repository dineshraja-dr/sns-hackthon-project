import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Map, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import TripCard from "../components/common/TripCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MyTrips() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [deleteTrip, setDeleteTrip] = useState(null);

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: () => base44.entities.Trip.list("-created_date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Trip.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      setDeleteTrip(null);
    },
  });

  const filteredTrips = trips.filter(trip => {
    if (activeTab === "all") return true;
    if (activeTab === "ongoing") return trip.status === "ongoing";
    if (activeTab === "upcoming") return trip.status === "planning";
    if (activeTab === "completed") return trip.status === "completed";
    return true;
  });

  const handleEdit = (trip) => {
    window.location.href = createPageUrl(`ItineraryBuilder?tripId=₹{trip.id}`);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Trips</h1>
            <p className="text-slate-500">Manage and view all your travel plans</p>
          </div>
          <Link to={createPageUrl("CreateTrip")}>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl px-6">
              <Plus className="w-4 h-4 mr-2" />
              Plan New Trip
            </Button>
          </Link>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-100 p-1 rounded-xl mb-8">
            <TabsTrigger value="all" className="rounded-lg px-6">All</TabsTrigger>
            <TabsTrigger value="ongoing" className="rounded-lg px-6">Ongoing</TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-lg px-6">Upcoming</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg px-6">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : filteredTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrips.map((trip, index) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TripCard
                      trip={trip}
                      onEdit={handleEdit}
                      onDelete={() => setDeleteTrip(trip)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-2xl mb-4">
                  <Map className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No trips found</h3>
                <p className="text-slate-500 mb-6">
                  {activeTab === "all" 
                    ? "Start planning your first adventure!" 
                    : `You don't have any ₹{activeTab} trips yet.`}
                </p>
                <Link to={createPageUrl("CreateTrip")}>
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Trip
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!deleteTrip} onOpenChange={() => setDeleteTrip(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTrip?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteTrip.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}