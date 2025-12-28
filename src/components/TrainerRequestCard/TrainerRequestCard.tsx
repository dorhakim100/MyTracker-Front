import { useSelector } from 'react-redux'
import { Avatar, Card, Typography } from '@mui/material'
import { RootState } from '../../store/store'
import { TrainerRequest } from '../../types/trainerRequest/TrainerRequest'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { Chip } from '@mui/material'

import {
  PENDING_STATUS,
  APPROVED_STATUS,
  REJECTED_STATUS,
} from '../../assets/config/request-statuses'

export interface TrainerRequestCardProps {
  request: TrainerRequest
  onAccept?: (request: TrainerRequest) => void
  onReject?: (request: TrainerRequest) => void
}

export function TrainerRequestCard({
  request,
  onAccept,
  onReject,
}: TrainerRequestCardProps) {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const displayName = request.trainer?.details?.fullname || 'Unknown User'
  const displayEmail = request.trainer?.email || ''
  const displayImage = request.trainer?.details?.imgUrl || ''

  const handleAccept = () => {
    if (onAccept) {
      onAccept(request)
    }
  }

  const handleReject = () => {
    if (onReject) {
      onReject(request)
    }
  }

  const getStatusChip = () => {
    switch (request.status) {
      case APPROVED_STATUS:
        return <Chip label="Accepted" color="success" size="small" />
      case REJECTED_STATUS:
        return <Chip label="Rejected" color="error" size="small" />
      case PENDING_STATUS:
        return <Chip label="Pending" color="warning" size="small" />
      default:
        return null
    }
  }

  return (
    <>
      <Typography variant="h6" className="bold-header trainer-requests-header">
        Trainer Requests
      </Typography>
      <Card
        className={`trainer-request-card ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
        elevation={0}
      >
        <div className="trainer-request-card-content">
          <div className="trainer-request-card-header">
            <Avatar
              src={displayImage}
              alt={displayName}
              className="trainer-request-avatar"
            >
              {displayName}
            </Avatar>
            <div className="trainer-request-info">
              <Typography variant="subtitle1" className="trainer-request-name">
                {displayName}
              </Typography>
              {displayEmail && (
                <Typography variant="body2" className="trainer-request-email">
                  {displayEmail}
                </Typography>
              )}
            </div>
          </div>

          {request.status === PENDING_STATUS ? (
            <div className="trainer-request-actions">
              <CustomButton
                text="Reject"
                icon={<CloseIcon />}
                onClick={handleReject}
                className="reject-button red"
                size="small"
              />
              <CustomButton
                text="Accept"
                icon={<CheckIcon />}
                onClick={handleAccept}
                className="accept-button primary"
                size="small"
              />
            </div>
          ) : (
            <div className="trainer-request-status">{getStatusChip()}</div>
          )}
        </div>
      </Card>{' '}
    </>
  )
}
