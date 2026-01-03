import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Plus, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function ActivityCard({ activity, onAdd, isAdded = false, showAddButton = true }) {
  const categoryColors = {
    sightseeing: "bg-blue-50 text-blue-700 border-blue-200",
    food: "bg-orange-50 text-orange-700 border-orange-200",
    adventure: "bg-red-50 text-red-700 border-red-200",
    culture: "bg-purple-50 text-purple-700 border-purple-200",
    shopping: "bg-pink-50 text-pink-700 border-pink-200",
    relaxation: "bg-green-50 text-green-700 border-green-200",
    nightlife: "bg-indigo-50 text-indigo-700 border-indigo-200"
  };

  const categoryIcons = {
    sightseeing: "🏛️",
    food: "🍽️",
    adventure: "🎯",
    culture: "🎭",
    shopping: "🛍️",
    relaxation: "🧘",
    nightlife: "🌙"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
        <div className="flex">
          <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden">
            <img
              src={activity.image_url || `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80`}
              alt={activity.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <CardContent className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-slate-900 line-clamp-1">{activity.name}</h3>
                <Badge className={`₹{categoryColors[activity.category]} border text-xs flex-shrink-0`}>
                  {categoryIcons[activity.category]} {activity.category}
                </Badge>
              </div>
              {activity.description && (
                <p className="text-slate-500 text-sm line-clamp-2">{activity.description}</p>
              )}
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-sm text-slate-500">
                {activity.duration_hours && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {activity.duration_hours}h
                  </span>
                )}
                {activity.cost !== undefined && (
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <DollarSign className="w-4 h-4" />
                    {activity.cost}
                  </span>
                )}
              </div>
              {showAddButton && (
                <Button
                  onClick={() => onAdd?.(activity)}
                  disabled={isAdded}
                  size="sm"
                  className={`rounded-xl ₹{
                    isAdded 
                      ? "bg-green-50 text-green-600 border border-green-200" 
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}