import * as React from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { Set } from '../../types/exercise/Exercise'
import { Badge, DialogActions, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import NoteAltIcon from '@mui/icons-material/NoteAlt'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { CustomAlertDialog } from '../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { useState } from 'react'
import { showErrorMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { instructionsService } from '../../services/instructions/instructions.service'
import { NotesDisplay } from '../NotesDisplay/NotesDisplay'
import { ExpectedActual } from '../../types/expectedActual/ExpectedActual'
import Divider from '@mui/material/Divider'

function Row(props: {
  sets: (Set & { exerciseId: string })[]
  setAlertDialogOptions: (options: {
    open: boolean
    notes: ExpectedActual<string>
    date: string

  }) => void
  divider?: boolean
}) {
  const { sets, setAlertDialogOptions, divider = true } = props
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  async function getNotes(sessionId: string, exerciseId: string) {
    try {
      const notes = await instructionsService.getNotesBySessionIdAndExerciseId(
        sessionId,
        exerciseId
      )
      const date = new Date(sets[0].createdAt || '').toLocaleDateString('he')

      setAlertDialogOptions({ open: true, notes: notes, date: date })
    } catch (err) {
      showErrorMsg(messages.error.getNotes)
    }
  }

  return (
    <React.Fragment>
      <TableRow
        // sx={{ '& > *': { borderBottom: 'unset' } }}
        onClick={() => setOpen(!open)}
        className='pointer'


      >
        <TableCell component='th' scope='row' sx={{ width: '30%' }}>
          {sets[0].createdAt
            ? new Date(sets[0].createdAt).toLocaleDateString('he')
            : ''}
        </TableCell>

        <TableCell align='center' sx={{ width: '25%' }}>
          {
            sets.find(
              (set) =>
                set.weight.actual ===
                Math.max(...sets.map((set) => set.weight.actual))
            )?.weight.actual
          }{' '}
          {t('weight.kg')}
        </TableCell>
        <TableCell align='center' sx={{ width: '25%' }}>
          {
            sets.find(
              (set) =>
                set.reps.actual ===
                Math.max(...sets.map((set) => set.reps.actual))
            )?.reps.actual
          }
        </TableCell>
        <TableCell
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'end',
            // width: '20%',
          }}
        >
          <CustomButton
            icon={<NoteAltIcon />}
            onClick={(ev) => {
              ev.stopPropagation()
              const sessionId = sets[0].sessionId
              if (!sessionId) return showErrorMsg(messages.error.getNotes)
              getNotes(sessionId, sets[0].exerciseId)
            }}
            isIcon={true}
            tooltipTitle={t('exercise.viewNotes')}
          />
          <CustomButton
            icon={open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            isIcon={true}
            tooltipTitle={open ? t('exercise.collapse') : t('exercise.expand')}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          style={{
            paddingBottom: 0,
            paddingTop: 0,
            paddingRight: 0,
            paddingLeft: 0,
          }}
          colSpan={4}
        >
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 0, padding: 1 }}>
              <Table size='small' aria-label='sets' sx={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell align='center' sx={{ width: '30%' }}>{t('exercise.set')}</TableCell>
                    <TableCell align='center' sx={{ width: '25%' }}>{t('exercise.weight')}</TableCell>
                    <TableCell align='center' sx={{ width: '25%' }}>{t('exercise.reps')}</TableCell>
                    <TableCell align='center' sx={{ width: '20%' }}>
                      {sets[0].rpe ? t('exercise.rpe') : t('exercise.rir')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sets
                    .sort((a, b) => (a.setNumber || 0) - (b.setNumber || 0))
                    .map((set) => (
                      <TableRow key={set._id}>
                        <TableCell align='center' sx={{ width: '30%' }}>
                          <Badge
                            badgeContent={set.setNumber}
                            className={prefs.favoriteColor}
                          ></Badge>
                        </TableCell>
                        <TableCell align='center' sx={{ width: '25%' }}>
                          {set.weight.actual} {t('weight.kg')}
                        </TableCell>
                        <TableCell align='center' sx={{ width: '25%' }}>{set.reps.actual}</TableCell>
                        <TableCell align='center' sx={{ width: '20%' }}>
                          {set.rpe?.actual ? set.rpe.actual : set.rir?.actual}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
          {divider && <Divider sx={{ marginInline: '0.5rem' }} className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />}
        </TableCell>
      </TableRow>

    </React.Fragment>
  )
}
export default function SetsTable({
  groupedSets,
}: {
  groupedSets: Record<string, (Set & { exerciseId: string })[]>
}) {
  const { t } = useTranslation()
  const entries = Object.entries(groupedSets)
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const [alertDialogOptions, setAlertDialogOptions] = useState<{
    open: boolean
    notes: ExpectedActual<string>
    date: string
  }>({
    open: false,
    notes: instructionsService.getEmptyExpectedActual(
      'notes'
    ) as ExpectedActual<string>,
    date: '',
  })

  if (groupedSets)
    return (
      <>
        <TableContainer
          component={Paper}
          className={`sets-table ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        >
          <Table aria-label='collapsible table ' sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '30%' }}>{t('exercise.date')}</TableCell>
                <TableCell sx={{ textAlign: 'center', width: '25%' }}>{t('exercise.topWeight')}</TableCell>
                <TableCell sx={{ textAlign: 'center', width: '25%' }}>{t('exercise.topReps')}</TableCell>
                <TableCell sx={{ width: '20%' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.length > 0 ? (
                entries.map(([date, sets], index) => (
                  <React.Fragment key={date}>
                    <Row
                      sets={sets}
                      setAlertDialogOptions={setAlertDialogOptions}
                      divider={index !== entries.length - 1}
                    />

                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant='body1'>
                      {t('exercise.noPastSessionsFound')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <CustomAlertDialog
          open={alertDialogOptions.open}
          onClose={() =>
            setAlertDialogOptions({
              open: false,
              notes: { expected: '', actual: '' },
              date: '',
            })
          }
          title={t('exercise.notes')}
        >
          <NotesDisplay
            notes={alertDialogOptions.notes}
            date={alertDialogOptions.date}
          />

          <DialogActions>
            <CustomButton
              text={t('common.close')}
              onClick={() =>
                setAlertDialogOptions({
                  open: false,
                  notes: { expected: '', actual: '' },
                  date: '',
                })
              }
            />
          </DialogActions>
        </CustomAlertDialog>
      </>
    )
}
