import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import { getIssues } from '../utils/api.js'
import MapLegend from '../components/MapLegend.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import 'leaflet/dist/leaflet.css'
import './LiveMap.css'

const STATUS_COLORS = {
  reported: '#F59F00',
  verified: '#3B5BDB',
  in_progress: '#7048E8',
  resolved_pending_verification: '#15AABF',
  resolved: '#37B24D',
}

function createMarkerIcon(status, disputed) {
  const color = STATUS_COLORS[status] || '#868E96'
  const svg = `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="${color}" />
      <circle cx="16" cy="16" r="8" fill="white" opacity="0.9"/>
      ${disputed ? '<circle cx="26" cy="6" r="6" fill="#F03E3E"/><text x="26" y="9" font-size="8" fill="white" text-anchor="middle" font-weight="bold">!</text>' : ''}
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: 'custom-marker',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  })
}

function MapEvents() {
  return null
}

export default function LiveMap() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [legendCollapsed, setLegendCollapsed] = useState(false)

  useEffect(() => {
    async function fetchIssues() {
      try {
        const data = await getIssues()
        setIssues(data.issues || data || [])
      } catch {
        setIssues([])
      } finally {
        setLoading(false)
      }
    }
    fetchIssues()
  }, [])

  function getCoords(issue) {
    if (issue.location?.coordinates) {
      return [issue.location.coordinates[1], issue.location.coordinates[0]]
    }
    if (issue.latitude && issue.longitude) {
      return [issue.latitude, issue.longitude]
    }
    return [26.8467 + (Math.random() - 0.5) * 0.05, 80.9462 + (Math.random() - 0.5) * 0.05]
  }

  return (
    <div className="live-map-page" id="live-map">
      {loading && (
        <div className="live-map-page__loading">
          <div className="spinner" />
        </div>
      )}
      <div className="live-map-page__map-wrapper">
        <MapLegend
          collapsed={legendCollapsed}
          onToggle={() => setLegendCollapsed(!legendCollapsed)}
        />
        <MapContainer
          center={[26.8467, 80.9462]}
          zoom={13}
          className="live-map-page__map"
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents />
          {issues.map((issue) => {
            const coords = getCoords(issue)
            return (
              <Marker
                key={issue._id}
                position={coords}
                icon={createMarkerIcon(issue.status, issue.disputed)}
              >
                <Popup className="custom-popup">
                  <div className="map-popup" id={`map-popup-${issue._id}`}>
                    {issue.photoUrl && (
                      <div className="map-popup__img">
                        <img
                          src={issue.photoUrl.startsWith('http') ? issue.photoUrl : `/uploads/${issue.photoUrl}`}
                          alt={issue.title || 'Issue'}
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="map-popup__content">
                      <h4 className="map-popup__title">
                        {issue.aiDescription || issue.title || issue.description || 'Civic Issue'}
                      </h4>
                      <StatusBadge status={issue.status} disputed={issue.disputed} size="sm" />
                      <Link to={`/issues/${issue._id}`} className="btn btn-primary btn-sm" style={{ marginTop: 8, width: '100%' }}>
                        View Details
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}
