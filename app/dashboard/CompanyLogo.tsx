import { useState } from 'react'
import Image from 'next/image'

interface CompanyLogoProps {
  companyName: string
}

export default function CompanyLogo({ companyName }: CompanyLogoProps) {
  const [imgSrc, setImgSrc] = useState(
    `https://logo.clearbit.com/${companyName.toLowerCase().replace(/\s+/g, '')}.com`
  )

  return (
    <Image
      src={imgSrc}
      alt={`${companyName} logo`}
      width={24}
      height={24}
      className="rounded-full object-contain"
      onError={() => setImgSrc('/comp.svg')}
      unoptimized
    />
  )
}
