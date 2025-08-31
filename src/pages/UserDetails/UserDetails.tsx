import { Button } from '@mui/material'
import { logout } from '../../store/actions/user.actions'

export function UserDetails() {
  return (
    <section className='user-details'>
      <h2>User Details</h2>
      <Button variant='contained' color='primary' onClick={() => logout()}>
        Logout
      </Button>
    </section>
  )
}
