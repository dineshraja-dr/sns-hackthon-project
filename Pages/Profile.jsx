import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, Camera, Save, Loader2, Map } from "lucide-react";
import { motion } from "framer-motion";
import TripCard from "../components/common/TripCard";

export default function Profile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    avatar: "",
    bio: "",
    favorite_destinations: [],
    travel_style: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setFormData({
          avatar: userData.avatar || "",
          bio: userData.bio || "",
          favorite_destinations: userData.favorite_destinations || [],
          travel_style: userData.travel_style || "",
        });
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: trips = [], isLoading: loadingTrips } = useQuery({
    queryKey: ["userTrips"],
    queryFn: () => base44.entities.Trip.list("-created_date"),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    },
  });

  const plannedTrips = trips.filter(t => t.status === "planning" || t.status === "ongoing");
  const completedTrips = trips.filter(t => t.status === "completed");

  const travelStyles = [
    { value: "budget", label: "Budget Traveler" },
    { value: "comfort", label: "Comfort Seeker" },
    { value: "luxury", label: "Luxury Explorer" },
    { value: "adventure", label: "Adventure Junkie" },
    { value: "cultural", label: "Cultural Enthusiast" },
    { value: "foodie", label: "Food Explorer" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-lg overflow-hidden mb-8">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600" />
            <CardContent className="relative px-6 pb-6">
              <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                    <AvatarImage src={formData.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-2xl">
                      {user.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-slate-900">{user.full_name || "Traveler"}</h1>
                  <p className="text-slate-500">{user.email}</p>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{trips.length}</p>
                    <p className="text-sm text-slate-500">Trips</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{completedTrips.length}</p>
                    <p className="text-sm text-slate-500">Completed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="settings">
          <TabsList className="bg-slate-100 p-1 rounded-xl mb-8">
            <TabsTrigger value="settings" className="rounded-lg px-6">
              <User className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="planned" className="rounded-lg px-6">
              <Map className="w-4 h-4 mr-2" />
              Planned ({plannedTrips.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg px-6">
              <MapPin className="w-4 h-4 mr-2" />
              Previous ({completedTrips.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Avatar URL</Label>
                  <div className="flex gap-4">
                    <Input
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="https://..."
                      className="rounded-xl"
                    />
                    <Button variant="outline" className="rounded-xl">
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself and your travel adventures..."
                    className="rounded-xl min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Travel Style</Label>
                  <Select
                    value={formData.travel_style}
                    onValueChange={(value) => setFormData({ ...formData, travel_style: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select your travel style" />
                    </SelectTrigger>
                    <SelectContent>
                      {travelStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => updateMutation.mutate(formData)}
                  disabled={updateMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planned">
            {plannedTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plannedTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} showActions={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Map className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No planned trips</h3>
                <p className="text-slate-500">Start planning your next adventure!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} showActions={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No completed trips yet</h3>
                <p className="text-slate-500">Your travel memories will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}