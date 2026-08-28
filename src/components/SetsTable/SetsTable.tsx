import * as React from 'react'
import { useTranslation } from 'react-i18next'
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
import { instructionsService } from '../../services/instructions/instructions.service'
import { NotesDisplay } from '../NotesDisplay/NotesDisplay'
import { ExpectedActual } from '../../types/expectedActual/ExpectedActual'
import Divider from '@mui/material/Divider'
import { AnimatedWrapper } from '../AnimatedWrapper/AnimatedWrapper'
import { capacitorService } from '../../services/capacitor.service'
import {
  ExerciseViewBy,
  getPickMetric,
  pickBestSet,
} from '../../services/set/set.helpers'

function Row(props: {
  sets: (Set & { exerciseId: string })[]
  mainValue: ExerciseViewBy
  setAlertDialogOptions: (options: {
    open: boolean
    notes: ExpectedActual<string>
    date: string
  }) => void
  divider?: boolean
}) {
  const { sets, mainValue, setAlertDialogOptions, divider = true } = props
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const bestSet = pickBestSet(sets, getPickMetric(mainValue))

  async function getNotes(sessionId: string, exerciseId: string) {
    try {
      const notes = await instructionsService.getNotesBySessionIdAndExerciseId(
        sessionId,
        exerciseId
      )
      const date = new Date(sets[0].createdAt || '').toLocaleDateString('he')

      setAlertDialogOptions({ open: true, notes: notes, date: date })
    } catch {
      showErrorMsg(t('messages.error.getNotes'))
    }
  }

  return (
    <React.Fragment>
      <AnimatedWrapper
        as='tr'
        // sx={{ '& > *': { borderBottom: 'unset' } }}
        onClick={async () => {
          const stateToSet = !open

          setOpen(stateToSet)
          if (stateToSet) capacitorService.vibrate('Light')
        }}
        className={`pointer session-row ${prefs.isDarkMode ? 'dark-mode' : ''}`}
      >
        <TableCell
          component='th'
          scope='row'
          sx={{ width: '26%', textAlign: 'start' }}
        >
          <Typography
            variant='body2'
            className='bold-header'
          >
            {sets[0].createdAt
              ? new Date(sets[0].createdAt).toLocaleDateString('he')
              : ''}
          </Typography>
        </TableCell>

        <TableCell
          align='center'
          sx={{ width: '22%' }}
        >
          <Typography
            variant='body2'
            className='bold-header'
          >
            {bestSet?.weight.actual} {t('weight.kg')}
          </Typography>
        </TableCell>
        <TableCell
          align='center'
          sx={{ width: '22%' }}
        >
          <Typography
            variant='body2'
            className='bold-header'
          >
            {bestSet?.reps.actual}
          </Typography>
        </TableCell>
        <TableCell
          className='session-row-actions-cell'
          sx={{ width: '30%' }}
        >
          <div className='session-row-actions'>
            <CustomButton
              icon={<NoteAltIcon />}
              onClick={(ev) => {
                ev.stopPropagation()
                const sessionId = sets[0].sessionId
                if (!sessionId)
                  return showErrorMsg(t('messages.error.getNotes'))
                getNotes(sessionId, sets[0].exerciseId)
              }}
              isIcon={true}
              tooltipTitle={t('exercise.viewNotes')}
            />
            <CustomButton
              icon={open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              isIcon={true}
              tooltipTitle={
                open ? t('exercise.collapse') : t('exercise.expand')
              }
            />
          </div>
        </TableCell>
      </AnimatedWrapper>
      <AnimatedWrapper as='tr'>
        <TableCell
          style={{
            paddingBottom: 0,
            paddingTop: 0,
            paddingRight: 0,
            paddingLeft: 0,
          }}
          colSpan={4}
        >
          <Collapse
            in={open}
            timeout='auto'
            unmountOnExit
          >
            <div className='session-sets'>
              <Table
                size='small'
                aria-label='sets'
                sx={{ tableLayout: 'fixed', width: '100%' }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      align='center'
                      sx={{ width: '26%' }}
                    >
                      {t('exercise.set')}
                    </TableCell>
                    <TableCell
                      align='center'
                      sx={{ width: '22%' }}
                    >
                      {t('exercise.weight')}
                    </TableCell>
                    <TableCell
                      align='center'
                      sx={{ width: '22%' }}
                    >
                      {t('exercise.reps')}
                    </TableCell>
                    <TableCell
                      align='center'
                      sx={{ width: '30%' }}
                    >
                      {sets[0].rpe ? t('exercise.rpe') : t('exercise.rir')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sets
                    .sort((a, b) => (a.setNumber || 0) - (b.setNumber || 0))
                    .map((set) => (
                      <TableRow key={set._id}>
                        <TableCell
                          align='center'
                          sx={{ width: '26%' }}
                        >
                          <Badge
                            badgeContent={set.setNumber}
                            className={prefs.favoriteColor}
                          ></Badge>
                        </TableCell>
                        <TableCell
                          align='center'
                          sx={{ width: '22%' }}
                        >
                          {set.weight.actual} {t('weight.kg')}
                        </TableCell>
                        <TableCell
                          align='center'
                          sx={{ width: '22%' }}
                        >
                          {set.reps.actual}
                        </TableCell>
                        <TableCell
                          align='center'
                          sx={{ width: '30%' }}
                        >
                          {set.rpe?.actual ? set.rpe.actual : set.rir?.actual}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </Collapse>
          {divider && (
            <Divider
              sx={{ marginInline: '0.5rem' }}
              className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
            />
          )}
        </TableCell>
      </AnimatedWrapper>
    </React.Fragment>
  )
}
export default function SetsTable({
  groupedSets,
  mainValue = 'weight',
}: {
  groupedSets: Record<string, (Set & { exerciseId: string })[]>
  mainValue?: ExerciseViewBy
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
          <Table
            aria-label='collapsible table '
            sx={{ tableLayout: 'fixed' }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '26%', textAlign: 'start' }}>
                  {t('exercise.date')}
                </TableCell>
                <TableCell sx={{ textAlign: 'center', width: '22%' }}>
                  {t('exercise.weight')}
                </TableCell>
                <TableCell sx={{ textAlign: 'center', width: '22%' }}>
                  {t('exercise.reps')}
                </TableCell>
                <TableCell sx={{ width: '30%' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.length > 0 ? (
                entries.map(([date, sets], index) => (
                  <React.Fragment key={date}>
                    <Row
                      sets={sets}
                      mainValue={mainValue}
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
