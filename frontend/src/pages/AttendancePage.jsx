import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import RoomIcon from '@mui/icons-material/Room'
import FaceIcon from '@mui/icons-material/Face'
import Badge from '../components/Badge'
import Loader from '../components/Loader'
import Modal from '../components/Modal'
import FaceCapture from '../components/FaceCapture'
import {
  checkIn,
  checkOut,
  fetchMyAttendance,
  fetchTeamAttendance,
} from '../redux/slices/attendanceSlice'
import { fetchMyProfile } from '../redux/slices/employeeSlice'
import { getCurrentLocation } from '../utils/geolocation'
import { isFaceMatch } from '../utils/faceapi'

function LocationLink({ location }) {
  if (!location || location.lat == null) return <span className="text-gray-400">—</span>
  return (
    <a
      href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-primary-600 hover:underline"
    >
      <RoomIcon fontSize="inherit" /> View
    </a>
  )
}

function AttendancePage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { myRecords, teamRecords, today, status } = useSelector((state) => state.attendance)
  const { myProfile } = useSelector((state) => state.employees)
  const canViewTeam = ['admin', 'hr', 'manager'].includes(user?.role)
  const [faceModalOpen, setFaceModalOpen] = useState(false)
  const [pendingLocation, setPendingLocation] = useState(null)

  const hasFaceEnrolled = myProfile?.faceDescriptor && myProfile.faceDescriptor.length > 0

  useEffect(() => {
    dispatch(fetchMyAttendance())
    dispatch(fetchMyProfile())
    if (canViewTeam) dispatch(fetchTeamAttendance())
  }, [dispatch, canViewTeam])

  const submitCheckIn = async (extra = {}) => {
    const result = await dispatch(checkIn(extra))
    if (checkIn.fulfilled.match(result)) toast.success('Checked in')
    else toast.error(result.payload)
  }

  const handleCheckIn = async () => {
    const location = await getCurrentLocation()
    setPendingLocation(location)

    if (hasFaceEnrolled) {
      setFaceModalOpen(true)
      return
    }
    submitCheckIn(location || {})
  }

  const handleFaceCapture = async (descriptor) => {
    const matched = isFaceMatch(descriptor, myProfile.faceDescriptor)
    if (!matched) {
      toast.error("Face didn't match your enrolled face. Attendance was not marked — please try again in better lighting.")
      return
    }
    setFaceModalOpen(false)
    toast.success('Face verified')
    submitCheckIn({ ...(pendingLocation || {}), faceVerified: true })
  }

  const handleCheckOut = async () => {
    const location = await getCurrentLocation()
    const result = await dispatch(checkOut(location || {}))
    if (checkOut.fulfilled.match(result)) toast.success('Checked out')
    else toast.error(result.payload)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Attendance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Track your daily check-in and check-out</p>
      </div>

      <div className="card card-hover p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
          <p className="text-gray-800 dark:text-gray-100 font-medium">
            {today?.checkIn ? `Checked in at ${new Date(today.checkIn).toLocaleTimeString()}` : 'Not checked in yet'}
            {today?.checkOut && ` · Checked out at ${new Date(today.checkOut).toLocaleTimeString()}`}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {today?.status && <Badge status={today.status} />}
            {today?.faceVerifiedCheckIn && (
              <span className="inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-300">
                <FaceIcon fontSize="inherit" /> Face verified
              </span>
            )}
          </div>
          {!hasFaceEnrolled && (
            <p className="text-xs text-gray-400 mt-2">
              Tip: enroll your face on the Profile page for verified check-ins.
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCheckIn}
            disabled={!!today?.checkIn}
            className="btn-primary disabled:opacity-40"
          >
            <LoginIcon fontSize="small" /> Check in
          </button>
          <button
            onClick={handleCheckOut}
            disabled={!today?.checkIn || !!today?.checkOut}
            className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-800 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            <LogoutIcon fontSize="small" /> Check out
          </button>
        </div>
      </div>

      <div className="card card-hover overflow-x-auto">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Your history</h2>
        </div>
        {status === 'loading' ? (
          <div className="p-5">
            <Loader rows={4} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Check in</th>
                <th className="px-5 py-3 font-medium">Check out</th>
                <th className="px-5 py-3 font-medium">Hours</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {myRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                    No attendance records yet
                  </td>
                </tr>
              ) : (
                myRecords.map((r) => (
                  <tr key={r._id} className="border-b border-gray-50 dark:border-gray-700 last:border-0">
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{r.date}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                      {r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                      {r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{r.workingHours || '—'}</td>
                    <td className="px-5 py-3 text-xs">
                      <LocationLink location={r.checkInLocation} />
                    </td>
                    <td className="px-5 py-3">
                      <Badge status={r.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {canViewTeam && (
        <div className="card card-hover overflow-x-auto">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Team attendance</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Hours</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {teamRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    No records yet
                  </td>
                </tr>
              ) : (
                teamRecords.slice(0, 20).map((r) => (
                  <tr key={r._id} className="border-b border-gray-50 dark:border-gray-700 last:border-0">
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{r.employee?.user?.name || '—'}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{r.date}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{r.workingHours || '—'}</td>
                    <td className="px-5 py-3 text-xs">
                      <LocationLink location={r.checkInLocation} />
                    </td>
                    <td className="px-5 py-3">
                      <Badge status={r.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal title="Verify your face to check in" open={faceModalOpen} onClose={() => setFaceModalOpen(false)}>
        <FaceCapture onCapture={handleFaceCapture} onCancel={() => setFaceModalOpen(false)} />
      </Modal>
    </div>
  )
}

export default AttendancePage
