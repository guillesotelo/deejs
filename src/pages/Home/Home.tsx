import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout/Layout'

type Props = {}

export default function Home({ }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => window.innerWidth <= 768
    setIsMobile(checkMobile())
    window.addEventListener("resize", () => setIsMobile(checkMobile()))
    return () => window.removeEventListener("resize", () => setIsMobile(checkMobile()))
  }, [])

  return (
    <div className={`home__container${isMobile ? '--rotated' : ''}`}>
      <Layout />
    </div>
  )
}