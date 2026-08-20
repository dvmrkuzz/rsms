import { CheckCircle, Hash, Printer } from 'lucide-react'

interface KioskSuccessScreenProps {
  title: string
  visitorFirstName: string
  queueNumber: string
  queueHint: string
  trackingNumber?: string | null
}

export default function KioskSuccessScreen({
  title, visitorFirstName, queueNumber, queueHint, trackingNumber,
}: KioskSuccessScreenProps) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })

  const handlePrint = () => window.print()

  return (
    <>
      {/* Print-only stylesheet: 80mm receipt, hide the on-screen UI when printing */}
      <style>{`
        @media print {
          @page { size: 80mm auto; margin: 0; }
          body * { visibility: hidden; }
          #kiosk-receipt, #kiosk-receipt * { visibility: visible; }
          #kiosk-receipt {
            position: absolute; left: 0; top: 0;
            width: 80mm; padding: 6mm 5mm;
            color: #000; background: #fff;
            font-family: 'Courier New', monospace;
          }
          .no-print { display: none !important; }
        }
        #kiosk-receipt { display: none; }
      `}</style>

      {/* ===== ON-SCREEN SUCCESS (unchanged look) ===== */}
      <div className="min-h-screen flex flex-col relative overflow-hidden no-print"
        style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 40%, #7B1113 100%)' }}>
        <div className="h-1.5 w-full"
          style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center space-y-8">
          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-2xl">
            <CheckCircle className="w-16 h-16" style={{ color: '#7B1113' }} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white mb-2">{title}</h2>
            <p className="text-white/70 text-xl">Welcome, {visitorFirstName}!</p>
          </div>
          <div className="bg-white rounded-3xl px-16 py-8 shadow-2xl">
            <p className="text-sm font-semibold text-gray-400 mb-1 tracking-widest uppercase">Your Queue Number</p>
            <div className="flex items-center justify-center gap-2">
              <Hash className="w-8 h-8" style={{ color: '#7B1113' }} />
              <span className="text-7xl font-black tracking-tight" style={{ color: '#7B1113' }}>
                {queueNumber}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-2">{queueHint}</p>
          </div>
          {trackingNumber && (
            <div className="rounded-2xl px-8 py-4 border-2"
              style={{ background: 'rgba(240,208,128,0.15)', borderColor: 'rgba(240,208,128,0.5)' }}>
              <p className="text-white/60 text-sm mb-1">Tracking Number</p>
              <p className="font-black text-2xl tracking-widest font-mono" style={{ color: '#F0D080' }}>
                {trackingNumber}
              </p>
              <p className="text-white/50 text-xs mt-1">Save this to track your request status</p>
            </div>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white rounded-full px-8 py-3 shadow-xl font-bold text-lg active:scale-95 transition"
            style={{ color: '#7B1113' }}
          >
            <Printer className="w-5 h-5" />
            Print Slip
          </button>

          <p className="text-white/40 text-sm">Returning to home screen in 10 seconds...</p>
        </div>
        <div className="h-1.5 w-full"
          style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
      </div>

      {/* ===== PRINT-ONLY 80mm RECEIPT ===== */}
      <div id="kiosk-receipt">
        <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '3mm', marginBottom: '3mm' }}>
          <div style={{ fontWeight: 'bold', fontSize: '13px', lineHeight: 1.3 }}>
            SORSOGON STATE UNIVERSITY
          </div>
          <div style={{ fontSize: '11px' }}>Bulan Campus</div>
          <div style={{ fontSize: '11px' }}>Registrar's Office</div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '12px', marginBottom: '2mm' }}>{title}</div>
        <div style={{ fontSize: '11px', marginBottom: '3mm' }}>Name: {visitorFirstName}</div>

        <div style={{ textAlign: 'center', border: '1px solid #000', padding: '3mm', marginBottom: '3mm' }}>
          <div style={{ fontSize: '10px', letterSpacing: '1px' }}>QUEUE NUMBER</div>
          <div style={{ fontSize: '34px', fontWeight: 'bold', lineHeight: 1.1 }}>{queueNumber}</div>
          <div style={{ fontSize: '9px' }}>{queueHint}</div>
        </div>

        {trackingNumber && (
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '3mm', marginBottom: '3mm' }}>
            <div style={{ fontSize: '10px', letterSpacing: '1px' }}>TRACKING NUMBER</div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', letterSpacing: '1px' }}>{trackingNumber}</div>
            <div style={{ fontSize: '9px' }}>Use this to track your request status online.</div>
          </div>
        )}

        <div style={{ fontSize: '10px', textAlign: 'center', lineHeight: 1.5 }}>
          {dateStr} &nbsp; {timeStr}
        </div>
        <div style={{ fontSize: '9px', textAlign: 'center', marginTop: '3mm', borderTop: '1px dashed #000', paddingTop: '3mm' }}>
          Please keep this slip. Present it at the<br />
          window when your number is called.<br />
          Thank you!
        </div>
      </div>
    </>
  )
}