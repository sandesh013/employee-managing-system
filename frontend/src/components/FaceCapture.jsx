import { useEffect, useRef, useState } from 'react'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import { loadFaceModels, getFaceDescriptor } from '../utils/faceapi'

// Reusable webcam capture widget. Opens the camera, lets the person line up
// their face, and on "Capture" runs face detection to extract a descriptor.
// Used for both face enrollment (Profile page) and attendance verification.
//
// Props:
//   onCapture(descriptor) — called with a 128-number array on success
//   onCancel() — called if the person backs out
function FaceCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [status, setStatus] = useState('loading') // loading | ready | capturing | no-face | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let cancelled = false

    const start = async () => {
      try {
        await loadFaceModels()
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          // Wait for the video to actually have decoded frame data (non-zero
          // dimensions) before allowing capture — running detection before
          // this is ready is what causes it to hang indefinitely.
          await new Promise((resolve) => {
            const video = videoRef.current
            if (video.readyState >= 2 && video.videoWidth > 0) {
              resolve()
              return
            }
            video.onloadeddata = () => resolve()
          })
        }
        if (!cancelled) setStatus('ready')
      } catch (err) {
        setErrorMsg(
          err.name === 'NotAllowedError'
            ? 'Camera permission was denied. Please allow camera access and try again.'
            : 'Could not access the camera or load face-detection models.'
        )
        setStatus('error')
      }
    }

    start()

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const handleCapture = async () => {
    if (!videoRef.current) return
    setStatus('capturing')
    try {
      // Race against a timeout — detection should take well under a second;
      // if something's wrong with the camera feed or the models, fail loudly
      // instead of leaving the button stuck on "Analyzing..." forever.
      const descriptor = await Promise.race([
        getFaceDescriptor(videoRef.current),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
      ])
      if (!descriptor) {
        setStatus('no-face')
        return
      }
      setStatus('ready')
      onCapture(descriptor)
    } catch (err) {
      setErrorMsg('Face detection timed out. Please check your connection and try again.')
      setStatus('error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
        {status === 'error' ? (
          <p className="text-sm text-red-400 p-6 text-center">{errorMsg}</p>
        ) : (
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
        )}
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 text-sm text-gray-300">
            Loading camera and face-detection models...
          </div>
        )}
      </div>

      {status === 'no-face' && (
        <p className="text-xs text-amber-500">
          No face detected — make sure you're centered in frame with good lighting, then try again.
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCapture}
          disabled={status !== 'ready' && status !== 'no-face'}
          className="btn-primary flex-1 py-2.5 disabled:opacity-50"
        >
          <CameraAltIcon fontSize="small" />
          {status === 'capturing' ? 'Analyzing...' : 'Capture'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary px-4 py-2.5"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default FaceCapture
