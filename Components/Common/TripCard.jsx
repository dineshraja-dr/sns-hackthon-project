import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Eye, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function TripCard({ trip, onEdit, onDelete, showActions = true }) {
  const statusColors = {
    planning: "bg-amber-50 text-amber-700 border-amber-200",
    ongoing: "bg-green-50 text-green-700 border-green-200",
    completed: "bg-slate-50 text-slate-600 border-slate-200"
  };

  const defaultImage = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group overflow-hidden border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/70 transition-all duration-300 bg-white">
        <div className="relative h-48 overflow-hidden">
          <img
            src={trip.cover_image || defaultImage}
            alt={trip.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <Badge className={`absolute top-4 left-4 ₹{statusColors[trip.status]} border`}>
            {trip.status?.charAt(0).toUpperCase() + trip.status?.slice(1)}
          </Badge>
          {trip.is_public && (
            <Badge className="absolute top-4 right-4 bg-blue-500 text-white border-0">
              Public
            </Badge>
          )}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{trip.name}</h3>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Calendar className="w-4 h-4" />
              <span>
                {trip.start_date && format(new Date(trip.start_date), "MMM d")} - {trip.end_date && format(new Date(trip.end_date), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          {trip.description && (
            <p className="text-slate-600 text-sm line-clamp-2 mb-4">{trip.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{trip.cities?.length || 0} destinations</span>
            </div>
            {trip.total_budget && (
              <span className="text-blue-600 font-semibold">₹{trip.total_budget}</span>
            )}
          </div>
          {showActions && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
              <Link to={createPageUrl(`ItineraryView?tripId=₹{trip.id}`)} className="flex-1">
                <Button variant="outline" className="w-full rounded-xl" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              </Link>
              {onEdit && (
                <Button variant="ghost" size="sm" onClick={() => onEdit(trip)} className="rounded-xl">
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="sm" onClick={() => onDelete(trip)} className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}