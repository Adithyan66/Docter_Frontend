import { useNavigate } from 'react-router-dom'
import type { Patient } from '@api/patients'
import noprofile from '@assets/noprofile.png'

type PatientCardProps = {
  patient: Patient
}

export default function PatientCard({ patient }: PatientCardProps) {
  const navigate = useNavigate()

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return null
    }
  }

  const handleClick = () => {
    navigate(`/patients/${patient.id}`)
  }

  return (
    <div
      onClick={handleClick}
      className="relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-6 shadow-lg transition-all hover:border-blue-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-600 dark:shadow-slate-900/50"
    >
      <div
        className={`absolute left-0 top-0 z-10 ${
          patient.isActive
            ? 'bg-green-500 dark:bg-green-600'
            : 'bg-red-500 dark:bg-red-600'
        } px-8 py-1 text-xs font-bold text-white shadow-md`}
        style={{
          transform: 'rotate(-45deg)',
          transformOrigin: 'top left',
          left: '-15px',
          top: '58px',
        }}
      >
        {patient.isActive ? 'ACTIVE' : 'INACTIVE'}
      </div>
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="flex-shrink-0">
          {patient.profilePicUrl ? (
            <img
              src={patient.profilePicUrl}
              alt={patient.fullName}
              className="h-32 w-32 rounded-full object-cover border-4 border-slate-200 dark:border-slate-700 shadow-md"
            />
          ) : (
            <img
              src={noprofile}
              alt="No profile"
              className="h-32 w-32 rounded-full object-cover border-4 border-slate-200 dark:border-slate-700 shadow-md"
            />
          )}
        </div>

        <div className="w-full space-y-1">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {patient.fullName || 'Unknown Patient'}
          </h3>
          {patient.patientId ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">ID: {patient.patientId}</p>
          ) : (
            <span className="inline-block rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
              No data
            </span>
          )}
        </div>

        <div className="w-full pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Age
              </span>
              {patient.age !== undefined ? (
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {patient.age} years
                </p>
              ) : (
                <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  No data
                </span>
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Gender
              </span>
              {patient.gender ? (
                <p className="text-base font-semibold text-slate-900 dark:text-white capitalize">
                  {patient.gender}
                </p>
              ) : (
                <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  No data
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="w-full space-y-3">
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Phone
              </span>
              {patient.phone ? (
                <p className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-full">
                  {patient.phone}
                </p>
              ) : (
                <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  No data
                </span>
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Email
              </span>
              {patient.email ? (
                <p className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-full">
                  {patient.email}
                </p>
              ) : (
                <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  No data
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Consultation
            </span>
            {patient.consultationType ? (
              <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                {patient.consultationType.replace('-', ' ')}
              </p>
            ) : (
              <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                No data
              </span>
            )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Clinic
              </span>
              {patient.primaryClinicName ? (
                <p className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-full">
                  {patient.primaryClinicName}
                </p>
              ) : (
                <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  No data
                </span>
              )}
            </div>
          </div>



          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Visits
              </span>
              {patient.visitCount !== undefined ? (
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {patient.visitCount}
                </p>
              ) : (
                <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  No data
                </span>
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Last Visit
              </span>
              {formatDate(patient.lastVisitAt) ? (
                <p className="text-xs font-medium text-slate-900 dark:text-white">
                  {formatDate(patient.lastVisitAt)}
                </p>
              ) : (
                <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  No data
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

