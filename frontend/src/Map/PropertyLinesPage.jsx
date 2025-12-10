import { useEffect, useState } from "react"
import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
  Marker,
  useMap,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix default marker icons for bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

function SearchResultHandler({ result }) {
  const map = useMap()

  useEffect(() => {
    if (!result) return
    map.setView([result.lat, result.lon], 17)
  }, [result, map])

  return null
}

function BoundsWatcher({ onBoundsChange }) {
  const map = useMap()

  useEffect(() => {
    const handle = () => {
      const b = map.getBounds()
      onBoundsChange({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      })
    }
    map.on("moveend", handle)
    handle()
    return () => {
      map.off("moveend", handle)
    }
  }, [map, onBoundsChange])

  return null
}

function polygonAreaSqMeters(coords) {
  if (!coords || coords.length < 3) return 0
  const originShift = (2 * Math.PI * 6378137) / 2
  const project = ([lat, lng]) => {
    const mx = (lng * originShift) / 180
    const my =
      (Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) * originShift) / Math.PI
    return [mx, my]
  }
  const pts = coords.map(project)
  let area = 0
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    area += xj * yi - xi * yj
  }
  return Math.abs(area / 2)
}

export default function PropertyLinesPage() {
  const [searchText, setSearchText] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [searchResult, setSearchResult] = useState(null)
  const [searchMarker, setSearchMarker] = useState(null)
  const [viewBounds, setViewBounds] = useState(null)
  const [parcels, setParcels] = useState([])
  const [parcelsLoading, setParcelsLoading] = useState(false)
  const [parcelsError, setParcelsError] = useState("")

  async function handleSearchSubmit(e) {
    e.preventDefault()
    const query = searchText.trim()
    if (!query) return

    setSearchLoading(true)
    setSearchError("")

    try {
      const url = new URL("https://nominatim.openstreetmap.org/search")
      url.searchParams.set("format", "json")
      url.searchParams.set("q", query)
      url.searchParams.set("limit", "1")

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error(`Search failed with status ${res.status}`)
      const data = await res.json()
      if (!data || data.length === 0) {
        setSearchError("No results found for that address.")
        return
      }
      const first = data[0]
      const lat = parseFloat(first.lat)
      const lon = parseFloat(first.lon)
      const name = first.display_name || query
      setSearchResult({ lat, lon, displayName: name })
      setSearchMarker([lat, lon])
    } catch (err) {
      setSearchError(
        err?.message || "There was a problem searching. Please try again."
      )
    } finally {
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    if (!viewBounds) return
    const { north, south, east, west } = viewBounds
    const query = `[out:json][timeout:25];
    (
      way["building"](${south},${west},${north},${east});
      relation["building"](${south},${west},${north},${east});
    );
    out geom 200;`

    let cancelled = false
    const fetchParcels = async () => {
      setParcelsLoading(true)
      setParcelsError("")
      try {
        const res = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: query,
        })
        if (!res.ok) {
          throw new Error(`Parcel lookup failed (${res.status})`)
        }
        const json = await res.json()
        if (cancelled) return
        const features = (json.elements || [])
          .filter(
            (el) => Array.isArray(el.geometry) && el.geometry.length >= 3
          )
          .slice(0, 200)
          .map((el) => ({
            id: `${el.type}-${el.id}`,
            coords: el.geometry.map((g) => [g.lat, g.lon]),
            tags: el.tags || {},
          }))
        setParcels(features)
      } catch (err) {
        if (!cancelled) {
          setParcelsError(
            err?.message || "Could not load property lines for this view."
          )
        }
      } finally {
        if (!cancelled) {
          setParcelsLoading(false)
        }
      }
    }

    fetchParcels()
    return () => {
      cancelled = true
    }
  }, [viewBounds])

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-col gap-3 border-b bg-white/80 p-4 backdrop-blur dark:bg-zinc-900/80 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Structure Size Calculator</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Search an address and view building outlines. Click a polygon to
            see details.
          </p>
        </div>
        <form
          onSubmit={handleSearchSubmit}
          className="flex w-full items-center gap-2 md:w-auto"
        >
          <input
            type="text"
            placeholder="Search address..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 md:w-72 bg-white dark:bg-zinc-800 dark:border-zinc-700"
          />
          <button
            type="submit"
            disabled={searchLoading}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {searchLoading ? "Searching..." : "Search"}
          </button>
        </form>
        {searchError && (
          <div className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600">
            {searchError}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col md:flex-row">
        <div className="flex-1">
          <MapContainer
            center={[39.5, -98.35]}
            zoom={6}
            maxZoom={20}
            className="h-full w-full"
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            />
            <SearchResultHandler result={searchResult} />
            <BoundsWatcher onBoundsChange={setViewBounds} />

            {searchMarker && (
              <Marker position={searchMarker}>
                <Popup>{searchResult?.displayName || "Search result"}</Popup>
              </Marker>
            )}

            {parcels.map((feature) => {
              const areaSqM = polygonAreaSqMeters(feature.coords)
              const areaSqFt = areaSqM * 10.7639
              const title =
                feature.tags["addr:housenumber"] || feature.tags["addr:street"]
                  ? `${feature.tags["addr:housenumber"] || ""} ${
                      feature.tags["addr:street"] || ""
                    }`.trim()
                  : feature.tags.name || "Property"
              return (
                <Polygon
                  key={feature.id}
                  positions={feature.coords}
                  pathOptions={{ color: "#10b981", weight: 2, opacity: 0.8 }}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold text-emerald-600">
                        {title}
                      </div>
                      {feature.tags["addr:city"] && (
                        <div className="text-xs text-gray-600">
                          {feature.tags["addr:city"]}
                        </div>
                      )}
                      {areaSqM > 0 && (
                        <div className="mt-1 text-xs text-gray-700">
                          Area:{" "}
                          {areaSqFt.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}{" "}
                          sq ft ({areaSqM.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}{" "}
                          sqm)
                        </div>
                      )}
                      {feature.tags["building"] && (
                        <div className="text-xs text-gray-700">
                          Building: {feature.tags["building"]}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Polygon>
              )
            })}
          </MapContainer>
        </div>

        <div className="w-full border-t bg-white/80 p-4 text-sm text-gray-700 backdrop-blur dark:bg-zinc-900/80 dark:text-gray-200 md:w-72 md:border-t-0 md:border-l">
          <div className="mb-3 font-semibold">Layer status</div>
          {parcelsLoading ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-800">
              Loading property lines for this view...
            </div>
          ) : parcelsError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200">
              {parcelsError}
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100">
              Showing {parcels.length} outlines in view.
            </div>
          )}

          <div className="mt-4">
            <div className="mb-1 font-semibold">How this works</div>
            <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
              <li>Search an address to jump to it.</li>
              <li>
                The map queries public OpenStreetMap/Overpass building outlines
                in the current view.
              </li>
              <li>Pan/zoom to refresh parcels; click a polygon for details.</li>
              <li>
                Availability varies by area; some parcels may be missing if the
                data is not in OSM.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
