import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Loader2, FileText, ClipboardList, FileCheck2,
  GraduationCap, ShieldCheck, Award, FileMinus, Stamp, Printer,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import api from '../lib/api'
import KioskStepHeader from '../components/KioskStepHeader'

type Step = 'doc-type' | 'request-details' | 'success'

interface DocType {
  id: string
  name: string
  description: string
  processingDays: number
  fee: number
}

interface SuccessData {
  queueNumber: string
  trackingNumber: string | null
  visitorName: string
}

const DOC_ICONS: Record<string, LucideIcon> = {
  'Transcript of Records': ClipboardList,
  'Certificate of Enrollment': FileCheck2,
  'Diploma': GraduationCap,
  'Good Moral Certificate': ShieldCheck,
  'Certificate of Graduation': Award,
  'Honorable Dismissal': FileMinus,
  'Authentication': Stamp,
}

export default function DocumentRequestPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const printRef = useRef<HTMLDivElement>(null)

  const firstName = searchParams.get('firstName') ?? ''
  const lastName = searchParams.get('lastName') ?? ''
  const contactNumber = searchParams.get('contactNumber') ?? ''
  const idNumber = searchParams.get('idNumber') ?? ''
  const fullName = `${firstName} ${lastName}`.trim()

  const [step, setStep] = useState<Step>('doc-type')
  const [docTypes, setDocTypes] = useState<DocType[]>([])
  const [loadingDocTypes, setLoadingDocTypes] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState<DocType | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successData, setSuccessData] = useState<SuccessData | null>(null)
  const [requestDetails, setRequestDetails] = useState({
    copies: 1,
    purpose: '',
  })

  useEffect(() => {
    api.get('/document-types')
      .then(r => setDocTypes(r.data))
      .catch(() => {
        api.get('/visitors/document-types')
          .then(r => setDocTypes(r.data))
          .catch(() => setError('Failed to load document types.'))
      })
      .finally(() => setLoadingDocTypes(false))
  }, [])

  const handleSelectDoc = (doc: DocType) => {
    setSelectedDoc(doc)
    setStep('request-details')
  }

  const handleSubmit = async () => {
    if (!fullName || !selectedDoc || !requestDetails.purpose.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post('/visitors/checkin', {
        visitorName: fullName,
        studentId: idNumber || undefined,
        contactNumber: contactNumber || undefined,
        purpose: 'document_request',
        documentTypeId: selectedDoc.id,
        notes: `Copies: ${requestDetails.copies} | Purpose: ${requestDetails.purpose}`,
      })
      setSuccessData(res.data)
      setStep('success')
      setTimeout(() => navigate('/'), 15000)
    } catch {
      setError('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (step === 'success' && successData) {
    const now = new Date()
    return (
      <>
        {/* Print Slip — hidden on screen, visible when printing */}
        <div ref={printRef} className="hidden print:block p-8 font-sans">
          <div style={{ borderBottom: '3px solid #7B1113', paddingBottom: '12px', marginBottom: '16px' }}>
            <p style={{ fontWeight: 900, fontSize: '18px', color: '#7B1113' }}>
              SORSOGON STATE UNIVERSITY — BULAN CAMPUS
            </p>
            <p style={{ fontSize: '13px', color: '#666' }}>Registrar's Office — Document Request Slip</p>
          </div>

          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>QUEUE NUMBER</p>
            <p style={{ fontSize: '64px', fontWeight: 900, color: '#7B1113', lineHeight: 1 }}>
              {successData.queueNumber}
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            {[
              ['Name', fullName],
              ['Contact', contactNumber],
              ['ID Number', idNumber || '—'],
              ['Document', selectedDoc?.name ?? '—'],
              ['Copies', String(requestDetails.copies)],
              ['Purpose', requestDetails.purpose],
              ['Tracking Code', successData.trackingNumber ?? '—'],
              ['Date & Time', now.toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' })],
            ].map(([label, value]) => (
              <tr key={label} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '6px 8px', fontWeight: 700, color: '#555', width: '35%' }}>{label}</td>
                <td style={{ padding: '6px 8px', color: '#222' }}>{value}</td>
              </tr>
            ))}
          </table>

          <div style={{ marginTop: '20px', padding: '12px', background: '#FFF8EC', border: '1px solid #C9A84C', borderRadius: '8px' }}>
            <p style={{ fontWeight: 700, color: '#7B1113', marginBottom: '4px' }}>📋 IMPORTANT</p>
            <p style={{ fontSize: '12px', color: '#555' }}>
              Please proceed to the <strong>Cashier's Office</strong> for payment before going to the Registrar window.
              Present this slip together with your payment receipt.
            </p>
          </div>

          <p style={{ marginTop: '16px', fontSize: '11px', color: '#aaa', textAlign: 'center' }}>
            RSMS — Registrar Service Management System
          </p>
        </div>

        {/* Screen Success View */}
        <div className="min-h-screen flex flex-col relative overflow-hidden print:hidden"
          style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 40%, #7B1113 100%)' }}>
          <div className="h-1.5 w-full"
            style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />

          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center space-y-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
              <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" stroke="#7B1113" strokeWidth="2" />
                <path d="M6 12l4 4 8-8" stroke="#7B1113" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div>
              <h2 className="text-4xl font-black text-white mb-1">Request Submitted!</h2>
              <p className="text-white/70 text-xl">Welcome, {firstName}!</p>
            </div>

            {/* Queue Number */}
            <div className="bg-white rounded-3xl px-16 py-6 shadow-2xl">
              <p className="text-xs font-semibold text-gray-400 mb-1 tracking-widest uppercase">Your Queue Number</p>
              <p className="text-8xl font-black tracking-tight" style={{ color: '#7B1113' }}>
                {successData.queueNumber}
              </p>
              <p className="text-gray-500 text-sm mt-1">Please wait for your number to be called</p>
            </div>

            {/* Tracking Code */}
            {successData.trackingNumber && (
              <div className="rounded-2xl px-8 py-4 border-2"
                style={{ background: 'rgba(240,208,128,0.15)', borderColor: 'rgba(240,208,128,0.5)' }}>
                <p className="text-white/60 text-sm mb-1">Tracking Code</p>
                <p className="font-black text-2xl tracking-widest font-mono" style={{ color: '#F0D080' }}>
                  {successData.trackingNumber}
                </p>
                <p className="text-white/50 text-xs mt-1">Save this to track your request online</p>
              </div>
            )}

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-3 px-8 py-4 bg-white rounded-2xl font-black text-lg shadow-lg transition active:scale-95 hover:bg-gray-50"
              style={{ color: '#7B1113' }}
            >
              <Printer className="w-6 h-6" />
              PRINT SLIP FOR CASHIER
            </button>

            <p className="text-white/40 text-sm">Returning to home screen in 15 seconds...</p>
          </div>

          <div className="h-1.5 w-full"
            style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
        </div>
      </>
    )
  }

  const SelectedIcon = selectedDoc ? DOC_ICONS[selectedDoc.name] ?? FileText : FileText

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F5F5' }}>
      <KioskStepHeader
        title="Document Request"
        subtitle={step === 'doc-type' ? 'Step 1 of 2 — Select document type' : 'Step 2 of 2 — Request details'}
        onBack={() => step === 'request-details' ? setStep('doc-type') : navigate('/')}
        steps={{ total: 2, current: step === 'doc-type' ? 1 : 2 }}
      />

      <div className="flex-1 overflow-y-auto px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-base mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Document Type */}
        {step === 'doc-type' && (
          <div>
            <h2 className="text-2xl font-black text-gray-800 mb-1">What document do you need?</h2>
            <p className="text-gray-500 mb-6 text-base">Tap to select the document type</p>

            {loadingDocTypes ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#7B1113' }} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5">
                {docTypes.map(doc => {
                  const Icon = DOC_ICONS[doc.name] ?? FileText
                  return (
                    <button key={doc.id} onClick={() => handleSelectDoc(doc)}
                      className="bg-white rounded-2xl p-6 text-left shadow-sm border-2 border-transparent transition-all active:scale-95 hover:border-red-800 hover:shadow-md">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-3"
                        style={{ background: '#F5EDED' }}>
                        <Icon className="w-7 h-7" style={{ color: '#7B1113' }} />
                      </div>
                      <p className="font-black text-lg text-gray-800 mb-1">{doc.name}</p>
                      {doc.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">{doc.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        {doc.processingDays > 0 && (
                          <span className="text-xs text-gray-400">
                            {doc.processingDays} day{doc.processingDays !== 1 ? 's' : ''} processing
                          </span>
                        )}
                        {doc.fee > 0 && (
                          <span className="text-xs font-semibold" style={{ color: '#7B1113' }}>
                            ₱{Number(doc.fee).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Request Details */}
        {step === 'request-details' && (
          <div className="max-w-lg mx-auto">
            {/* Selected doc summary */}
            <div className="bg-white rounded-2xl px-5 py-3 mb-6 border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: '#F5EDED' }}>
                <SelectedIcon className="w-5 h-5" style={{ color: '#7B1113' }} />
              </div>
              <div>
                <p className="text-xs text-gray-400">Selected document</p>
                <p className="font-bold text-gray-800">{selectedDoc?.name}</p>
              </div>
              {selectedDoc?.fee && selectedDoc.fee > 0 && (
                <div className="ml-auto">
                  <p className="text-xs text-gray-400">Fee</p>
                  <p className="font-bold" style={{ color: '#7B1113' }}>₱{Number(selectedDoc.fee).toFixed(2)}</p>
                </div>
              )}
            </div>

            {/* Requestor summary */}
            <div className="bg-white rounded-2xl px-5 py-3 mb-6 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Requesting as</p>
              <p className="font-bold text-gray-800">{fullName}</p>
              <p className="text-sm text-gray-500">{contactNumber}{idNumber ? ` · ID: ${idNumber}` : ''}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <div>
                <label className="block text-base font-bold mb-2" style={{ color: '#7B1113' }}>
                  Number of Copies *
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setRequestDetails(d => ({ ...d, copies: Math.max(1, d.copies - 1) }))}
                    className="w-14 h-14 rounded-xl text-2xl font-black border-2 border-gray-200 hover:border-red-800 transition"
                    style={{ color: '#7B1113' }}
                  >−</button>
                  <span className="text-4xl font-black text-gray-800 w-16 text-center">
                    {requestDetails.copies}
                  </span>
                  <button
                    onClick={() => setRequestDetails(d => ({ ...d, copies: Math.min(10, d.copies + 1) }))}
                    className="w-14 h-14 rounded-xl text-2xl font-black border-2 border-gray-200 hover:border-red-800 transition"
                    style={{ color: '#7B1113' }}
                  >+</button>
                </div>
              </div>

              <div>
                <label className="block text-base font-bold mb-2" style={{ color: '#7B1113' }}>
                  Purpose / Reason *
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    'Employment Application',
                    'Graduate School Application',
                    'Scholarship Application',
                    'Transfer of School',
                    'Board Exam Application',
                    'Personal Copy',
                  ].map(p => (
                    <button key={p}
                      onClick={() => setRequestDetails(d => ({ ...d, purpose: p }))}
                      className="px-3 py-2.5 rounded-xl text-sm font-medium text-left transition border-2"
                      style={requestDetails.purpose === p
                        ? { background: '#7B1113', color: 'white', borderColor: '#7B1113' }
                        : { background: '#F9F0F0', color: '#7B1113', borderColor: 'transparent' }
                      }
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <input
                  value={requestDetails.purpose}
                  onChange={e => setRequestDetails(d => ({ ...d, purpose: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-800 transition"
                  placeholder="Or type your purpose here..."
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!requestDetails.purpose.trim() || submitting}
              className="w-full mt-6 py-5 text-white rounded-2xl text-xl font-black tracking-wide disabled:opacity-50 transition active:scale-95"
              style={{ background: 'linear-gradient(135deg, #7B1113, #A01515)' }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" /> Processing...
                </span>
              ) : 'SUBMIT REQUEST'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}