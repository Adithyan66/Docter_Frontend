import { useNavigate } from 'react-router-dom'
import type { Patient } from '@api/patients'

type PatientCardProps = {
  patient: Patient
}

export default function PatientCard({ patient }: PatientCardProps) {
  const navigate = useNavigate()

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return '-'
    }
  }

  const handleClick = () => {
    navigate(`/patients/${patient.id}`)
  }

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer rounded-2xl border border-slate-200 bg-slate-50/50 p-5 transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-blue-600"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          {patient.profilePicUrl ? (
            <img
              src={patient.profilePicUrl}
              alt={patient.fullName}
              className="h-16 w-16 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-2 border-slate-200 dark:border-slate-700">
              {patient.fullName?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {patient.fullName || '-'}
            </h3>
            {patient.patientId && (
              <p className="text-xs text-slate-600 dark:text-slate-400">ID: {patient.patientId}</p>
            )}
            <div className="mt-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  patient.isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {patient.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {patient.age !== undefined && (
            <div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Age</span>
              <p className="text-slate-900 dark:text-white">{patient.age} years</p>
            </div>
          )}
          {patient.gender && (
            <div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Gender</span>
              <p className="text-slate-900 dark:text-white capitalize">{patient.gender}</p>
            </div>
          )}
        </div>

        {patient.phone && (
          <div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Phone</span>
            <p className="text-sm text-slate-900 dark:text-white">{patient.phone}</p>
          </div>
        )}

        {patient.email && (
          <div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Email</span>
            <p className="text-sm text-slate-900 dark:text-white truncate">{patient.email}</p>
          </div>
        )}

        {patient.consultationType && (
          <div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Consultation
            </span>
            <p className="text-sm text-slate-900 dark:text-white capitalize">
              {patient.consultationType.replace('-', ' ')}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          {patient.visitCount !== undefined && (
            <div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Visits</span>
              <p className="text-slate-900 dark:text-white">{patient.visitCount}</p>
            </div>
          )}
          {patient.lastVisitAt && (
            <div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Last Visit
              </span>
              <p className="text-slate-900 dark:text-white text-xs">
                {formatDate(patient.lastVisitAt)}
              </p>
            </div>
          )}
        </div>

        {patient.tags && patient.tags.length > 0 && (
          <div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Tags</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {patient.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

