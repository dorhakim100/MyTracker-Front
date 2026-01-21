import { Button } from '@mui/material'
import { motion } from 'framer-motion'
import CheckIcon from '@mui/icons-material/Check'

const colors = {
  primary: '--var(--primary-color)',
  blue: '--var(--picker-color-blue)',
  yellow: '--var(--picker-color-yellow)',
  red: '--var(--picker-color-red)',
  orange: '--var(--picker-color-orange)',
  green: '--var(--picker-color-green)',
  deepPurple: '--var(--picker-color-deep-purple)',
  purple: '--var(--picker-color-purple)',
  pink: '--var(--picker-color-pink)',
}

const colorChoices = Object.keys(colors)

interface ColorPickerProps {
  pickedColor: string
  onColorPick: (color: string) => void
}

export function ColorPicker({ pickedColor, onColorPick }: ColorPickerProps) {
  return (
    <div className="color-options">
      {colorChoices.map((color) => (
        <Button
          key={`${color}-color-button`}
          className={`color-button ${color} ${
            pickedColor === color ? 'selected' : ''
          }`}
          onClick={() => onColorPick(color)}
          sx={{
            minWidth: '30px',
            minHeight: '30px',
          }}
        >
          <ColorMotion color={color} pickedColor={pickedColor} />
        </Button>
      ))}
    </div>
  )
}

function ColorMotion({
  color,
  pickedColor,
}: {
  color: string
  pickedColor: string
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.8 }}
      animate={color === pickedColor ? { scale: [1, 1.3, 1] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      className="motion-container"
    >
      {color === pickedColor ? <CheckIcon /> : null}
    </motion.div>
  )
}
