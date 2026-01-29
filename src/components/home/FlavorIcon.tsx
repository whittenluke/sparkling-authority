import Image from 'next/image'

// Import all the PNG icons
import appleIcon from '@/components/icons/apple-icon.png'
import berryIcon from '@/components/icons/berry-icon.png'
import citrusIcon from '@/components/icons/citrus-icon.png'
import creamIcon from '@/components/icons/cream-icon.png'
import floralIcon from '@/components/icons/floral-icon.png'
import grapeIcon from '@/components/icons/grape-icon.png'
import herbalIcon from '@/components/icons/herbal-icon.png'
import melonIcon from '@/components/icons/melon-icon.png'
import sodaIcon from '@/components/icons/soda-icon.png'
import spicyIcon from '@/components/icons/spicy-icon.png'
import stoneFruitIcon from '@/components/icons/stone-fruit-icon.png'
import teaIcon from '@/components/icons/tea-icon.png'
import tropicalIcon from '@/components/icons/tropical-icon.png'
import unflavoredIcon from '@/components/icons/unflavored-icon.png'

type FlavorIconProps = {
  category: string
  size?: number
}

type IconType = {
  src: string
  height: number
  width: number
  blurDataURL?: string
}

export function FlavorIcon({ category, size = 28 }: FlavorIconProps) {
  const iconMap: Record<string, IconType> = {
    apple: appleIcon,
    berry: berryIcon,
    citrus: citrusIcon,
    cream: creamIcon,
    floral: floralIcon,
    grape: grapeIcon,
    herbal: herbalIcon,
    melon: melonIcon,
    soda: sodaIcon,
    spicy: spicyIcon,
    'stone fruit': stoneFruitIcon,
    tea: teaIcon,
    tropical: tropicalIcon,
    unflavored: unflavoredIcon,
  }

  const iconSrc = iconMap[category.toLowerCase()] || iconMap.unflavored
  const altText = `${category} flavor icon`

  return (
    <div className="flex h-20 w-20 items-center justify-center bg-white dark:rounded-xl">
      <Image
        src={iconSrc}
        alt={altText}
        width={size}
        height={size}
        className="h-14 w-14"
        priority
      />
    </div>
  )
}
