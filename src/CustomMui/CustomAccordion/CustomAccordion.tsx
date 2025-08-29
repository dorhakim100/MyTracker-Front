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
  disableGutters?: boolean
  square?: boolean
}

export function CustomAccordion({
  title,
  cmp,
  className,
  defaultExpanded,
  disableGutters,
  square,
}: CustomAccordionProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const summaryId = React.useId()

  return (
    <div
      className={`custom-accordion ${className ? className : ''}
    ${prefs.isDarkMode ? 'dark-mode' : ''}
    `}
    >
      <Accordion
        className={prefs.isDarkMode ? 'dark-mode' : ''}
        defaultExpanded={defaultExpanded}
        disableGutters={disableGutters}
        square={square}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${summaryId}-content`}
          id={`${summaryId}-header`}
        >
          {typeof title === 'string' ? <Typography>{title}</Typography> : title}
        </AccordionSummary>
        <AccordionDetails>
          <div className='accordion-content'>{cmp}</div>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}
