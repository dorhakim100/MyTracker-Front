import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import { RootState } from '../../store/store'
import { useSelector } from 'react-redux'

export function LanguageSwitch({
  onClick,
  checked,
}: {
  onClick: () => void
  checked: boolean
}) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )
  const isRtl = prefs.lang === 'he'
  return (
    <Box
      component='label'
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        cursor: 'pointer',
      }}
    >
      {!isRtl ? (
        <span>{checked ? t('prefs.hebrew') : t('prefs.english')}</span>
      ) : (
        <span>{checked ? t('prefs.english') : t('prefs.hebrew')}</span>
      )}
      <Switch
        checked={checked}
        onChange={() => onClick()}
        className={`language-switch ${prefs.favoriteColor}`}
        size='medium'
        inputProps={{
          'aria-label': checked ? t('prefs.english') : t('prefs.hebrew'),
        }}
      />
      {isRtl ? (
        <span>{checked ? t('prefs.hebrew') : t('prefs.english')}</span>
      ) : (
        <span>{checked ? t('prefs.english') : t('prefs.hebrew')}</span>
      )}
    </Box>
  )
}
