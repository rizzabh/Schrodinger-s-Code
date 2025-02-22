"use client";

import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function GdeltNewsPage() {
  const [query, setQuery] = useState("");
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasDisasterNews, setHasDisasterNews] = useState(false);

  // Disaster-related keywords
  const disasterKeywords = [
    "earthquake", "flood", "train accident", "train delay", "derailment", "tsunami", 
    "landslide", "cyclone", "hurricane", "wildfire", "storm", "disaster", "calamity"
  ];

  const fetchNews = async () => {
    if (!query) return;
    setLoading(true);
    
    const apiUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=ArtList&maxrecords=40&timespan=2week&format=json`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      const articles = data.articles || [];

      // Count disaster-related articles
      const disasterCount = articles.filter(article => 
        disasterKeywords.some(keyword => 
          article.title?.toLowerCase().includes(keyword)
        )
      ).length;

      // Only set `true` if at least 10 articles are disaster-related
      setHasDisasterNews(disasterCount >= 10);
      setNews(articles);
    } catch (error) {
      console.error("Error fetching news:", error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">GDELT News Search</h1>

      <div className="flex gap-2 mb-6">
        <Input
          className="text-white"
          type="text"
          placeholder="Enter a keyword (e.g., AI, Blockchain)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={fetchNews} disabled={loading} className="bg-slate-200">
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {loading && <p className="text-center">Fetching news...</p>}

      {hasDisasterNews && (
        <p className="text-red-500 font-semibold text-center">⚠️ 10+ Disaster-related news articles found!</p>
      )}

      <div className="space-y-4">
        {news.length > 0 ? (
          news.map((article, index) => (
            <div key={index} className="border p-4 rounded-lg shadow-md text-white">
              <h2 className="text-xl font-semibold">{article.title}</h2>
              <p className="text-gray-700">{article.source}</p>
              <a href={article.url} target="_blank" className="text-blue-500">
                Read More →
              </a>
            </div>
          ))
        ) : (
          !loading && <p className="text-center text-gray-500">No results found.</p>
        )}
      </div>
    </div>
  );
}
