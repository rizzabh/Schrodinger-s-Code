"use client";

import { useState, useEffect } from "react";

interface Alert {
  headline: string;
  severity: string;
  urgency: string;
  areas: string;
  instruction: string;
}

export default function NewsGrid({ city = "kandivali" }: { city?: string }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(
          `http://api.weatherapi.com/v1/alerts.json?key=0eb835a531074c58b38134810252102&q=${city}`
        );
        const data = await response.json();
        setAlerts(data.alerts?.alert || []);
      } catch (error) {
        console.error("Error fetching weather alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [city]);

  if (loading) return <p className="text-center text-gray-500">Loading Alerts...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Weather Alerts for {city}</h2>

      {alerts.length === 0 ? (
        <p className="text-center text-green-600 font-semibold">
          No News Alerts for {city} at the moment
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-red-500 transition-transform transform hover:scale-105"
            >
              <h3 className="text-lg font-bold text-red-600">{alert.headline}</h3>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Severity:</strong> {alert.severity}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Urgency:</strong> {alert.urgency}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Affected Areas:</strong> {alert.areas}
              </p>
              {alert.instruction && (
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Instructions:</strong> {alert.instruction}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
