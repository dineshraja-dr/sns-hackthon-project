import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Heart, MessageCircle, MapPin, Eye, Users, Loader2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function Community() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["communityPosts"],
    queryFn: () => base44.entities.CommunityPost.list("-likes"),
  });

  const likeMutation = useMutation({
    mutationFn: async (post) => {
      await base44.entities.CommunityPost.update(post.id, { likes: (post.likes || 0) + 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
    },
  });

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (activeTab === "trending") return (b.likes || 0) - (a.likes || 0);
    if (activeTab === "recent") return new Date(b.created_date) - new Date(a.created_date);
    return 0;
  });

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-2xl mb-4">
            <Users className="w-8 h-8 text-pink-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Community</h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Get inspired by travel plans shared by fellow adventurers
          </p>
        </motion.div>

        {/* Search & Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trips or travelers..."
              className="pl-12 h-12 rounded-xl border-slate-200"
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="trending" className="rounded-lg px-6">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="recent" className="rounded-lg px-6">
                Recent
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : sortedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.cover_image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white line-clamp-1">{post.title}</h3>
                      <p className="text-white/80 text-sm">by {post.author_name || "Anonymous"}</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    {post.description && (
                      <p className="text-slate-600 text-sm line-clamp-2 mb-4">{post.description}</p>
                    )}
                    {post.destinations?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.destinations.slice(0, 3).map((dest, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            <MapPin className="w-3 h-3 mr-1" />
                            {dest}
                          </Badge>
                        ))}
                        {post.destinations.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{post.destinations.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => likeMutation.mutate(post)}
                          className="flex items-center gap-1 text-slate-500 hover:text-red-500 transition-colors"
                        >
                          <Heart className="w-5 h-5" />
                          <span className="text-sm">{post.likes || 0}</span>
                        </button>
                        <span className="flex items-center gap-1 text-slate-500">
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm">{post.comments_count || 0}</span>
                        </span>
                      </div>
                      <Link to={createPageUrl(`ItineraryView?tripId=${post.trip_id}`)}>
                        <Button variant="ghost" size="sm" className="text-blue-600">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-2xl mb-4">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No shared trips yet</h3>
            <p className="text-slate-500">Be the first to share your travel adventure!</p>
          </div>
        )}
      </div>
    </div>
  );
}