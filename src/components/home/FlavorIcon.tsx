import Image from 'next/image'

// Import all the PNG icons
import berryIcon from '@/components/icons/berry-icon.png'
import citrusIcon from '@/components/icons/citrus-icon.png'
import creamIcon from '@/components/icons/cream-icon.png'
import floralIcon from '@/components/icons/floral-icon.png'
import melonIcon from '@/components/icons/melon-icon.png'
import sodaIcon from '@/components/icons/soda-icon.png'
import tropicalIcon from '@/components/icons/tropical-icon.png'
import unflavoredIcon from '@/components/icons/unflavored-icon.png'

type FlavorIconProps = {
  category: string
  size?: number
}

export function FlavorIcon({ category, size = 28 }: FlavorIconProps) {
  const iconMap: Record<string, any> = {
    berry: berryIcon,
    citrus: citrusIcon,
    cream: creamIcon,
    floral: floralIcon,
    melon: melonIcon,
    soda: sodaIcon,
    tropical: tropicalIcon,
    unflavored: unflavoredIcon,
  }

  const iconSrc = iconMap[category.toLowerCase()] || iconMap.unflavored
  const altText = `${category} flavor icon`

  return (
    <div className="flex h-20 w-20 items-center justify-center bg-white">
      <Image
        src={iconSrc}
        alt={altText}
        width={size}
        height={size}
        className="h-12 w-12"
        priority
      />
    </div>
  )
}
