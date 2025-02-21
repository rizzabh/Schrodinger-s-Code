"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = "pk.eyJ1IjoicGFuZGV5cmlzaGFiaCIsImEiOiJjbTdlbXN0YXowOWxvMnJzYzdzc2l6NmcyIn0.-yzpc5RJ5xChHtzqXZ_pQQ";

const MapComponent = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        const mapInstance = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/dark-v11",
            center: [72.8777, 19.076], // Default to Mumbai
            zoom: 4,
        });

        mapInstance.on("load", () => {
            setMap(mapInstance);
        });

        return () => mapInstance.remove();
    }, []);

    return <div ref={mapContainerRef} className="w-full h-screen" />;
};

export default MapComponent;
