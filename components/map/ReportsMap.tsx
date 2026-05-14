'use client'

import { useEffect, useRef } from 'react'
import type { Report } from '@/types'

interface ReportsMapProps {
  reports: Report[]
  height?: string
  center?: [number, number]
  zoom?: number
  /** Show "Lihat Laporan Lengkap" button in popup. Default false. */
  showDetailButton?: boolean
  /** Base path for report detail links, e.g. '/admin/reports' */
  reportBasePath?: string
  /** If provided, clicking the detail button calls this instead of navigating */
  onReportClick?: (report: Report) => void
}

export default function ReportsMap({
  reports,
  height = '400px',
  center,
  zoom,
  showDetailButton = false,
  reportBasePath = '/admin/reports',
  onReportClick,
}: ReportsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    const initMap = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      // Filter out resolved reports — they should not appear on map
      const activeReports = reports.filter(r => r.status !== 'resolved')

      const defaultCenter: [number, number] = center || (
        activeReports.find(r => r.latitude && r.longitude)
          ? [activeReports.find(r => r.latitude && r.longitude)!.latitude!, activeReports.find(r => r.latitude && r.longitude)!.longitude!]
          : [-2.5, 118]
      )
      const defaultZoom = zoom || (center ? zoom || 5 : 11)

      const map = L.map(mapRef.current!, {
        center: defaultCenter,
        zoom: defaultZoom,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      const priorityColors: Record<string, string> = {
        high: '#ef4444',
        medium: '#eab308',
        low: '#22c55e',
      }

      const statusLabels: Record<string, string> = {
        pending: 'Pending',
        processing: 'Processing',
        resolved: 'Resolved',
        escalated: 'Escalated',
      }

      const statusColors: Record<string, string> = {
        pending: '#94a3b8',
        processing: '#60a5fa',
        resolved: '#4ade80',
        escalated: '#c084fc',
      }

      activeReports.forEach(report => {
        if (!report.latitude || !report.longitude) return

        const color = priorityColors[report.priority] || '#6b7280'
        const sColor = statusColors[report.status] || '#94a3b8'

        const icon = L.divIcon({
          html: `<div style="
            width: 14px; height: 14px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 0 8px ${color}80;
            cursor: pointer;
          "></div>`,
          className: '',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        })

        const btnId = `popup-btn-${report.id}`

        // Build popup — detail button only shown when showDetailButton=true
        const detailBtn = showDetailButton
          ? `<a
              id="${btnId}"
              href="${reportBasePath}/${report.id}"
              style="display:block;width:100%;text-align:center;background:linear-gradient(135deg,#06b6d4,#3b82f6);color:white;border:none;border-radius:8px;padding:7px 12px;font-size:12px;font-weight:600;cursor:pointer;text-decoration:none;box-sizing:border-box;margin-top:10px"
            >
              Lihat Laporan Lengkap →
            </a>`
          : ''

        const popupContent = `
          <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:12px;color:white;font-family:system-ui;min-width:200px;max-width:260px">
            ${report.image_url ? `<img src="${report.image_url}" style="width:100%;height:90px;object-fit:cover;border-radius:8px;margin-bottom:8px" />` : ''}
            <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em">${report.category.replace('_', ' ')}</div>
            <div style="font-weight:600;font-size:13px;margin-bottom:4px;line-height:1.3">${report.title}</div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:8px">${report.description.slice(0, 80)}${report.description.length > 80 ? '...' : ''}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <span style="background:${color}20;border:1px solid ${color}40;color:${color};padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600">${report.priority.toUpperCase()}</span>
              <span style="background:${sColor}20;border:1px solid ${sColor}40;color:${sColor};padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600">${statusLabels[report.status] || report.status}</span>
            </div>
            ${detailBtn}
          </div>
        `

        const popup = L.popup({
          className: 'custom-popup',
          maxWidth: 280,
        }).setContent(popupContent)

        const marker = L.marker([report.latitude, report.longitude], { icon }).addTo(map)
        marker.bindPopup(popup)

        // If onReportClick provided, intercept the button click
        if (showDetailButton && onReportClick) {
          marker.on('popupopen', () => {
            setTimeout(() => {
              const btn = document.getElementById(btnId)
              if (btn) {
                btn.addEventListener('click', (e) => {
                  e.preventDefault()
                  onReportClick(report)
                })
              }
            }, 50)
          })
        }
      })

      mapInstanceRef.current = map
      setTimeout(() => map.invalidateSize(), 100)
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [reports])

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%', borderRadius: '16px', overflow: 'hidden' }}
      className="border border-slate-700/50"
    />
  )
}
