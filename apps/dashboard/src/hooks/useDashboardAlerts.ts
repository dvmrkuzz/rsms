import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useNotificationStore } from '../store/notifications.store'
import { playNotificationSound } from '../lib/notificationSound'

// Watches the same live data every page already polls and raises a toast +
// chime the moment something new shows up — a walk-in visitor or a fresh
// service request — no matter which dashboard page is currently open.
export function useDashboardAlerts() {
  const navigate = useNavigate()
  const push = useNotificationStore(s => s.push)
  const seenVisitorIds = useRef<Set<string> | null>(null)
  const seenRequestIds = useRef<Set<string> | null>(null)

  const { data: queueData } = useQuery({
    queryKey: ['visitors-queue-today'],
    queryFn: () => api.get('/visitors/queue/today').then(r => r.data),
    refetchInterval: 5000,
  })

  const { data: requestsData } = useQuery({
    queryKey: ['requests-summary'],
    queryFn: () => api.get('/service-requests?limit=100').then(r => r.data),
    refetchInterval: 5000,
  })

  useEffect(() => {
    if (queueData === undefined) return
    const queue: any[] = queueData.queue ?? []
    const currentIds = new Set<string>(queue.map(v => v.id))

    if (seenVisitorIds.current === null) {
      seenVisitorIds.current = currentIds
      return
    }

    const newOnes = queue.filter(v => !seenVisitorIds.current!.has(v.id) && !v.isServed)
    if (newOnes.length) {
      newOnes.forEach(v => {
        push({
          icon: 'visitor',
          title: 'New visitor checked in',
          message: `${v.visitorName} — Queue ${v.queueNumber}`,
          onClick: () => navigate('/dashboard/counter'),
        })
      })
      playNotificationSound()
    }
    seenVisitorIds.current = currentIds
  }, [queueData, push, navigate])

  useEffect(() => {
    if (requestsData === undefined) return
    const pending: any[] = (requestsData.data ?? []).filter((r: any) => r.status === 'pending')
    const currentIds = new Set<string>(pending.map(r => r.id))

    if (seenRequestIds.current === null) {
      seenRequestIds.current = currentIds
      return
    }

    const newOnes = pending.filter(r => !seenRequestIds.current!.has(r.id))
    if (newOnes.length) {
      newOnes.forEach(r => {
        push({
          icon: 'request',
          title: 'New service request',
          message: `${r.trackingNumber} — ${r.documentType?.name ?? 'Document request'}`,
          onClick: () => navigate('/dashboard/requests'),
        })
      })
      playNotificationSound()
    }
    seenRequestIds.current = currentIds
  }, [requestsData, push, navigate])
}
