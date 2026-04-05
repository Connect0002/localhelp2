const COLORS = [
  '#D95F02','#7C3AED','#0F766E','#BE185D',
  '#1D4ED8','#15803D','#92400E','#0369A1',
  '#B45309','#6D28D9','#047857','#9D174D',
]

function stringToColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

interface AvatarProps {
  name: string
  avatarUrl?: string | null
  size?: number
  fontSize?: number
}

export default function Avatar({ name, avatarUrl, size = 48, fontSize }: AvatarProps) {
  const fs = fontSize ?? Math.round(size * 0.33)
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, background: stringToColor(name), fontSize: fs }}
    >
      {getInitials(name)}
    </div>
  )
}
