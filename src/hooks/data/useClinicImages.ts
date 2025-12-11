import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getClinicImages } from '@api/clinics'
import type { GalleryItem } from '@components/common/Gallery'

export function useClinicImages(clinicId: string | undefined, limit: number = 20) {
  const [images, setImages] = useState<GalleryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchImages = async (page: number = 1) => {
    if (!clinicId) return

    try {
      setIsLoading(true)
      const response = await getClinicImages(clinicId, { page, limit })
      
      const galleryItems: GalleryItem[] = response.images.map((imageUrl: string, index: number) => ({
        imageUrl,
        alt: `Clinic image ${index + 1}`,
      }))

      setImages(galleryItems)
      setCurrentPage(response.page)
      setTotalPages(response.totalPages)
      setTotal(response.total)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to fetch images. Please try again.'
      toast.error(errorMessage)
      setImages([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchImages(1)
  }, [clinicId])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchImages(page)
  }

  return {
    images,
    isLoading,
    currentPage,
    totalPages,
    total,
    limit,
    handlePageChange,
    refetch: () => fetchImages(currentPage),
  }
}
