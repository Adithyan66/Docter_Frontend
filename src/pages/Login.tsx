import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@hooks/store'
import { loginUser } from '@redux/slices/authSlice'
import welcomeImage from '@assets/welcome.png'

type LoginTab = 'doctor' | 'staff'

export default function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { status, error, isAuthenticated } = useAppSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState<LoginTab>('doctor')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    // Validation
    if (activeTab === 'doctor') {
      if (!email.trim()) {
        setFormError('Email is required')
        return
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setFormError('Please enter a valid email address')
        return
      }
    } else {
      if (!username.trim()) {
        setFormError('Username is required')
        return
      }
    }

    if (!password.trim()) {
      setFormError('Password is required')
      return
    }

    try {
      const payload = activeTab === 'doctor' 
        ? { email: email.trim(), password, role: 'doctor' as const }
        : { username: username.trim(), password, role: 'staff' as const }
      await dispatch(loginUser(payload)).unwrap()
      navigate('/', { replace: true })
    } catch (err) {
      setFormError(typeof err === 'string' ? err : 'Invalid credentials')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 w-full max-w-6xl">
        <div className="hidden lg:flex flex-col items-center justify-center text-center max-w-md">
          <img
            src={welcomeImage}
            alt="Welcome"
            className="w-full h-auto object-contain mb-6"
          />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome Back to Your Dental Clinic Management System  okkkkkk ok
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300 font-medium">
            Sign in to continue your journey
          </p>
        </div>
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {activeTab === 'doctor' ? 'Doctor Portal' : 'Staff Portal'}
          </h2>
          <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
            Sign in to access your management console.
          </p>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('doctor')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'doctor'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Doctor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('staff')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'staff'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Staff
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {activeTab === 'doctor' ? 'Email' : 'Username'}
              </label>
              {activeTab === 'doctor' ? (
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white/80 dark:bg-slate-800/80 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                  placeholder="doctor@email.com"
                  required
                />
              ) : (
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white/80 dark:bg-slate-800/80 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                  placeholder="Enter username"
                  required
                />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white/80 dark:bg-slate-800/80 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                placeholder="••••••••"
                required
              />
            </div>
            {(formError || error) && (
              <p className="text-sm text-red-500 dark:text-red-400">{formError ?? error}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-2.5 text-sm font-semibold text-white transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

