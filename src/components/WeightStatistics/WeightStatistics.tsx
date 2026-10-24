import { useTranslation } from 'react-i18next'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { User } from '../../types/user/User'
import { WeightChart } from '../WeightChart/WeightChart'
import { BottomReachIndicator } from '../BottomReachIndicator/BottomReachIndicator'
import CustomSkeleton from '../../CustomMui/CustomSkeleton/CustomSkeleton'
import { useWeightDays } from '../../hooks/useWeightDays'
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
            </TableRow>
          </TableHead>
          <TableBody>
            {days.map((day) => (
              <TableRow key={day.date}>
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
                    {DASH}
                  </Typography>
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
    </div>
  )
}
