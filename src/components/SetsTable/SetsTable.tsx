import * as React from 'react'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
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
import { Badge, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

function Row(props: { sets: Set[] }) {
  const { sets } = props
  const [open, setOpen] = React.useState(false)
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  return (
    <React.Fragment>
      <TableRow
        sx={{ '& > *': { borderBottom: 'unset' } }}
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
        <TableCell>
          <IconButton aria-label='expand row' size='small'>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
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
  groupedSets: Record<string, Set[]>
}) {
  const entries = Object.entries(groupedSets)
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  if (groupedSets)
    return (
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
          {entries.length > 0 ? (
            entries.map(([date, sets]) => (
              <React.Fragment key={date}>
                <Row sets={sets} />
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4}>
                <Typography variant='body1'>No past sessions found</Typography>
              </TableCell>
            </TableRow>
          )}
        </Table>
      </TableContainer>
    )
}
