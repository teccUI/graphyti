import { useEffect, type ReactNode } from 'react'
import { useCoordinateInspection } from '../hooks/useCoordinateInspection'

interface CanvasWrapperProps {
  children: ReactNode
}

const CanvasWrapper = ({ children }: CanvasWrapperProps) => {
  const { enableInspection } = useCoordinateInspection()

  useEffect(() => {
    // Enable coordinate inspection when component mounts
    const cleanup = enableInspection()
    return cleanup
  }, [enableInspection])

  return <>{children}</>
}

export default CanvasWrapper