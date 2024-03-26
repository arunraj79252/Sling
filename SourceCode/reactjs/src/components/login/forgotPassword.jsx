import React, { useState } from 'react'
import axios from 'axios'
import DraftsIcon from '@mui/icons-material/Drafts'
import Button from '@material-ui/core/Button'
import { Container } from '@mui/system'
import { Box, Card} from '@mui/material'
import AuthInput from '../layout/authInput'
import { useForm } from 'react-hook-form'
import Swal from 'sweetalert2'

const { REACT_APP_API_ENDPOINT } = process.env

function ForgotPassword () {
  const { register, handleSubmit } = useForm()

  
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)

  const submit = handleSubmit(data => {
    setIsLoading(true)
    setIsSuccess(false)
    setIsError(false)

    let email = data.email

    axios
      .post(`${REACT_APP_API_ENDPOINT}user/forgot-password`, { email })
      .then(response => {
        setIsLoading(false)
        Swal.fire({
          icon: 'success',
          title: ' Password reset email sent! Please check your email inbox.',
          showConfirmButton: true,
          timer: 2500
        })
      })
      .catch(error => {
        setIsLoading(false)
        if(error.response?.data?.message?.error_Code === 5100){
          Swal.fire({
            icon: 'error',
            title: 'User with this email doesn’t exist',
            showConfirmButton: true,
            timer: 2500
          })
        }
      })
  })

  return (
    <>
      <Container
        maxWidth='sm'
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <Box>
          <Card sx={{ padding: '40px', borderRadius: '20px' }}>
            <div
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'center',
                textAlign: 'center',
                alignItems: 'center'
              }}
            >
              <h3>Forgot Password</h3>
            </div>

            <Box component={'form'} onSubmit={submit}>
              <AuthInput
                type={'text'}
                placeholder='Email'
                Icon={DraftsIcon}
                form={register}
                label='email'
                validation={{ required: true }}
              />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  type='submit'
                  variant='contained'
                  color='grey'
                  disabled={isLoading}
                  fullWidth
                  style={{
                    marginTop: '20px',
                    width: '50%',
                    height: '45px',
                    color: 'white',
                    backgroundColor:'#643a9b',
                    borderRadius:'2pc'
                  }}
                >
                  {isLoading ? 'Loading...' : 'Reset Password'}
                </Button>
              </div>
            </Box>
          </Card>
        </Box>
      </Container>
    </>
  )
}

export default ForgotPassword
