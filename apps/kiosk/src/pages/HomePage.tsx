import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Package, ArrowRight, } from 'lucide-react'
import logo from '../assets/logo.png'
interface PersonalDetails {
  firstName: string
  lastName: string
  contactNumber: string
  idNumber: string
}

export default function HomePage() {
  const navigate = useNavigate()
  const [now, setNow] = useState(new Date())
  const [step, setStep] = useState<'details' | 'purpose'>('details')
  const [details, setDetails] = useState<PersonalDetails>({
    firstName: '', lastName: '', contactNumber: '', idNumber: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedDate = now.toLocaleDateString('en-PH', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
  const formattedTime = now.toLocaleTimeString('en-PH', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })

  const handleProceed = () => {
    if (!details.firstName.trim() || !details.lastName.trim() || !details.contactNumber.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    setStep('purpose')
  }

  const handlePurpose = (purpose: 'document-request' | 'pickup') => {
    const params = new URLSearchParams({
      firstName: details.firstName,
      lastName: details.lastName,
      contactNumber: details.contactNumber,
      idNumber: details.idNumber,
    })
    navigate(`/${purpose}?${params.toString()}`)
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 40%, #7B1113 100%)' }}>

      {/* Watermark */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-end">
        <img src={logo} alt="" className="w-auto select-none"
          style={{ height: '520px', opacity: 0.08, marginRight: '-40px' }}
          draggable={false} />
      </div>

      {/* Gold top */}
      <div className="h-1.5 w-full relative z-10"
        style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />

      {/* Header */}
      <div className="flex items-center gap-5 px-10 py-5 relative z-10">
        <img src={logo} alt="SorSU Logo" className="w-14 h-14 object-contain drop-shadow-lg" />
        <div>
          <p className="text-white font-extrabold text-xl tracking-wide">SORSOGON STATE UNIVERSITY</p>
          <p className="font-bold text-base tracking-widest" style={{ color: '#F0D080' }}>
            BULAN CAMPUS — REGISTRAR'S OFFICE
          </p>
          <div className="h-0.5 w-24 mt-1 rounded" style={{ background: '#C9A84C' }} />
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-10 py-4 relative z-10">

        {step === 'details' && (
          <div className="w-full max-w-xl space-y-6">
            <div className="text-center space-y-2 mb-6">
              <h1 className="text-4xl font-black text-white tracking-wide">WELCOME!</h1>
              <p className="text-white/70 text-lg">Please fill in your details to get started</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#7B1113' }}>
                    First Name *
                  </label>
                  <input
                    value={details.firstName}
                    onChange={e => setDetails({ ...details, firstName: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-red-800 transition"
                    placeholder="Juan"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#7B1113' }}>
                    Last Name *
                  </label>
                  <input
                    value={details.lastName}
                    onChange={e => setDetails({ ...details, lastName: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-red-800 transition"
                    placeholder="Dela Cruz"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#7B1113' }}>
                    Contact Number *
                  </label>
                  <input
                    value={details.contactNumber}
                    onChange={e => setDetails({ ...details, contactNumber: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-red-800 transition"
                    placeholder="09xx-xxx-xxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#7B1113' }}>
                    ID Number <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    value={details.idNumber}
                    onChange={e => setDetails({ ...details, idNumber: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-red-800 transition"
                    placeholder="Student ID"
                  />
                </div>
              </div>

              <button
                onClick={handleProceed}
                className="w-full py-4 text-white rounded-2xl text-lg font-black tracking-wide transition active:scale-95 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #7B1113, #A01515)' }}
              >
                NEXT — Select Purpose <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 'purpose' && (
          <div className="w-full max-w-2xl space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-black text-white tracking-wide">
                HOW CAN WE HELP YOU?
              </h1>
              <p className="text-white/70 text-lg">
                Welcome, <span className="font-bold text-white">{details.firstName}</span>! Select your purpose
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <button
                onClick={() => handlePurpose('document-request')}
                className="bg-white rounded-3xl p-10 text-center shadow-2xl transition-all active:scale-95 hover:scale-105"
              >
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: '#F5EDED' }}>
                  <FileText className="w-12 h-12" style={{ color: '#7B1113' }} />
                </div>
                <p className="font-black text-2xl tracking-wide mb-2" style={{ color: '#7B1113' }}>DOCUMENT</p>
                <p className="font-black text-2xl tracking-wide mb-3" style={{ color: '#7B1113' }}>REQUEST</p>
                <p className="text-sm text-gray-500 leading-snug">
                  Request TOR, COE, Diploma, Good Moral &amp; other documents
                </p>
              </button>

              <button
                onClick={() => handlePurpose('pickup')}
                className="rounded-3xl p-10 text-center shadow-2xl transition-all active:scale-95 hover:scale-105 border-2"
                style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(240,208,128,0.6)' }}
              >
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'rgba(240,208,128,0.2)' }}>
                  <Package className="w-12 h-12" style={{ color: '#F0D080' }} />
                </div>
                <p className="font-black text-2xl tracking-wide mb-2 text-white">PICK UP</p>
                <p className="font-black text-2xl tracking-wide mb-3 text-white">DOCUMENT</p>
                <p className="text-white/60 text-sm leading-snug">
                  Claim a previously requested document
                </p>
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setStep('details')}
                className="text-white/50 hover:text-white text-sm underline transition"
              >
                ← Go back and edit details
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Gold bottom */}
      <div className="h-1.5 w-full relative z-10"
        style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />

      {/* Footer */}
      <div className="flex items-center justify-between px-8 py-3 relative z-10"
        style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <span>🕐</span>
          <span>{formattedDate} | {formattedTime}</span>
        </div>
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <span>Registrar Service Management System</span>
        </div>
      </div>
    </div>
  )
}