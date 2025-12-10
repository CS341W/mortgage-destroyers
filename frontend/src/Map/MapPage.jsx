// src/pages/MapPage.jsx
import { useEffect, useState } from "react"
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  Polygon,
  useMapEvents,
  useMap,
} from "react-leaflet"
import L from "leaflet"

import "leaflet/dist/leaflet.css"

// Fix default marker icons (Leaflet + bundlers quirk)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// Haversine formula to compute distance between two [lat, lng] points in meters
function distanceMeters(a, b) {
  const R = 6371e3 // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180

  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])

  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)

  const x =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng

  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  return R * c // meters
}

// Component that listens for clicks and adds points
function ClickHandler({ onClickLatLng }) {
  useMapEvents({
    click(e) {
      onClickLatLng([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}

// Moves the map when a search result changes
function SearchResultHandler({ result }) {
  const map = useMap()

  useEffect(() => {
    if (!result) return
    const { lat, lon } = result
    map.setView([lat, lon], 14) // zoom in on the result
  }, [result, map])

  return null
}

export default function MapPage() {
  const [mode, setMode] = useState("distance") // 'distance' or 'area'
  const [points, setPoints] = useState([])
  const [areaPoints, setAreaPoints] = useState([])
  const [searchText, setSearchText] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [searchResult, setSearchResult] = useState(null) // { lat, lon, displayName }
  const [searchMarker, setSearchMarker] = useState(null) // [lat, lng] or null
  const [recentSearches, setRecentSearches] = useState([])

  // Compute total distance in meters
  const totalMeters = points.reduce((sum, point, idx) => {
    if (idx === 0) return 0
    return sum + distanceMeters(points[idx - 1], point)
  }, 0)

  const totalKm = totalMeters / 1000
  const totalMiles = totalMeters / 1609.344

  function handleMapClick(latlng) {
    if (mode === "distance") {
      setPoints((prev) => [...prev, latlng])
    } else {
      setAreaPoints((prev) => [...prev, latlng])
    }
  }

  function handleReset() {
    setPoints([])
    setAreaPoints([])
    setSearchResult(null)
    setSearchMarker(null)
    setSearchError("")
  }

  async function handleSearchSubmit(e) {
    e.preventDefault()
    const query = searchText.trim()
    if (!query) return

    setSearchLoading(true)
    setSearchError("")
    setSearchResult(null)

    try {
      // Simple Nominatim search - good for light usage
      const url = new URL("https://nominatim.openstreetmap.org/search")
      url.searchParams.set("format", "json")
      url.searchParams.set("q", query)
      url.searchParams.set("limit", "1")

      const res = await fetch(url.toString(), {
        headers: {
          // Nominatim likes a proper Referer; browser sets it automatically
        },
      })

      if (!res.ok) {
        throw new Error(`Search failed with status ${res.status}`)
      }

      const data = await res.json()

      if (!data || data.length === 0) {
        setSearchError("No results found for that address.")
        setSearchLoading(false)
        return
      }

      const first = data[0]
      const lat = parseFloat(first.lat)
      const lon = parseFloat(first.lon)

      const name = first.display_name || query
      setSearchResult({
        lat,
        lon,
        displayName: name,
      })
      setSearchMarker([lat, lon])
      setRecentSearches((prev) => {
        const next = [
          { displayName: name, lat, lon },
          ...prev.filter((s) => s.displayName !== name),
        ].slice(0, 5)
        return next
      })
    } catch (err) {
      console.error(err)
      setSearchError("There was a problem searching. Please try again.")
    } finally {
      setSearchLoading(false)
    }
  }

  function projectToMeters([lat, lng]) {
    const originShift = (2 * Math.PI * 6378137) / 2
    const mx = (lng * originShift) / 180
    const my =
      (Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) * originShift) /
      Math.PI
    return [mx, my]
  }

  function polygonAreaSqMeters(coords) {
    if (coords.length < 3) return 0
    const pts = coords.map(projectToMeters)
    let area = 0
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i]
      const [xj, yj] = pts[j]
      area += xj * yi - xi * yj
    }
    return Math.abs(area / 2)
  }

  const areaSqMeters = polygonAreaSqMeters(areaPoints)
  const areaSqFeet = areaSqMeters * 10.7639

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <div className="flex flex-col gap-3 border-b bg-white/80 p-4 backdrop-blur dark:bg-zinc-900/80 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold">Area / Distance Calculator</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Search, drop points, and switch between distance or area modes.
            </p>
          </div>
        </div>

        {/* Address search form */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex w-full items-center gap-2 md:w-auto"
        >
          <input
            type="text"
            placeholder="Search address or place..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 md:w-72 bg-white dark:bg-zinc-800 dark:border-zinc-700"
          />
          <button
            type="submit"
            disabled={searchLoading}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {searchLoading ? "Searching..." : "Search"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
          >
            Reset
          </button>
        </form>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("distance")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              mode === "distance"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-zinc-800 dark:text-gray-100"
            }`}
          >
            Distance mode
          </button>
          <button
            type="button"
            onClick={() => setMode("area")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              mode === "area"
                ? "bg-emerald-600 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-zinc-800 dark:text-gray-100"
            }`}
          >
            Area mode
          </button>
        </div>
      </div>

      {/* Map + info */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Map */}
        <div className="flex-1">
          <MapContainer
            center={[34.0522, -118.2437]} // LA-ish default
            zoom={5}
            maxZoom={19}
            className="h-full w-full"
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
            {mode === "distance" && points.length >= 2 && (
              <Polyline positions={points} />
            )}

            {/* Polygon for area */}
            {mode === "area" && areaPoints.length >= 3 && (
              <Polygon positions={areaPoints} pathOptions={{ color: "teal" }} />
            )}

            {/* Markers on each clicked point */}
            {mode === "distance" &&
              points.map((p, idx) => (
                <Marker
                  key={`point-${idx}`}
                  position={p}
                  draggable
                  eventHandlers={{
                    dragend: (e) => {
                      const { lat, lng } = e.target.getLatLng()
                      setPoints((prev) =>
                        prev.map((pt, i) => (i === idx ? [lat, lng] : pt))
                      )
                    },
                  }}
                >
                  <Popup>Point {idx + 1}</Popup>
                </Marker>
              ))}

            {mode === "area" &&
              areaPoints.map((p, idx) => (
                <Marker
                  key={`area-${idx}`}
                  position={p}
                  draggable
                  eventHandlers={{
                    dragend: (e) => {
                      const { lat, lng } = e.target.getLatLng()
                      setAreaPoints((prev) =>
                        prev.map((pt, i) => (i === idx ? [lat, lng] : pt))
                      )
                    },
                  }}
                >
                  <Popup>Corner {idx + 1}</Popup>
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
        <div className="w-full border-t bg-white/80 p-4 backdrop-blur dark:bg-zinc-900/80 md:w-80 md:border-t-0 md:border-l">
          <h2 className="mb-2 font-semibold">Details</h2>
          {mode === "distance" ? (
            <>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                Points: <span className="font-mono">{points.length}</span>
              </p>
              <p className="text-sm">Total distance:</p>
              <p className="text-lg font-semibold">
                {totalMeters === 0
                  ? "-"
                  : `${totalKm.toFixed(2)} km (${totalMiles.toFixed(2)} mi)`}
              </p>
              <button
                type="button"
                onClick={() => setPoints((prev) => prev.slice(0, -1))}
                className="mt-3 rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-zinc-800 dark:text-gray-100"
                disabled={points.length === 0}
              >
                Undo last point
              </button>
            </>
          ) : (
            <>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                Corners: <span className="font-mono">{areaPoints.length}</span>
              </p>
              <p className="text-sm">Area:</p>
              <p className="text-lg font-semibold">
                {areaSqMeters === 0
                  ? "-"
                  : `${areaSqFeet.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })} sq ft (${areaSqMeters.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })} m²)`}
              </p>
              <button
                type="button"
                onClick={() => setAreaPoints((prev) => prev.slice(0, -1))}
                className="mt-3 rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-zinc-800 dark:text-gray-100"
                disabled={areaPoints.length === 0}
              >
                Undo last corner
              </button>
            </>
          )}

          {searchError && (
            <p className="mt-3 text-xs text-red-600">{searchError}</p>
          )}

          {searchResult && !searchError && (
            <div className="mt-3 text-xs text-gray-700 dark:text-gray-300">
              <div className="mb-1 font-semibold">Search result:</div>
              <div className="line-clamp-3">{searchResult.displayName}</div>
            </div>
          )}

          {recentSearches.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-1 text-sm font-semibold">Recent searches</h3>
              <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                {recentSearches.map((item, idx) => (
                  <li key={`${item.displayName}-${idx}`}>
                    <div className="flex items-center gap-2">
                      <button
                        className="flex-1 rounded-lg bg-gray-100 px-2 py-1 text-left hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                        onClick={() => {
                          setSearchResult({
                            lat: item.lat,
                            lon: item.lon,
                            displayName: item.displayName,
                          })
                          setSearchMarker([item.lat, item.lon])
                        }}
                      >
                        {item.displayName}
                      </button>
                      <button
                        aria-label={`Remove ${item.displayName}`}
                        className="rounded-lg bg-transparent px-2 py-1 text-gray-500 hover:text-red-600"
                        onClick={() =>
                          setRecentSearches((prev) =>
                            prev.filter((s) => s.displayName !== item.displayName)
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4">
            <h3 className="mb-1 text-sm font-semibold">Instructions</h3>
            <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
              <li> Choose Distance or Area mode.</li>
              <li> Search an address or place to jump the map there.</li>
              <li>
                 Click on the map to add points/corners; drag a marker to
                adjust.
              </li>
              <li>
                 Distance mode sums each segment; Area mode shows total square
                footage.
              </li>
              <li> Use Reset to clear everything.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
