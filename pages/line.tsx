import { FC } from 'react'
import dynamic from 'next/dynamic'
const Share = dynamic(() => import('./components/Share'), { ssr: false })

const line: FC = () => {
  return (
    <Share></Share>
  )
}

export default line