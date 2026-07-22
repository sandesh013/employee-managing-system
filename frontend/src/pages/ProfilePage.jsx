import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DeleteIcon from '@mui/icons-material/Delete'
import DescriptionIcon from '@mui/icons-material/Description'
import FaceIcon from '@mui/icons-material/Face'
import Loader from '../components/Loader'
import Modal from '../components/Modal'
import FaceCapture from '../components/FaceCapture'
import { fetchMyProfile, updateEmployee, enrollFace, removeFace } from '../redux/slices/employeeSlice'
import { fetchMyDocuments, uploadDocument, deleteDocument } from '../redux/slices/documentSlice'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '')

function ProfilePage() {
  const dispatch = useDispatch()
  const { myProfile } = useSelector((state) => state.employees)
  const { mine: documents, status: docStatus } = useSelector((state) => state.documents)
  const { user } = useSelector((state) => state.auth)
  const fileInputRef = useRef(null)
  const [faceModalOpen, setFaceModalOpen] = useState(false)

  // Tracks whether the profile fetch is still in flight, or came back with
  // "no employee record exists for this login" (e.g. an admin-only account).
  const [profileState, setProfileState] = useState('loading') // 'loading' | 'found' | 'not-found'

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  useEffect(() => {
    dispatch(fetchMyProfile()).then((result) => {
      setProfileState(fetchMyProfile.fulfilled.match(result) ? 'found' : 'not-found')
    })
    dispatch(fetchMyDocuments())
  }, [dispatch])

  useEffect(() => {
    if (myProfile) {
      reset({
        phone: myProfile.phone || '',
        address: myProfile.address || '',
        emergencyName: myProfile.emergencyContact?.name || '',
        emergencyRelation: myProfile.emergencyContact?.relation || '',
        emergencyPhone: myProfile.emergencyContact?.phone || '',
      })
    }
  }, [myProfile, reset])

  const onSubmit = async (values) => {
    const result = await dispatch(
      updateEmployee({
        id: myProfile._id,
        payload: {
          phone: values.phone,
          address: values.address,
          emergencyContact: {
            name: values.emergencyName,
            relation: values.emergencyRelation,
            phone: values.emergencyPhone,
          },
        },
      })
    )
    if (updateEmployee.fulfilled.match(result)) toast.success('Profile updated')
    else toast.error(result.payload)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', file.name)
    formData.append('type', 'other')
    const result = await dispatch(uploadDocument(formData))
    if (uploadDocument.fulfilled.match(result)) toast.success('Document uploaded')
    else toast.error(result.payload)
    e.target.value = ''
  }

  const handleDeleteDoc = async (id) => {
    if (!window.confirm('Delete this document?')) return
    const result = await dispatch(deleteDocument(id))
    if (deleteDocument.fulfilled.match(result)) toast.success('Document removed')
    else toast.error(result.payload)
  }

  const handleFaceCapture = async (descriptor) => {
    const result = await dispatch(enrollFace(descriptor))
    if (enrollFace.fulfilled.match(result)) {
      toast.success('Face enrolled — you can now use it for attendance check-in')
      dispatch(fetchMyProfile())
    } else {
      toast.error(result.payload)
    }
    setFaceModalOpen(false)
  }

  const handleRemoveFace = async () => {
    if (!window.confirm('Remove your enrolled face? You can re-enroll any time.')) return
    const result = await dispatch(removeFace())
    if (removeFace.fulfilled.match(result)) {
      toast.success('Face enrollment removed')
      dispatch(fetchMyProfile())
    } else {
      toast.error(result.payload)
    }
  }

  if (profileState === 'loading') return <Loader rows={4} />

  if (profileState === 'not-found') {
    return (
      <div className="card card-hover p-8 text-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">No employee profile linked to this account</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
          {user?.role === 'admin' || user?.role === 'hr'
            ? "Admin/HR login accounts don't automatically get an HR profile. This page is for individual employee details — nothing is wrong with your account."
            : 'Ask an admin to add you as an employee from the Employees page.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{myProfile.employeeId} · {user?.role}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card card-hover p-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Personal details</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
                <input disabled value={myProfile.user?.name || ''} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-sm text-gray-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                <input disabled value={myProfile.user?.email || ''} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-sm text-gray-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Phone</label>
              <input {...register('phone')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Address</label>
              <textarea {...register('address')} rows={2} className="input-field" />
            </div>

            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 pt-2">Emergency contact</h3>
            <div className="grid grid-cols-3 gap-3">
              <input placeholder="Name" {...register('emergencyName')} className="input-field" />
              <input placeholder="Relation" {...register('emergencyRelation')} className="input-field" />
              <input placeholder="Phone" {...register('emergencyPhone')} className="input-field" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="card card-hover p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Documents</h2>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
              >
                <UploadFileIcon fontSize="small" /> Upload
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>

            {docStatus === 'loading' ? (
              <Loader rows={3} />
            ) : documents.length === 0 ? (
              <p className="text-sm text-gray-400">No documents uploaded yet</p>
            ) : (
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li key={doc._id} className="flex items-center justify-between text-sm">
                    <a
                      href={`${API_ORIGIN}${doc.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 truncate"
                    >
                      <DescriptionIcon fontSize="small" /> <span className="truncate">{doc.title}</span>
                    </a>
                    <button onClick={() => handleDeleteDoc(doc._id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 p-1 rounded">
                      <DeleteIcon fontSize="small" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card card-hover p-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Face ID for attendance</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Enroll your face once, then use it to verify yourself at check-in. Works best in good lighting.
            </p>

            {myProfile.faceDescriptor && myProfile.faceDescriptor.length > 0 ? (
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                  <FaceIcon fontSize="small" /> Face enrolled
                </span>
                <button
                  onClick={handleRemoveFace}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                onClick={() => setFaceModalOpen(true)}
                className="btn-primary w-full py-2.5"
              >
                <FaceIcon fontSize="small" /> Enroll my face
              </button>
            )}
          </div>
        </div>
      </div>

      <Modal title="Enroll your face" open={faceModalOpen} onClose={() => setFaceModalOpen(false)}>
        <FaceCapture onCapture={handleFaceCapture} onCancel={() => setFaceModalOpen(false)} />
      </Modal>
    </div>
  )
}

export default ProfilePage
