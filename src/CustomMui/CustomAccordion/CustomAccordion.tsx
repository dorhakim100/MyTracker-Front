import React from 'react'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

export interface CustomAccordionProps {
  title: React.ReactNode
  cmp: React.ReactNode
  className?: string
  defaultExpanded?: boolean
  expanded?: boolean
  onChange?: (event: React.SyntheticEvent, isExpanded: boolean) => void
  disableGutters?: boolean
  square?: boolean
  icon?: React.ReactNode
}

export function CustomAccordion({
  title,
  cmp,
  className,
  defaultExpanded,
  expanded,
  onChange,
  disableGutters,
  square,
  icon,
}: CustomAccordionProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const summaryId = React.useId()

  // expanded and onChange must be provided together
  const isControlled =
    typeof expanded === 'boolean' && typeof onChange === 'function'

  // Memoize props to ensure they're stable and don't cause re-renders
  const accordionProps = React.useMemo(() => {
    if (isControlled) {
      // Controlled mode: always pass both expanded and onChange
      return {
        expanded: expanded as boolean,
        onChange: onChange as (
          event: React.SyntheticEvent,
          isExpanded: boolean
        ) => void,
      }
    } else if (defaultExpanded !== undefined) {
      // Uncontrolled mode: only pass defaultExpanded
      return { defaultExpanded }
    }
    // No props - let Accordion use its defaults
    return {}
  }, [isControlled, expanded, onChange, defaultExpanded])

  return (
    <div
      className={`custom-accordion ${className ? className : ''}
    ${prefs.isDarkMode ? 'dark-mode' : ''}
    ${prefs.favoriteColor ? prefs.favoriteColor : ''}
    `}
    >
      <Accordion
        className={`${prefs.isDarkMode ? 'dark-mode' : ''} ${
          prefs.favoriteColor ? prefs.favoriteColor : ''
        }`}
        disableGutters={disableGutters}
        square={square}
        {...accordionProps}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${summaryId}-content`}
          id={`${summaryId}-header`}
        >
          <span className="accordion-icon">{icon}</span>
          {typeof title === 'string' ? (
            <Typography className="bold-header">{title}</Typography>
          ) : (
            title
          )}
        </AccordionSummary>
        <AccordionDetails>
          <div className="accordion-content">{cmp}</div>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}
