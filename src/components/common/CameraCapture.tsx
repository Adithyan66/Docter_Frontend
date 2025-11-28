import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'

interface CameraCaptureProps {
  onCapture: (file: File) => void
  onClose: () => void
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stopCameraStream = () => {
    const video = videoRef.current
    const stream = streamRef.current

    if (stream) {
      const tracks = stream.getTracks()
      tracks.forEach((track) => {
        if (track.readyState !== 'ended') {
          track.stop()
        }
      })
    }

    if (video) {
      video.pause()
      if (video.srcObject) {
        const videoStream = video.srcObject as MediaStream
        videoStream.getTracks().forEach((track) => {
          if (track.readyState !== 'ended') {
            track.stop()
          }
        })
      }
      video.srcObject = null
      video.load()
    }

    streamRef.current = null
    setIsCapturing(false)
  }

   useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setIsCapturing(true)
        setError(null)
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to access camera. Please check permissions.'
        setError(errorMessage)
        toast.error(errorMessage)
        setIsCapturing(false)
      }
    }

    startCamera()

    return () => {
      const video = videoRef.current
      const stream = streamRef.current

      if (stream) {
        const tracks = stream.getTracks()
        tracks.forEach((track) => {
          if (track.readyState !== 'ended') {
            track.stop()
          }
        })
      }

      if (video) {
        video.pause()
        if (video.srcObject) {
          const videoStream = video.srcObject as MediaStream
          videoStream.getTracks().forEach((track) => {
            if (track.readyState !== 'ended') {
              track.stop()
            }
          })
        }
        video.srcObject = null
        video.load()
      }

      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        stopCameraStream()
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const capturePhoto = () => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      toast.error('Failed to capture image')
      return
    }

    ctx.drawImage(videoRef.current, 0, 0)

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error('Failed to create image')
          return
        }

        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        })

        stopCameraStream()
        onCapture(file)
        onClose()
      },
      'image/jpeg',
      0.9
    )
  }

  const stopCamera = () => {
    stopCameraStream()
    onClose()
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      stopCameraStream()
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl rounded-lg bg-white dark:bg-slate-900">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-slate-900">
          {error ? (
            <div className="flex h-full items-center justify-center text-red-500">
              <div className="text-center">
                <p className="mb-2 text-lg font-semibold">Camera Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="flex items-center justify-between gap-4 p-4">
          <button
            type="button"
            onClick={stopCamera}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={capturePhoto}
            disabled={!isCapturing || !!error}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            Capture Photo
          </button>
        </div>
      </div>
    </div>
  )
}

