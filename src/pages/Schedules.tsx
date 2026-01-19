import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageHeader from '@components/common/PageHeader'
import DatePicker, { formatDate } from '@components/common/DatePicker'
import calenderIcon from '@assets/calender.png'
import noprofile from '@assets/noprofile.png'
import { useCalendarEntries } from '@hooks/data/useCalendarEntries'
import { useDateCalendar } from '@hooks/data/useDateCalendar'
import { deleteCalendarEntry, deleteAppointment, toggleAppointmentStatus, type Appointment } from '@api/calendarEntries'
import RotatingSpinner from '@components/spinner/TeethRotating'
import ScheduleNewModal from '@components/schedule/ScheduleNewModal'
import DeleteConfirmationModal from '@components/common/DeleteConfirmationModal'
import ConfirmationModal from '@components/common/ConfirmationModal'
import EditTimingModal from '@components/schedule/EditTimingModal'
import AddAppointmentModal from '@components/schedule/AddAppointmentModal'
import { processEscapeSequences } from '@utils/textUtils'

export default function Schedules() {
  const navigate = useNavigate()
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const todayDateStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate())
  const [selectedDate, setSelectedDate] = useState<string | null>(todayDateStr)

  const { calendarDays, isLoading: isLoadingCalendar, refetch: refetchCalendar } =
    useCalendarEntries(currentMonth + 1, currentYear)

  const { data: dateCalendarData, isLoading: isLoadingDateCalendar, refetch: refetchDateCalendar } =
    useDateCalendar(selectedDate)

  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showEditTimingModal, setShowEditTimingModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<{ id: string; clinicId: string } | null>(null)
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null)
  const [appointmentEntryId, setAppointmentEntryId] = useState<string | null>(null)
  const [appointmentClinicId, setAppointmentClinicId] = useState<string | null>(null)
  const [appointmentEntry, setAppointmentEntry] = useState<{
    clinicName: string
    startTime: string
    endTime: string
  } | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<{
    entryId: string
    appointmentIndex: number
    appointment: Appointment
  } | null>(null)
  const [deletingAppointment, setDeletingAppointment] = useState<{
    entryId: string
    appointmentIndex: number
  } | null>(null)
  const [togglingAppointment, setTogglingAppointment] = useState<{
    entryId: string
    appointmentIndex: number
    currentStatus: boolean
  } | null>(null)
  const [showToggleStatusModal, setShowToggleStatusModal] = useState(false)

  const calendarEntriesMap = useMemo(() => {
    const map: Record<string, string[]> = {}
    calendarDays.forEach((day) => {
      map[day.date] = day.clinics
    })
    return map
  }, [calendarDays])

  const isPastDate = useMemo(() => {
    if (!selectedDate) return false
    return selectedDate < todayDateStr
  }, [selectedDate, todayDateStr])

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr)
    setActiveTab(null)
  }

  useEffect(() => {
    if (dateCalendarData?.entries && dateCalendarData.entries.length > 0) {
      if (!activeTab || !dateCalendarData.entries.find((e) => e.id === activeTab)) {
        setActiveTab(dateCalendarData.entries[0].id)
      }
    } else {
      setActiveTab(null)
    }
  }, [dateCalendarData, activeTab])

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleScheduleNewClick = () => {
    setShowScheduleModal(true)
  }

  const handleScheduleSuccess = () => {
    refetchCalendar()
    refetchDateCalendar()
  }

  const handleEditTiming = (entry: { id: string; clinic: { id: string; name: string }; startTime: string; endTime: string; notes: string }) => {
    setEditingEntry({
      id: entry.id,
      clinicId: entry.clinic.id,
    })
    setShowEditTimingModal(true)
  }

  const handleDeleteSchedule = (entryId: string) => {
    setDeletingEntryId(entryId)
    setShowDeleteModal(true)
  }

  const handleAddAppointment = (entryId: string, clinicId: string) => {
    const entry = dateCalendarData?.entries.find((e) => e.id === entryId)
    if (entry) {
      setAppointmentEntryId(entryId)
      setAppointmentClinicId(clinicId)
      setAppointmentEntry({
        clinicName: entry.clinic.name,
        startTime: entry.startTime,
        endTime: entry.endTime,
      })
      setShowAddAppointmentModal(true)
    }
  }

  const handleEditSuccess = () => {
    refetchDateCalendar()
    setShowEditTimingModal(false)
    setEditingEntry(null)
  }

  const handleDeleteSuccess = async () => {
    if (!deletingEntryId) return
    try {
      await deleteCalendarEntry(deletingEntryId)
      toast.success('Schedule deleted successfully')
      refetchCalendar()
      refetchDateCalendar()
      if (activeTab === deletingEntryId) {
        setActiveTab(null)
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to delete schedule. Please try again.'
      toast.error(errorMessage)
    } finally {
      setShowDeleteModal(false)
      setDeletingEntryId(null)
    }
  }

  const handleAddAppointmentSuccess = () => {
    refetchDateCalendar()
    setShowAddAppointmentModal(false)
    setAppointmentEntryId(null)
    setAppointmentClinicId(null)
    setAppointmentEntry(null)
  }

  const handleUpdateAppointment = (entryId: string, appointmentIndex: number, appointment: Appointment) => {
    const entry = dateCalendarData?.entries.find((e) => e.id === entryId)
    if (entry) {
      setEditingAppointment({
        entryId,
        appointmentIndex,
        appointment,
      })
      setAppointmentEntryId(entryId)
      setAppointmentClinicId(entry.clinic.id)
      setAppointmentEntry({
        clinicName: entry.clinic.name,
        startTime: entry.startTime,
        endTime: entry.endTime,
      })
      setShowAddAppointmentModal(true)
    }
  }

  const handleDeleteAppointment = (entryId: string, appointmentIndex: number) => {
    setDeletingAppointment({ entryId, appointmentIndex })
    setShowDeleteModal(true)
  }

  const handleDeleteAppointmentConfirm = async () => {
    if (!deletingAppointment) return
    try {
      await deleteAppointment(deletingAppointment.entryId, deletingAppointment.appointmentIndex)
      toast.success('Appointment deleted successfully')
      refetchDateCalendar()
      setShowDeleteModal(false)
      setDeletingAppointment(null)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to delete appointment. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleChangeStatus = (entryId: string, appointmentIndex: number, currentStatus: boolean) => {
    setTogglingAppointment({ entryId, appointmentIndex, currentStatus })
    setShowToggleStatusModal(true)
  }

  const handleToggleStatusConfirm = async () => {
    if (!togglingAppointment) return
    
    try {
      await toggleAppointmentStatus(togglingAppointment.entryId, togglingAppointment.appointmentIndex)
      
      await refetchDateCalendar()
      
      toast.success(
        `Appointment ${togglingAppointment.currentStatus ? 'marked as pending' : 'marked as completed'} successfully`
      )
      setShowToggleStatusModal(false)
      setTogglingAppointment(null)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to toggle appointment status. Please try again.'
      toast.error(errorMessage)
    }
  }

  const formatDateWithOrdinal = (dateStr: string | null): string => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    const year = date.getFullYear()

    const getOrdinalSuffix = (n: number): string => {
      const s = ['th', 'st', 'nd', 'rd']
      const v = n % 100
      return s[(v - 20) % 10] || s[v] || s[0]
    }

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`
  }


  return (
    <section className="space-y-6">
      <PageHeader
        title="Schedules"
        description="View your scheduled clinics and appointments."
        image={{
          src: calenderIcon,
          alt: 'schedules',
          className: 'w-[120px] h-[120px]',
        }}
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-[40%] lg:sticky lg:top-4 lg:self-start">
          {isLoadingCalendar ? (
            <div className="flex items-center justify-center py-12 rounded-2xl border border-slate-200 bg-slate-50/50 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <RotatingSpinner />
            </div>
          ) : (
            <DatePicker
              selectedDate={selectedDate}
              currentMonth={currentMonth}
              currentYear={currentYear}
              onDateSelect={handleDateSelect}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
              calendarEntries={calendarEntriesMap}
            />
          )}
        </div>

        <div className="w-full lg:w-[60%]">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            {isLoadingDateCalendar ? (
              <div className="flex items-center justify-center py-12">
                <RotatingSpinner fullscreen={false} />
              </div>
            ) : dateCalendarData && dateCalendarData.entries.length > 0 ? (
              <div className="space-y-6">
                {selectedDate && (
                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6 shadow-lg dark:border-slate-800">
                    <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                          {formatDateWithOrdinal(selectedDate)}
                        </h2>
                        {dateCalendarData.entries.length > 0 && (
                          <>
                            <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">
                              -
                            </span>
                            <span className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                              Scheduled Clinics
                            </span>
                          </>
                        )}
                      </div>
                      {!isPastDate && (
                        <button
                          onClick={handleScheduleNewClick}
                          disabled={!selectedDate}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-blue-200 hover:to-blue-300 disabled:opacity-50 disabled:cursor-not-allowed dark:from-blue-800/30 dark:to-blue-700/30 dark:text-slate-200 dark:hover:from-blue-700/40 dark:hover:to-blue-600/40"
                        >
                          Schedule New
                        </button>
                      )}
                    </div>
                      <div className="space-y-2">
                        {dateCalendarData.entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                                {entry.clinic.name}
                              </span>
                              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {entry.startTime} - {entry.endTime}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                  </div>
                )}

                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                  <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 mb-4">
                    {dateCalendarData.entries.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => setActiveTab(entry.id)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          activeTab === entry.id
                            ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        {entry.clinic.name}
                      </button>
                    ))}
                  </div>

                  {activeTab && (
                    <div className="space-y-6">
                      {(() => {
                        const activeEntry = dateCalendarData.entries.find(
                          (entry) => entry.id === activeTab
                        )
                        if (!activeEntry) return null

                        return (
                          <>
                            {activeEntry.notes && (
                              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                                <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                  Notes
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                  {processEscapeSequences(activeEntry.notes)}
                                </p>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-3">
                              <button
                                onClick={() => handleAddAppointment(activeEntry.id, activeEntry.clinic.id)}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-100 to-green-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-green-200 hover:to-green-300 dark:from-green-800/30 dark:to-green-700/30 dark:text-slate-200 dark:hover:from-green-700/40 dark:hover:to-green-600/40"
                              >
                                Add Appointment
                              </button>
                              <button
                                onClick={() => handleEditTiming(activeEntry)}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-blue-200 hover:to-blue-300 dark:from-blue-800/30 dark:to-blue-700/30 dark:text-slate-200 dark:hover:from-blue-700/40 dark:hover:to-blue-600/40"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteSchedule(activeEntry.id)}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-100 to-red-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-red-200 hover:to-red-300 dark:from-red-800/30 dark:to-red-700/30 dark:text-slate-200 dark:hover:from-red-700/40 dark:hover:to-red-600/40"
                              >
                                Delete Schedule
                              </button>
                            </div>
                          </>
                        )
                      })()}

                      <div>
                        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                          Appointments
                        </h3>
                        <div className="space-y-4">
                          {dateCalendarData.entries
                            .find((entry) => entry.id === activeTab)
                            ?.appointments.map((appointment, idx) => {
                              const entryId = activeTab!
                              return (
                                <div
                                  key={idx}
                                  className="relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                                >
                                  {appointment.completed ? (
                                    <div className="absolute left-0 top-0 h-full w-1 bg-green-500 rounded-l"></div>
                                  ) : (
                                    <div className="absolute left-0 top-0 h-full w-1 bg-yellow-500 rounded-l"></div>
                                  )}
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div
                                        onClick={() => navigate(`/patients/${appointment.patient.id}`)}
                                        className="flex items-center gap-3 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                                      >
                                        <img
                                          src={appointment.patient.profilePic || noprofile}
                                          alt={appointment.patient.fullName}
                                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement
                                            target.src = noprofile
                                          }}
                                        />
                                        <div>
                                          <h3 className="font-semibold text-slate-900 dark:text-white">
                                            {appointment.patient.fullName}
                                          </h3>
                                          {appointment.patient.patientId && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                              {appointment.patient.patientId}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="space-y-1 text-sm">
                                        {appointment.patient.email ? (
                                          <p className="text-slate-600 dark:text-slate-400">
                                            📧 {appointment.patient.email}
                                          </p>
                                        ) : (
                                          <p className="text-slate-400 dark:text-slate-500">
                                            📧 No email
                                          </p>
                                        )}
                                        {appointment.patient.mobile ? (
                                          <p className="text-slate-600 dark:text-slate-400">
                                            📞 {appointment.patient.mobile}
                                          </p>
                                        ) : (
                                          <p className="text-slate-400 dark:text-slate-500">
                                            📞 No phone
                                          </p>
                                        )}
                                      </div>
                                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                        {appointment.treatment && (
                                          <p className="text-sm text-slate-600 dark:text-slate-400">
                                            <span className="font-medium">Treatment:</span> {appointment.treatment.name}
                                          </p>
                                        )}
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                          <span className="font-medium">Time:</span> {appointment.startTime || 'N/A'} - {appointment.endTime || 'N/A'}
                                        </p>
                                        {appointment.notes && (
                                          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 whitespace-pre-wrap">
                                            <span className="font-medium">Notes:</span> {processEscapeSequences(appointment.notes)}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                      <button
                                        onClick={() => handleUpdateAppointment(entryId, idx, appointment)}
                                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-blue-200 hover:to-blue-300 dark:from-blue-800/30 dark:to-blue-700/30 dark:text-slate-200 dark:hover:from-blue-700/40 dark:hover:to-blue-600/40"
                                      >
                                        Update
                                      </button>
                                      <button
                                        onClick={() => handleDeleteAppointment(entryId, idx)}
                                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-red-100 to-red-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-red-200 hover:to-red-300 dark:from-red-800/30 dark:to-red-700/30 dark:text-slate-200 dark:hover:from-red-700/40 dark:hover:to-red-600/40"
                                      >
                                        Delete
                                      </button>
                                      <button
                                        onClick={() => handleChangeStatus(entryId, idx, appointment.completed)}
                                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-purple-100 to-purple-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-purple-200 hover:to-purple-300 dark:from-purple-800/30 dark:to-purple-700/30 dark:text-slate-200 dark:hover:from-purple-700/40 dark:hover:to-purple-600/40"
                                      >
                                        {appointment.completed ? 'Mark Pending' : 'Mark Completed'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          {dateCalendarData.entries.find((entry) => entry.id === activeTab)
                            ?.appointments.length === 0 && (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                              No appointments scheduled for this clinic
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : selectedDate ? (
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6 shadow-lg dark:border-slate-800">
                <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatDateWithOrdinal(selectedDate)}
                  </h2>
                  {!isPastDate && (
                    <button
                      onClick={handleScheduleNewClick}
                      disabled={!selectedDate}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-blue-200 hover:to-blue-300 disabled:opacity-50 disabled:cursor-not-allowed dark:from-blue-800/30 dark:to-blue-700/30 dark:text-slate-200 dark:hover:from-blue-700/40 dark:hover:to-blue-600/40"
                    >
                      Schedule New
                    </button>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  No scheduled clinics for this date
                </p>
              </div>
            ) : (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400">
                  Select a date to view scheduled clinics and appointments
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ScheduleNewModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSuccess={handleScheduleSuccess}
        selectedDate={selectedDate}
      />

      {editingEntry && (
        <EditTimingModal
          isOpen={showEditTimingModal}
          onClose={() => {
            setShowEditTimingModal(false)
            setEditingEntry(null)
          }}
          onSuccess={handleEditSuccess}
          entryId={editingEntry.id}
          clinicId={editingEntry.clinicId}
          initialData={dateCalendarData?.entries.find((e) => e.id === editingEntry.id)}
        />
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeletingEntryId(null)
          setDeletingAppointment(null)
        }}
        onConfirm={() => {
          if (deletingAppointment) {
            handleDeleteAppointmentConfirm()
          } else if (deletingEntryId) {
            handleDeleteSuccess()
          }
        }}
        title={deletingAppointment ? "Delete Appointment" : "Delete Schedule"}
        message={deletingAppointment ? "Are you sure you want to delete this appointment? This action cannot be undone." : "Are you sure you want to delete this schedule? This action cannot be undone."}
        confirmText="Delete"
        confirmationWord="delete"
      />

      {appointmentEntryId && appointmentClinicId && appointmentEntry && (
        <AddAppointmentModal
          isOpen={showAddAppointmentModal}
          onClose={() => {
            setShowAddAppointmentModal(false)
            setAppointmentEntryId(null)
            setAppointmentClinicId(null)
            setAppointmentEntry(null)
            setEditingAppointment(null)
          }}
          onSuccess={() => {
            handleAddAppointmentSuccess()
            setEditingAppointment(null)
          }}
          entryId={appointmentEntryId}
          clinicId={appointmentClinicId}
          clinicName={appointmentEntry.clinicName}
          startTime={appointmentEntry.startTime}
          endTime={appointmentEntry.endTime}
          isEditMode={!!editingAppointment}
          appointmentIndex={editingAppointment?.appointmentIndex}
          editData={editingAppointment ? {
            patient: editingAppointment.appointment.patient,
            treatmentId: editingAppointment.appointment.treatmentId,
            startTime: editingAppointment.appointment.startTime,
            endTime: editingAppointment.appointment.endTime,
            notes: editingAppointment.appointment.notes,
          } : undefined}
        />
      )}

      <ConfirmationModal
        isOpen={showToggleStatusModal}
        onClose={() => {
          setShowToggleStatusModal(false)
          setTogglingAppointment(null)
        }}
        onConfirm={handleToggleStatusConfirm}
        title="Toggle Appointment Status"
        message={
          togglingAppointment
            ? `Are you sure you want to mark this appointment as ${togglingAppointment.currentStatus ? 'Pending' : 'Completed'}?`
            : 'Are you sure you want to toggle the appointment status?'
        }
        confirmText={togglingAppointment ? (togglingAppointment.currentStatus ? 'Mark as Pending' : 'Mark as Completed') : 'Confirm'}
        cancelText="Cancel"
        confirmButtonClassName="bg-purple-600 hover:bg-purple-500 dark:bg-purple-500 dark:hover:bg-purple-400"
      />
    </section>
  )
}

