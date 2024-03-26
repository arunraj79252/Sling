import React, { useState } from 'react'
import { useForm as UseForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import axios from 'axios'
import style from './ResetPassword.module.css'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Container, Grid, Paper, Button } from '@mui/material'

const { REACT_APP_API_ENDPOINT } = process.env

function ResetPassword () {
  const [searchParams] = useSearchParams()
  searchParams.get('token')
  let resetToken = searchParams.get('token')
  let navigate = useNavigate()
  const [showNewPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = UseForm({ mode: 'onChange' })

  const onSubmit = async (data) => {
    const newPassword = data.password;
    const confirmPassword = data.confirmPassword;


    if (newPassword !== confirmPassword) {
      toast.error('Passwords mismatch', {
        position: toast.POSITION.TOP_CENTER,
        toastId: 'passwordsMismatch',
      });
    } else {
      try {
        const response = await axios.patch(
          `${REACT_APP_API_ENDPOINT}user/resetPassword`,
          JSON.stringify({ resetToken, newPassword, confirmPassword }),
          {
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          }
        );

        console.log(response);

        Swal.fire({
          timer: 1500,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
          willClose: () => {
            Swal.fire({
              icon: 'success',
              title: 'Password changed successfully!',
              showConfirmButton: false,
              timer: 1500,
            });
          },
        });

        navigate('/');
      } catch (err) {
        if (err.response?.data?.message?.error_Code === 5101) {
          Swal.fire({
            timer: 1500,
            showConfirmButton: false,
            willOpen: () => {
              Swal.showLoading();
            },
            willClose: () => {
              Swal.fire({
                icon: 'error',
                title: 'This token is not valid or has expired.',
                showConfirmButton: true,
              });
            },
          });

          navigate('/');
        } else {
          Swal.fire({
            timer: 1500,
            showConfirmButton: false,
            willOpen: () => {
              Swal.showLoading();
            },
            willClose: () => {
              Swal.fire({
                icon: 'error',
                title: 'An error occurred. Try again!',
                showConfirmButton: true,
              });
            },
          })
          navigate('/')
        }
      }
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
      <Grid container sx={{ width: '66%', marginLeft: '3%' ,display:'flex',justifyContent:'center'}}>
        <Grid item xs={12} sm={6}>
          <Paper
            elevation={16}
            sx={{
              //   padding: theme.spacing(2),
              textAlign: 'center',
              //   color: theme.palette.text.secondary,
              minHeight: '50vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '15px'
            }}
          >
            {' '}
            <div
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'center',
                textAlign: 'center',
                alignItems: 'center',
                marginBottom: '25px'
              }}
            >
              <h1>Reset Password</h1>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={style['formWrap']}
            >
              <div className={style['fieldContainer']}>
                <input
                  className={style['input']}
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete='off'
                  {...register('password', {
                    required: 'Password required ',
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$.!%*?&])[A-Za-z\d@$!%*?&]{6,30}$/,
                      message:
                        'Your password must be contain at least 6 characters long, contain at least one number, special character and have a mixture of uppercase and lowercase letters.'
                    },
                    maxLength: {
                      value: '30',
                      message: 'Maximum Length Exceeded'
                    }
                  })}
                  placeholder='Password'
                />
              </div>
              {errors.password && (
                <small style={{ color: 'red', fontSize: '12px',marginLeft:'6%',marginRight:'5%'}}>
                  {errors.password.message}
                </small>
              )}

              <div className={style['fieldContainer']}>
                <input
                  className={style['input']}
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete='off'
                  {...register('confirmPassword', {
                    required: 'Password required ',
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%.*?&])[A-Za-z\d@$!%*?&]{8,16}$/
                    }
                  })}
                  placeholder='Confirm Password'
                />
              </div>
              

              <div
                style={{
                  marginTop: '5%',
                  display: 'flex',
                  gap: '30px',
                  justifyContent: 'center'
                }}
              >
                <Button
                  type='submit'
                  sx={{
                    backgroundColor: 'rgb(103, 58, 183)',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    color: 'white',
                    width: '20vh',
                    borderRadius: '2pc',
                    '&:hover': {
                      backgroundColor: 'darkblue',
                      boxShadow: 'none'
                    }
                  }}
                >
                  <span>SUBMIT</span>
                  <span id='loader' />
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

export default ResetPassword
