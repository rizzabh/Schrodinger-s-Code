"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";

mapboxgl.accessToken = "pk.eyJ1IjoicGFuZGV5cmlzaGFiaCIsImEiOiJjbTdlbXN0YXowOWxvMnJzYzdzc2l6NmcyIn0.-yzpc5RJ5xChHtzqXZ_pQQ";

const MapComponent = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Get the user's current location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([longitude, latitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          setUserLocation([72.8777, 19.076]); // Default to Mumbai if permission denied
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setUserLocation([72.8777, 19.076]); // Default to Mumbai
    }
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || !userLocation) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: userLocation,
      zoom: 4,
    });

    mapInstance.on("load", () => {
      setMap(mapInstance);
      animateRoute(mapInstance, userLocation);
    });

    return () => mapInstance.remove();
  }, [userLocation]);

  const animateRoute = (map: mapboxgl.Map, end: [number, number]) => {
    const start: [number, number] = [77.209, 28.6139]; // New Delhi

    // Generate a smooth curve with turf.js
    const line = turf.lineString([start, end]);
    const curvedLine = turf.bezierSpline(line);

    map.addSource("route", {
      type: "geojson",
      data: curvedLine,
    });

    map.addLayer({
      id: "route-layer",
      type: "line",
      source: "route",
      paint: {
        "line-color": "#ff5500",
        "line-width": 4,
        "line-opacity": 0.8,
      },
    });

    map.addSource("point", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: start,
            },
            properties: {},
          },
        ],
      },
    });

    map.addLayer({
      id: "point-layer",
      type: "circle",
      source: "point",
      paint: {
        "circle-radius": 6,
        "circle-color": "#ff5500",
      },
    });

    let i = 0;
    const steps = 300;
    const totalLength = turf.length(curvedLine, { units: "kilometers" });

    function animateMarker() {
      if (!map.getSource("point")) return;

      const slice = turf.lineSliceAlong(
        curvedLine,
        (i / steps) * totalLength,
        ((i + 1) / steps) * totalLength,
        { units: "kilometers" }
      );

      const newPoint = slice.geometry.coordinates.slice(-1)[0];

      if (newPoint) {
        (map.getSource("point") as mapboxgl.GeoJSONSource)?.setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: newPoint,
              },
              properties: {},
            },
          ],
        });
      }

      i++;

      if (i >= steps) {
        map.removeLayer("route-layer");
        map.removeSource("route");
        return;
      }

      requestAnimationFrame(animateMarker);
    }

    animateMarker();
  };

  return <div ref={mapContainerRef} className="w-full h-screen" />;
};

export default MapComponent;
