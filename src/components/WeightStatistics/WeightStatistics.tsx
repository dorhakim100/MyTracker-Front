import { useTranslation } from 'react-i18next'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { useState } from 'react'
import { Typography } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { User } from '../../types/user/User'
import { WeightChart } from '../WeightChart/WeightChart'
import { BottomReachIndicator } from '../BottomReachIndicator/BottomReachIndicator'
import CustomSkeleton from '../../CustomMui/CustomSkeleton/CustomSkeleton'
import { useWeightDays } from '../../hooks/useWeightDays'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { WeightDetails } from './WeightDetails/WeightDetails'
import { weightStatisticsNs } from './locals'
import './locals'

const DASH = '-'

function formatDay(createdAt: number) {
  return new Date(createdAt).toLocaleDateString('he')
}

export function WeightStatistics({ user }: { user: User }) {
  const { t } = useTranslation()
  const { t: tStats } = useTranslation(weightStatisticsNs)
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const {
    days,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useWeightDays(user._id)
  const [openDate, setOpenDate] = useState<string | null>(null)
  const openDay = days.find((day) => day.date === openDate)

  return (
    <div className='weight-statistics-container'>
      <WeightChart sentUser={user} />

      <Typography
        variant='h5'
        className='days-title bold-header'
      >
        {t('weight.weightHistory')}
      </Typography>

      {isLoading ? (
        <div className='days-loading'>
          <CustomSkeleton
            variant='rounded'
            height={44}
            isDarkMode={prefs.isDarkMode}
          />
          <CustomSkeleton
            variant='rounded'
            height={44}
            isDarkMode={prefs.isDarkMode}
          />
          <CustomSkeleton
            variant='rounded'
            height={44}
            isDarkMode={prefs.isDarkMode}
          />
        </div>
      ) : isError || days.length === 0 ? (
        <Typography
          variant='body2'
          className='days-empty'
        >
          {isError ? tStats('loadError') : tStats('empty')}
        </Typography>
      ) : (
        <Table className='days-table'>
          <TableHead>
            <TableRow className='days-header'>
              <TableCell align='left'>{t('date.date')}</TableCell>
              <TableCell align='center'>{t('weight.weight')}</TableCell>
              <TableCell align='center'>
                {t('bodyFat.detailsBodyFat')}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {days.map((day) => (
              <TableRow
                key={day.date}
                className='day-row'
                onClick={() => setOpenDate(day.date)}
              >
                <TableCell align='left'>
                  <Typography
                    variant='body2'
                    className='day-value'
                  >
                    {formatDay(day.weight.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell align='center'>
                  <Typography
                    variant='body2'
                    className='day-value'
                  >
                    {typeof day.weight.kg === 'number' ? (
                      <>
                        {day.weight.kg}
                        <span className='day-unit'>{t('weight.kg')}</span>
                      </>
                    ) : (
                      DASH
                    )}
                  </Typography>
                </TableCell>
                <TableCell align='center'>
                  <Typography
                    variant='body2'
                    className='day-value'
                  >
                    {typeof day.weight.bodyFat === 'number' ? (
                      <>
                        {day.weight.bodyFat}
                        <span className='day-unit'>%</span>
                      </>
                    ) : (
                      DASH
                    )}
                  </Typography>
                </TableCell>
                <TableCell align='center'>
                  <ChevronRightIcon
                    className='day-chevron'
                    fontSize='small'
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <BottomReachIndicator
        hasMore={Boolean(hasNextPage)}
        isLoading={isFetchingNextPage}
        onReachBottom={() => {
          fetchNextPage()
        }}
      />

      <SlideDialog
        open={Boolean(openDate)}
        onClose={() => setOpenDate(null)}
        type='full'
        title={openDate ? formatDay(dayStartMs(openDate)) : ''}
        component={
          openDate ? (
            <WeightDetails
              key={openDate}
              user={user}
              date={openDate}
              initialWeight={openDay?.weight}
              onDeleted={() => setOpenDate(null)}
            />
          ) : (
            <></>
          )
        }
      />
    </div>
  )
}

function dayStartMs(date: string) {
  return new Date(`${date}T00:00:00.000Z`).getTime()
}
