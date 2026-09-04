import logo from '../assets/logo.png'

export default function LoginPage() {
  const handleGoogle = () => {
    const apiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'
    window.location.href = `${apiUrl}/auth/google`
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 40%, #7B1113 100%)' }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1 z-10"
        style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }}
      />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6 space-y-2">
          <img src={logo} alt="SorSU Logo" className="w-16 h-16 object-contain mx-auto drop-shadow-lg" />
          <h1 className="text-xl font-extrabold text-white tracking-wide">SORSOGON STATE UNIVERSITY</h1>
          <p className="font-bold tracking-widest text-xs" style={{ color: '#F0D080' }}>BULAN CAMPUS</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-7">
          <h2 className="text-lg font-bold mb-1" style={{ color: '#7B1113' }}>
            Welcome
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Sign in with your Google account to view your requests and keep your history across visits.
          </p>

          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2.5 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3c-7.7 0-14.4 4.4-17.7 10.7z"/>
              <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.5 26.7 37 24 37c-5.3 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 40.5 16.2 45 24 45z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C40.5 36.3 43 30.7 43 24c0-1.2-.1-2.4-.4-3.5z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-gray-400 mt-6">
            You can still browse announcements and track requests without signing in.
          </p>
        </div>
      </div>
    </div>
  )
}