import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ActivityCard from "@/components/common/ActivityCard";

export default function ActivitySearch() {
  const urlParams = new URLSearchParams(window.location.search);
  const cityId = urlParams.get("cityId");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [maxBudget, setMaxBudget] = useState(500);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: () => base44.entities.Activity.list("-cost"),
  });

  const { data: selectedCity } = useQuery({
    queryKey: ["city", cityId],
    queryFn: async () => {
      if (!cityId) return null;
      const cities = await base44.entities.City.filter({ id: cityId });
      return cities[0];
    },
    enabled: !!cityId,
  });

  const filteredActivities = activities.filter(activity => {
    const matchesCity = !cityId || activity.city_id === cityId;
    const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || activity.category === categoryFilter;
    const matchesBudget = (activity.cost || 0) <= maxBudget;
    return matchesCity && matchesSearch && matchesCategory && matchesBudget;
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "sightseeing", label: "🏛️ Sightseeing" },
    { value: "food", label: "🍽️ Food & Dining" },
    { value: "adventure", label: "🎯 Adventure" },
    { value: "culture", label: "🎭 Culture" },
    { value: "shopping", label: "🛍️ Shopping" },
    { value: "relaxation", label: "🧘 Relaxation" },
    { value: "nightlife", label: "🌙 Nightlife" },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {selectedCity ? `Activities in ${selectedCity.name}` : "Discover Activities"}
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            {selectedCity 
              ? `Explore amazing experiences in ${selectedCity.name}, ${selectedCity.country}`
              : "Find amazing experiences and activities to add to your itinerary"
            }
          </p>
        </motion.div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative md:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activities..."
                className="pl-12 h-12 rounded-xl border-slate-200"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-12 rounded-xl">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Max Budget</span>
                <span className="font-medium">${maxBudget}</span>
              </div>
              <Slider
                value={[maxBudget]}
                onValueChange={([value]) => setMaxBudget(value)}
                max={500}
                step={10}
                className="py-2"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ActivityCard activity={activity} showAddButton={false} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-2xl mb-4">
              <Sparkles className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No activities found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}