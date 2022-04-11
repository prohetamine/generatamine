import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const useNormalizePath = () => {
  const location = useLocation()
      , navigate = useNavigate()

  useEffect(() => {
    const pathname = location.pathname
    if (
      pathname.match('/hash/') ||
      pathname.match('/query/') ||
      pathname.match('/equally/') ||
      pathname.match('/and/')
    ) {
      navigate(
        pathname
          .replace(/\/hash\//gi, '#')
          .replace(/\/query\//gi, '?')
          .replace(/\/equally\//gi, '=')
          .replace(/\/and\//gi, '&')
          .replace(/\/$/, '')
      )
    }
  }, [location, navigate])
}

export default useNormalizePath
