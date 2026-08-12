import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Loader2, FileText, ClipboardList, FileCheck2,
  GraduationCap, ShieldCheck, Award, FileMinus, Stamp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import api from '../lib/api'
import KioskStepHeader from '../components/KioskStepHeader'
import KioskSuccessScreen from '../components/KioskSuccessScreen'

type Step = 'doc-type' | 'details' | 'success'

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
  const [step, setStep] = useState<Step>('doc-type')
  const [docTypes, setDocTypes] = useState<DocType[]>([])
  const [loadingDocTypes, setLoadingDocTypes] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState<DocType | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successData, setSuccessData] = useState<SuccessData | null>(null)
  const [form, setForm] = useState({
    visitorName: '',
    studentId: '',
    contactNumber: '',
  })

  useEffect(() => {
    api.get('/visitors/document-types')
      .then(r => setDocTypes(r.data))
      .catch(() => setError('Failed to load document types.'))
      .finally(() => setLoadingDocTypes(false))
  }, [])

  const handleSelectDoc = (doc: DocType) => {
    setSelectedDoc(doc)
    setStep('details')
  }

  const handleSubmit = async () => {
    if (!form.visitorName.trim() || !selectedDoc) return
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post('/visitors/checkin', {
        visitorName: form.visitorName,
        studentId: form.studentId || undefined,
        contactNumber: form.contactNumber || undefined,
        purpose: 'document_request',
        documentTypeId: selectedDoc.id,
      })
      setSuccessData(res.data)
      setStep('success')
      setTimeout(() => navigate('/'), 10000)
    } catch {
      setError('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'success' && successData) {
    return (
      <KioskSuccessScreen
        title="Request Submitted!"
        visitorFirstName={successData.visitorName.split(' ')[0]}
        queueNumber={successData.queueNumber}
        queueHint="Please wait for your number to be called"
        trackingNumber={successData.trackingNumber}
      />
    )
  }

  const SelectedIcon = selectedDoc ? DOC_ICONS[selectedDoc.name] ?? FileText : FileText

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F5F5' }}>
      <KioskStepHeader
        title="Document Request"
        subtitle={step === 'doc-type' ? 'Step 1 of 2 — Select document type' : 'Step 2 of 2 — Enter your details'}
        onBack={() => step === 'details' ? setStep('doc-type') : navigate('/')}
        steps={{ total: 2, current: step === 'doc-type' ? 1 : 2 }}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-base mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Document Type Grid */}
        {step === 'doc-type' && (
          <div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">What document do you need?</h2>
            <p className="text-gray-500 mb-7 text-lg">Tap to select the document type</p>

            {loadingDocTypes ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#7B1113' }} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5">
                {docTypes.map(doc => {
                  const Icon = DOC_ICONS[doc.name] ?? FileText
                  return (
                    <button
                      key={doc.id}
                      onClick={() => handleSelectDoc(doc)}
                      className="bg-white rounded-2xl p-6 text-left shadow-sm border-2 border-transparent transition-all active:scale-95 hover:border-red-800 hover:shadow-md"
                    >
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
                          <span className="text-xs font-medium text-gray-400">
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

        {/* Step 2: Details Form */}
        {step === 'details' && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl px-5 py-3 mb-6 border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: '#F5EDED' }}>
                <SelectedIcon className="w-5 h-5" style={{ color: '#7B1113' }} />
              </div>
              <div>
                <p className="text-xs text-gray-400">Selected document</p>
                <p className="font-bold text-gray-800">{selectedDoc?.name}</p>
              </div>
            </div>

            <h2 className="text-2xl font-black text-gray-800 mb-2">Enter your details</h2>
            <p className="text-gray-500 mb-7 text-base">Please fill in your information below</p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <div>
                <label className="block text-base font-bold mb-2" style={{ color: '#7B1113' }}>
                  Full Name *
                </label>
                <input
                  value={form.visitorName}
                  onChange={e => setForm({ ...form, visitorName: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-red-800 transition"
                  placeholder="Enter your full name"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-bold mb-2" style={{ color: '#7B1113' }}>
                    Student ID
                  </label>
                  <input
                    value={form.studentId}
                    onChange={e => setForm({ ...form, studentId: e.target.value })}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-red-800 transition"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-base font-bold mb-2" style={{ color: '#7B1113' }}>
                    Contact Number
                  </label>
                  <input
                    value={form.contactNumber}
                    onChange={e => setForm({ ...form, contactNumber: e.target.value })}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-red-800 transition"
                    placeholder="09xx-xxx-xxxx"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!form.visitorName.trim() || submitting}
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
