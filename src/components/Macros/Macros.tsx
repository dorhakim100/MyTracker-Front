interface MacrosProps {
  protein: number
  carbs: number
  fats: number
}

export function Macros({ protein, carbs, fats }: MacrosProps) {
  return (
    <div className='macros'>
      <div className='banner carbs'>
        <span className='swatch' />
        <span className='label'>Carbs</span>
        <span className='value'>{carbs.toFixed(1)}g</span>
      </div>
      <div className='banner protein'>
        <span className='swatch' />
        <span className='label'>Protein</span>
        <span className='value'>{protein.toFixed(1)}g</span>
      </div>
      <div className='banner fats'>
        <span className='swatch' />
        <span className='label'>Fats</span>
        <span className='value'>{fats.toFixed(1)}g</span>
      </div>
    </div>
  )
}
