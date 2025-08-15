interface MacrosProps {
  protein: number
  carbs: number
  fats: number
}

export function Macros({ protein, carbs, fats }: MacrosProps) {
  return (
    <div className='macros'>
      <div className='macro protein'>
        <span className='swatch' />
        <span className='label'>Protein</span>
        <span className='value'>{protein}g</span>
      </div>
      <div className='macro carbs'>
        <span className='swatch' />
        <span className='label'>Carbs</span>
        <span className='value'>{carbs}g</span>
      </div>
      <div className='macro fats'>
        <span className='swatch' />
        <span className='label'>Fats</span>
        <span className='value'>{fats}g</span>
      </div>
    </div>
  )
}
