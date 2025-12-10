import { Typography } from '@mui/material'
import './styles/NotesDisplay.scss'
import { translateService } from '../../services/translate/translate.service'
import { ExpectedActual } from '../../types/expectedActual/ExpectedActual'

export function NotesDisplay({
  notes,
  date,
}: {
  notes: ExpectedActual<string>
  date: string
}) {
  const expectedNotesClass = translateService.isLtrString(notes.expected)
    ? 'english-notes'
    : 'hebrew-notes'
  const actualNotesClass = translateService.isLtrString(notes.actual)
    ? 'english-notes'
    : 'hebrew-notes'
  return (
    <div className='notes-display'>
      <Typography variant='h6' className='bold-header date'>
        {date}
      </Typography>
      <div className='expected-container'>
        <Typography variant='h6' className='bold-header'>
          Expected:
        </Typography>
        <Typography variant='body1' className={expectedNotesClass}>
          {notes.expected}
        </Typography>
      </div>
      <div className='actual-container'>
        <Typography variant='h6' className='bold-header'>
          Actual:
        </Typography>
        <Typography variant='body1' className={actualNotesClass}>
          {notes.actual}
        </Typography>
      </div>
    </div>
  )
}
