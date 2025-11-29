import { useNavigate } from 'react-router-dom'
import notFound from '@assets/notfound.png'
export default function NotFound() {
  const navigate = useNavigate()

  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <img src={notFound} alt="not found" className="" />
          <p className="text-slate-600 dark:text-slate-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg bg-slate-600 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-slate-500 dark:bg-slate-500 dark:hover:bg-slate-400"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </section>
  )
}

