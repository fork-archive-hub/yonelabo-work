import { FC } from 'react'
import dynamic from 'next/dynamic'
const Line = dynamic(() => import('./components/Line'), { ssr: false })

const line: FC = () => {
  return (
    <Line></Line>
  )
}

export default line