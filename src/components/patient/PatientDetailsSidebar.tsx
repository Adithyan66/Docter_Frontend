import type { PatientDetails } from '@api/patients'
import noprofile from '@assets/noprofile.png'

type PatientDetailsSidebarProps = {
  patient: PatientDetails
  formatDate: (dateString?: string) => string
  formatDateTime: (dateString?: string) => string
  onImageClick: (imageUrl: string) => void
}

export default function PatientDetailsSidebar({
  patient,
  formatDate,
  formatDateTime,
  onImageClick,
}: PatientDetailsSidebarProps) {
  return (
    <div className="lg:col-span-1 space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
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
        <div className="flex flex-col items-center space-y-4 mb-8">
          <img
            src={patient.profilePicUrl || noprofile}
            alt={patient.fullName}
            className="h-32 w-32 rounded-full object-cover border-4 border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onImageClick(patient.profilePicUrl || noprofile)}
          />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{patient.fullName || '-'}</h2>
            {patient.patientId && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">ID: {patient.patientId}</p>
            )}
          </div>
        </div>

        <div className="w-full space-y-6">
          {patient.treatmentCoursesSummary && (
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Total Cost</span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  ₹{patient.treatmentCoursesSummary.totalCost.toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Total Paid</span>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  ₹{patient.treatmentCoursesSummary.totalPaid.toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Remaining</span>
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  ₹{patient.treatmentCoursesSummary.totalRemaining.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Age</span>
              {patient.age !== undefined ? (
                <p className="text-base font-semibold text-slate-900 dark:text-white">{patient.age} years</p>
              ) : (
                <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  No data
                </span>
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Date of Birth</span>
              {formatDate(patient.dob) !== '-' ? (
                <p className="text-sm font-medium text-slate-900 dark:text-white">{formatDate(patient.dob)}</p>
              ) : (
                <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  No data
                </span>
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Gender</span>
              {patient.gender ? (
                <p className="text-base font-semibold text-slate-900 dark:text-white capitalize">{patient.gender}</p>
              ) : (
                <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  No data
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Phone</span>
              {patient.phone ? (
                <p className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-full text-center">
                  {patient.phone}
                </p>
              ) : (
                <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  No data
                </span>
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Email</span>
              {patient.email ? (
                <p className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-full text-center">
                  {patient.email}
                </p>
              ) : (
                <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  No data
                </span>
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Primary Clinic</span>
              {patient.primaryClinicName ? (
                <p className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-full text-center">
                  {patient.primaryClinicName}
                </p>
              ) : (
                <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  No data
                </span>
              )}
            </div>
          </div>

          {patient.address && (
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Address</span>
              <p className="text-xs font-medium text-slate-900 dark:text-white text-center whitespace-pre-line">
                {patient.address}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Consultation</span>
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
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Total Visits</span>
              {patient.visitCount !== undefined ? (
                <p className="text-base font-semibold text-slate-900 dark:text-white">{patient.visitCount}</p>
              ) : (
                <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  No data
                </span>
              )}
            </div>
          </div>

          {patient.lastVisitAt && formatDate(patient.lastVisitAt) !== '-' && (
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Last Visit</span>
              <p className="text-xs font-medium text-slate-900 dark:text-white">{formatDate(patient.lastVisitAt)}</p>
            </div>
          )}

          {patient.tags && patient.tags.length > 0 && (
            <div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3 block text-center">
                Tags
              </span>
              <div className="flex flex-wrap gap-2 justify-center">
                {patient.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Created At</span>
              <p className="text-xs font-medium text-slate-900 dark:text-white text-center">
                {formatDateTime(patient.createdAt)}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Updated At</span>
              <p className="text-xs font-medium text-slate-900 dark:text-white text-center">
                {formatDateTime(patient.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

