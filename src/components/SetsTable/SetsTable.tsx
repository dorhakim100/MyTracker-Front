import * as React from 'react'
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

function Row(props: {
  sets: (Set & { exerciseId: string })[]
  setAlertDialogOptions: (options: {
    open: boolean
    notes: ExpectedActual<string>
    date: string
  }) => void
}) {
  const { sets, setAlertDialogOptions } = props
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
      >
        <TableCell component='th' scope='row'>
          {sets[0].createdAt
            ? new Date(sets[0].createdAt).toLocaleDateString('he')
            : ''}
        </TableCell>

        <TableCell align='center'>
          {
            sets.find(
              (set) =>
                set.weight.actual ===
                Math.max(...sets.map((set) => set.weight.actual))
            )?.weight.actual
          }{' '}
          kg
        </TableCell>
        <TableCell align='center'>
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
            justifyContent: 'center',
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
          />
          <CustomButton
            icon={open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            isIcon={true}
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
          colSpan={6}
        >
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 0, padding: 1 }}>
              <Table size='small' aria-label='purchases'>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'>Set</TableCell>
                    <TableCell align='center'>Weight</TableCell>
                    <TableCell align='center'>Reps</TableCell>
                    <TableCell align='center'>
                      {sets[0].rpe ? 'RPE' : 'RIR'}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sets
                    .sort((a, b) => (a.setNumber || 0) - (b.setNumber || 0))
                    .map((set) => (
                      <TableRow key={set._id}>
                        <TableCell align='center'>
                          <Badge
                            badgeContent={set.setNumber}
                            className={prefs.favoriteColor}
                          ></Badge>
                        </TableCell>
                        <TableCell align='center'>
                          {set.weight.actual} kg
                        </TableCell>
                        <TableCell align='center'>{set.reps.actual}</TableCell>
                        <TableCell align='center'>
                          {set.rpe?.actual ? set.rpe.actual : set.rir?.actual}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
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
          <Table aria-label='collapsible table'>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Top weight</TableCell>
                <TableCell>Top Reps</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.length > 0 ? (
                entries.map(([date, sets]) => (
                  <React.Fragment key={date}>
                    <Row
                      sets={sets}
                      setAlertDialogOptions={setAlertDialogOptions}
                    />
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant='body1'>
                      No past sessions found
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
          title='Notes'
        >
          <NotesDisplay
            notes={alertDialogOptions.notes}
            date={alertDialogOptions.date}
          />

          <DialogActions>
            <CustomButton
              text='Close'
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
