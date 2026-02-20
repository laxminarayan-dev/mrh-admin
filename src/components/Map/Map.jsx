"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Loader, Locate, MapPin, Store, Target } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { Button } from "../ui/button";
import { fetchShops } from "@/store/shopAPI";

/* -------------------- ICONS -------------------- */

function UserPin(color = "#2563eb", size = 36) {
  return L.divIcon({
    html: renderToStaticMarkup(
      <MapPin size={size} color="white" fill={color} strokeWidth={1.5} />,
    ),
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

function ShopPin(color = "#f97316", size = 36) {
  return L.divIcon({
    html: renderToStaticMarkup(
      <Store size={size} color="white" fill={color} strokeWidth={1.5} />,
    ),
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

/* -------------------- MAP CONTROLLER -------------------- */

function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, {
        animate: true,
        duration: 1,
      });
    }
  }, [center, zoom, map]);

  return null;
}

/* -------------------- REVERSE GEOCODE -------------------- */

export async function getStreetName(lat, lon) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/geocode/reverse-geocode?lat=${lat}&lon=${lon}`,
    );
    const data = await res.json();
    return data.display_name;
  } catch {
    return null;
  }
}

/* -------------------- MAIN COMPONENT -------------------- */

function Map({ setCoords }) {
  const watchIdRef = useRef(null);

  /* -------------------- CLICK HANDLER -------------------- */

  function ClickHandler({ setUserPos, setMapCenter }) {
    const map = useMap();

    useEffect(() => {
      const handleClick = (e) => {
        const coords = [e.latlng.lat, e.latlng.lng];
        setUserPos(coords);
        setMapCenter(coords);
        setCoords?.({ lat: e.latlng.lat, lon: e.latlng.lng });
      };

      map.on("click", handleClick);

      return () => {
        map.off("click", handleClick);
      };
    }, [map, setUserPos, setMapCenter]);

    return null;
  }

  /* Shop locations */
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    async function getShops() {
      await fetchShops().then((shops) => {
        const shopMarkers = shops.map((shop) => ({
          id: shop._id,
          name: shop.name,
          position: [
            shop.shopLocation.coordinates[1],
            shop.shopLocation.coordinates[0],
          ], // Note: GeoJSON format is [longitude, latitude]
        }));
        setMarkers(shopMarkers);
      });
    }
    getShops();
  }, []);

  useEffect(() => {
    if (markers.length > 0) {
      setMapCenter(markers[0].position);
    }
  }, [markers]);

  /* States */
  const [mapCenter, setMapCenter] = useState(markers[0]?.position || [0, 0]);
  const [mapZoom, setMapZoom] = useState(16);
  const [userPos, setUserPos] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);

  /* Icons */
  const shopIcon = ShopPin("#f97316", 28);
  const userIcon = UserPin("#2563eb", 32);

  /* -------------------- LOCATE ME -------------------- */

  function LocateMe() {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setGettingLocation?.(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (pos.coords.accuracy < 300) {
          const coords = [pos.coords.latitude, pos.coords.longitude];

          setUserPos(coords);
          setMapCenter(coords);
          setCoords?.({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          navigator.geolocation.clearWatch(watchIdRef.current);
          setGettingLocation?.(false);
        }
      },
      () => {
        alert("Enable GPS / High accuracy");
        setGettingLocation?.(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
    );
  }

  /* Cleanup */
  useEffect(() => {
    return () => {
      if (watchIdRef.current)
        navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  /* Fake loading */
  useEffect(() => {
    const timer = setTimeout(() => setMapLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  /* -------------------- UI -------------------- */

  return (
    <div className=" bg-transparent mt-4">
      {/* MAP */}
      <div className="relative h-72 w-full rounded-2xl border border-dashed border-gray-300 overflow-hidden ">
        {/* Locate button */}
        <Button
          onClick={LocateMe}
          variant="outline"
          className={"mb-2 absolute bottom-2 right-4 z-999 rounded-full"}
        >
          <Locate size={18} />
        </Button>
        {mapLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-50">
            <Loader className="animate-spin" size={24} color="#f97316" />
          </div>
        )}

        <MapContainer
          key={`main-map`}
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          attributionControl={false}
          style={{
            height: "100%",
            width: "100%",
          }}
          whenReady={() => setMapLoading(false)}
        >
          {/* Satellite layer */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="© Esri"
            maxZoom={19}
          />

          {/* Map controller */}
          <MapController center={mapCenter} zoom={mapZoom} />

          {/* Click handler */}
          <ClickHandler setUserPos={setUserPos} setMapCenter={setMapCenter} />

          {/* Shop markers */}
          {markers.map((shop) => (
            <Marker key={shop.id} position={shop.position} icon={shopIcon}>
              <Popup>
                <p className="font-medium">{shop.name}</p>
              </Popup>
            </Marker>
          ))}

          {/* User marker */}
          {userPos && (
            <Marker
              position={userPos}
              icon={userIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const pos = marker.getLatLng();
                  const coords = [pos.lat, pos.lng];

                  setUserPos(coords);
                  setMapCenter(coords);

                  console.log("Dragged to:", coords);
                },
              }}
            >
              <Popup>
                <div>
                  <p className="font-medium">Selected Location</p>
                  <p className="text-xs">
                    {userPos[0].toFixed(6)}, {userPos[1].toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <p className="text-xs text-gray-400 mt-1">
        © OpenStreetMap contributors | Leaflet
      </p>
    </div>
  );
}

export default Map;
