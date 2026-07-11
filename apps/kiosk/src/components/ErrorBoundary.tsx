import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center"
          style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 100%)' }}>
          <div className="bg-white rounded-2xl p-8 max-w-md shadow-2xl">
            <p className="text-4xl mb-4">⚠️</p>
            <h2 className="font-black text-xl text-gray-800 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-500 mb-6 font-mono break-words">{this.state.message}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 text-white rounded-xl font-bold"
              style={{ background: '#7B1113' }}
            >
              Return to Home
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
