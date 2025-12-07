import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import { useStore } from '../store/useStore'

// Custom marker icon based on condition
const createMarkerIcon = (condition) => {
  const colors = {
    1: '#22c55e',
    2: '#84cc16',
    3: '#eab308',
    4: '#f97316',
    5: '#ef4444'
  }
  
  const color = colors[condition] || '#6b7280'
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="custom-marker" style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
        color: white;
        box-shadow: 0 4px 14px rgba(0,0,0,0.4);
      ">
        ${condition}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  })
}

// Resource type icons
const typeIcons = {
  'озеро': '🏞️',
  'канал': '🌊',
  'водохранилище': '💧',
  'шлюз': '🚢',
  'гидроузел': '⚙️',
  'плотина': '🏗️'
}

function MapController() {
  const map = useMap()
  const { mapCenter, mapZoom, selectedObject } = useStore()
  
  useEffect(() => {
    if (selectedObject) {
      map.flyTo([selectedObject.latitude, selectedObject.longitude], 10, {
        duration: 1
      })
    }
  }, [selectedObject])
  
  return null
}

function ClusterLayer({ objects, onObjectClick }) {
  const map = useMap()
  const clusterGroupRef = useRef(null)
  
  useEffect(() => {
    if (!map) return
    
    // Remove existing cluster group
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current)
    }
    
    // Create new cluster group
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount()
        let size = 'small'
        if (count > 10) size = 'medium'
        if (count > 25) size = 'large'
        
        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster marker-cluster-${size}`,
          iconSize: L.point(40, 40)
        })
      }
    })
    
    // Add markers to cluster
    objects.forEach(obj => {
      const marker = L.marker([obj.latitude, obj.longitude], {
        icon: createMarkerIcon(obj.technical_condition)
      })
      
      marker.bindPopup(`
        <div style="min-width: 200px; padding: 8px;">
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
            ${typeIcons[obj.resource_type] || '📍'} ${obj.name}
          </div>
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">
            ${obj.region}
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <span style="
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 11px;
              background: ${obj.technical_condition >= 4 ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'};
              color: ${obj.technical_condition >= 4 ? '#fca5a5' : '#86efac'};
            ">
              Состояние: ${obj.technical_condition}
            </span>
            <span style="
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 11px;
              background: rgba(56,189,248,0.2);
              color: #7dd3fc;
            ">
              ${obj.resource_type}
            </span>
          </div>
        </div>
      `)
      
      marker.on('click', () => {
        onObjectClick(obj)
      })
      
      clusterGroup.addLayer(marker)
    })
    
    map.addLayer(clusterGroup)
    clusterGroupRef.current = clusterGroup
    
    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current)
      }
    }
  }, [map, objects])
  
  return null
}

export default function Map() {
  const { filteredObjects, setSelectedObject } = useStore()

  return (
    <MapContainer
      center={[48.0, 68.0]}
      zoom={5}
      className="w-full h-full"
      zoomControl={true}
      dragging={true}
      scrollWheelZoom={true}
      doubleClickZoom={true}
      touchZoom={true}
      boxZoom={true}
      keyboard={true}
      tap={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      <MapController />
      <ClusterLayer objects={filteredObjects} onObjectClick={setSelectedObject} />
    </MapContainer>
  )
}

