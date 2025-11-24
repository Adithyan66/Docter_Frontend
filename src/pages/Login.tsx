import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@hooks/store'
import { loginUser } from '@redux/slices/authSlice'

export default function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { status, error, isAuthenticated } = useAppSelector((state) => state.auth)
  const [email, setEmail] = useState('doctor@gmail.com')
  const [password, setPassword] = useState('koodecode')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    try {
      await dispatch(loginUser({ email, password })).unwrap()
      navigate('/', { replace: true })
    } catch (err) {
      setFormError(typeof err === 'string' ? err : 'Invalid credentials')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">
          Doctor Portal
        </h2>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Sign in to access your management console.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:text-white"
              placeholder="doctor@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:text-white"
              placeholder="••••••••"
              required
            />
          </div>
          {(formError || error) && (
            <p className="text-sm text-red-500">{formError ?? error}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

