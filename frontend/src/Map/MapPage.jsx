// src/pages/MapPage.jsx
import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

// Fix default marker icons (Leaflet + bundlers quirk)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Haversine formula to compute distance between two [lat, lng] points in meters
function distanceMeters(a, b) {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const x =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c; // meters
}

// Component that listens for clicks and adds points
function ClickHandler({ onClickLatLng }) {
  useMapEvents({
    click(e) {
      onClickLatLng([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

// Moves the map when a search result changes
function SearchResultHandler({ result }) {
  const map = useMap();

  useEffect(() => {
    if (!result) return;
    const { lat, lon } = result;
    map.setView([lat, lon], 14); // zoom in on the result
  }, [result, map]);

  return null;
}

export default function MapPage() {
  const [points, setPoints] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResult, setSearchResult] = useState(null); // { lat, lon, displayName }
  const [searchMarker, setSearchMarker] = useState(null); // [lat, lng] or null

  // Compute total distance in meters
  const totalMeters = points.reduce((sum, point, idx) => {
    if (idx === 0) return 0;
    return sum + distanceMeters(points[idx - 1], point);
  }, 0);

  const totalKm = totalMeters / 1000;
  const totalMiles = totalMeters / 1609.344;

  function handleMapClick(latlng) {
    setPoints((prev) => [...prev, latlng]);
  }

  function handleReset() {
    setPoints([]);
    setSearchResult(null);
    setSearchMarker(null);
    setSearchError("");
  }

  async function handleSearchSubmit(e) {
    e.preventDefault();
    const query = searchText.trim();
    if (!query) return;

    setSearchLoading(true);
    setSearchError("");
    setSearchResult(null);

    try {
      // Simple Nominatim search - good for light usage
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("format", "json");
      url.searchParams.set("q", query);
      url.searchParams.set("limit", "1");
      // Optional: include your email per their usage policy
      // url.searchParams.set("email", "youremail@example.com");

      const res = await fetch(url.toString(), {
        headers: {
          // Nominatim likes a proper Referer; browser sets it automatically
        },
      });

      if (!res.ok) {
        throw new Error(`Search failed with status ${res.status}`);
      }

      const data = await res.json();

      if (!data || data.length === 0) {
        setSearchError("No results found for that address.");
        setSearchLoading(false);
        return;
      }

      const first = data[0];
      const lat = parseFloat(first.lat);
      const lon = parseFloat(first.lon);

      setSearchResult({
        lat,
        lon,
        displayName: first.display_name || query,
      });
      setSearchMarker([lat, lon]);
    } catch (err) {
      console.error(err);
      setSearchError("There was a problem searching. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b bg-white/80 backdrop-blur dark:bg-zinc-900/80">
        <div>
          <h1 className="text-xl font-semibold">Distance Measure Map</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Click on the satellite map to add points and measure the path.
          </p>
        </div>

        {/* Address search form */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 w-full md:w-auto"
        >
          <input
            type="text"
            placeholder="Search address or place..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 md:w-72 px-3 py-1.5 rounded-lg border text-sm bg-white dark:bg-zinc-800 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={searchLoading}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {searchLoading ? "Searching..." : "Search"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600"
          >
            Reset
          </button>
        </form>
      </div>

      {/* Map + info */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Map */}
        <div className="flex-1">
          <MapContainer
            center={[34.0522, -118.2437]} // LA-ish default
            zoom={3}
            className="w-full h-full"
          >
            {/* Satellite tile layer (Esri World Imagery, free for light usage) */}
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            />

            {/* React to search result by moving the map */}
            <SearchResultHandler result={searchResult} />

            <ClickHandler onClickLatLng={handleMapClick} />

            {/* Polyline for the path */}
            {points.length >= 2 && <Polyline positions={points} />}

            {/* Markers on each clicked point */}
            {points.map((p, idx) => (
              <Marker key={`point-${idx}`} position={p}>
                <Popup>Point {idx + 1}</Popup>
              </Marker>
            ))}

            {/* Marker for search result */}
            {searchMarker && (
              <Marker position={searchMarker}>
                <Popup>
                  {searchResult?.displayName || "Search result"}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Sidebar info */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur">
          <h2 className="font-semibold mb-2">Path Details</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Points: <span className="font-mono">{points.length}</span>
          </p>
          <p className="text-sm mb-1">Total distance:</p>
          <p className="text-lg font-semibold">
            {totalMeters === 0
              ? "–"
              : `${totalKm.toFixed(2)} km (${totalMiles.toFixed(2)} mi)`}
          </p>

          {searchError && (
            <p className="mt-3 text-xs text-red-600">{searchError}</p>
          )}

          {searchResult && !searchError && (
            <div className="mt-3 text-xs text-gray-700 dark:text-gray-300">
              <div className="font-semibold mb-1">Search result:</div>
              <div className="line-clamp-3">
                {searchResult.displayName}
              </div>
            </div>
          )}

          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-1">Instructions</h3>
            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Search an address or place to jump the map there.</li>
              <li>• Click on the map to add points.</li>
              <li>• A line will connect them in order.</li>
              <li>• Distance is the sum of all segments.</li>
              <li>• Use Reset to clear everything.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
