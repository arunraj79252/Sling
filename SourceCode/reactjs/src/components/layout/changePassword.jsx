import { Container, Grid, Paper, Button } from '@mui/material'
import React, { useState } from 'react'
import style from './ChangePassword.module.css'
import { useForm as UseForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useSelector } from 'react-redux'
import { Lock as LockIcon } from '@mui/icons-material'

import { accessTokenSelector } from '../../store/selectors/AuthSelectors'

const { REACT_APP_API_ENDPOINT } = process.env
const ChangePassword = () => {
  let navigate = useNavigate()

  const [showNewPassword] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = UseForm({ mode: 'onChange' })

  const token = useSelector(accessTokenSelector)
  const url = `${REACT_APP_API_ENDPOINT}user/changePassword`
  const headers = {
    Authorization: `SLING ${token}`
  }

  const onSubmit = async data => {
   
    if (data.confirmNewPassword === data.newPassword) {
     
      try {
        const formData = {
          currentPassword: data?.currentPassword,
          newPassword: data?.confirmNewPassword
        }
        const response = await axios.patch(url, formData, { headers })
       console.log(response);
        Swal.fire({
          icon: 'success',
          title: 'Password Changed Successfully',
          showConfirmButton: true,
          timer: 2500
        })
        navigate('/chat')
      } catch (error) {
        
        if (error.response?.data) {
        
          const errorCode = error.response.data.message.error.error_code
          switch (errorCode) {
            case 4000:
              Swal.fire({
                icon: 'error',
                title: 'Invalid Current Password',
                showConfirmButton: true,
                timer: 2000
              })
              break
            case 4001:
              Swal.fire({
                icon: 'error',
                title: 'Current Password required',
                text: 'If you want to set a password, use Forgot Password'
              })
              break
            case 4002:
              Swal.fire({
                icon: 'error',
                title: 'Current Password should not be empty',
                text: 'If you want to set a password, use Forgot Password'
              })
              break
            case 4003:
              Swal.fire({
                icon: 'error',
                title: 'Current Password should be a string',
                text: 'If you want to set a password, use Forgot Password'
              })
              break
            case 4004:
              Swal.fire({
                icon: 'error',
                title: 'New Password required',
                text: 'If you want to set a password, use Forgot Password'
              })
              break
            case 4005:
              Swal.fire({
                icon: 'error',
                title: 'New Password should not be empty',
                text: 'If you want to set a password, use Forgot Password'
              })
              break
            case 4006:
              Swal.fire({
                icon: 'error',
                title: 'New Password should be a string',
                text: 'If you want to set a password, use Forgot Password'
              })
              break
            default:
              break
          }
        }
     
        reset()
      }
    } else {
      toast.error('New password and confirm password should be the same.', {
        toastId: 'passwordSame',
        position: 'top-center'
      })
    }
  }
  return (
    <Container
      maxWidth=''
      sx={{
        minHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: `linear-gradient(169deg, rgba(103,58,183,1) 42%, rgba(202,33,243,1) 123%)`
      }}
    >
      <Grid container sx={{ width: '80%' }}>
        <Grid item display={{ xs: 'none', sm: 'block' }} sm={6}>
          <Paper
            elevation={16}
            sx={{
              //   padding: theme.spacing(2),
              textAlign: 'center',
              //   color: theme.palette.text.secondary,
              minHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <img
              src='https://images.unsplash.com/photo-1611175694989-4870fafa4494?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Y2hhdCUyMGFwcHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
              height='783px' alt='img'
            ></img>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper
            elevation={16}
            sx={{
              //   padding: theme.spacing(2),
              textAlign: 'center',
              //   color: theme.palette.text.secondary,
              minHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'center',
                textAlign: 'center',
                alignItems: 'center',
                marginBottom: '37px'
              }}
            >
              <h1>Change Password</h1>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={style['formWrap']}
            >
              <div className={style['fieldContainer']}>
                
                  <input
                    className={`${style['input']} ${style['input-with-icon']}`}
                    type='password'
                    {...register('currentPassword', {
                      required: 'Password Required'
                    })}
                    placeholder='Current Password'
                  />
                  <LockIcon className={style['icon']} style={{ color: 'rgb(103, 58, 183)' }} />
               
              </div>

              <div className={style['fieldContainer']}>
                <input
                  className={`${style['input']} ${style['input-with-icon']}`}
                  type={showNewPassword ? 'text' : 'password'}
                  {...register('newPassword', {
                    required: 'Password required ',
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/,
                      message:
                        'Password must be contain at least 6 characters long, contain at least one number, special character and have a mixture of uppercase and lowercase letters.'
                    },
                    maxLength: {
                      value: '30',
                      message: 'Maximum Length Exceeded'
                    }
                  })}
                  placeholder='New Password'
                />
                  <LockIcon className={style['icon']} style={{ color: 'rgb(103, 58, 183)' }} />

              </div>
              {errors.newPassword && (
                <small
                  style={{
                    color: 'red',
                    fontSize: '12px',
                    marginLeft: '6%',
                    marginRight: '5%'
                  }}
                >
                  {errors.newPassword.message}
                </small>
              )}
              <div className={style['fieldContainer']}>
                <input
                className={`${style['input']} ${style['input-with-icon']}`}
                  type='password'
                  {...register('confirmNewPassword', {
                    required: 'Password required ',
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%.*?&])[A-Za-z\d@$!%*?&]{8,16}$/
                    }
                  })}
                  placeholder='Confirm Password'
                />
                  <LockIcon className={style['icon']} style={{ color: 'rgb(103, 58, 183)' }} />

              </div>

              <div
                style={{
                  marginTop: '5%',
                  display: 'flex',
                  gap: '30px',
                  justifyContent: 'center'
                }}
              >
                &nbsp;
                <Button
                  type='submit'
                  sx={{
                    backgroundColor: 'rgb(103, 58, 183)',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    color: 'white',
                    width: '20vh',
                    marginLeft: '-3pc',
                    borderRadius: '2pc',
                    '&:hover': {
                      backgroundColor: 'darkblue',
                      boxShadow: 'none'
                    }
                  }}
                >
                  SUBMIT
                </Button>
              </div>
            </form>
          </Paper>
        </Grid>
      </Grid>
      <ToastContainer />
    </Container>
  )
}

export default ChangePassword
