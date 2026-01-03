import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Plus, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function CityCard({ city, onAdd, isAdded = false, showAddButton = true, onClick }) {
  const costLabels = ["Budget", "Affordable", "Moderate", "Expensive", "Luxury"];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`group overflow-hidden border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 bg-white ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <div className="relative h-40 overflow-hidden">
          <img
            src={city.image_url || `https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&q=80`}
            alt={city.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-lg font-bold text-white">{city.name}</h3>
            <div className="flex items-center gap-1 text-white/80 text-sm">
              <MapPin className="w-3 h-3" />
              <span>{city.country}</span>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className="text-xs">
              {(function () {
                const regionLabel = city.region ? city.region.replace(/_/g, " ") : "";
                return regionLabel
                  ? regionLabel.charAt(0).toUpperCase() + regionLabel.slice(1)
                  : "Unknown";
              })()}
            </Badge>
            <div className="flex items-center gap-1">
              {Array.from({ length: city.cost_index || 3 }).map((_, i) => (
                <DollarSign key={i} className="w-3 h-3 text-green-500" />
              ))}
            </div>
          </div>
          {city.description && (
            <p className="text-slate-600 text-xs line-clamp-2 mb-3">{city.description}</p>
          )}
          {showAddButton && (
            <Button
              onClick={() => onAdd?.(city)}
              disabled={isAdded}
              className={`w-full rounded-xl ${
                isAdded 
                  ? "bg-green-50 text-green-600 border border-green-200" 
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              }`}
              size="sm"
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Added
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Trip
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}