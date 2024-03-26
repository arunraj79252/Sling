import {
  Box,
  Button,
  Grid,
  IconButton,
  Link,
  Paper,
  Typography
} from '@mui/material'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import { Container } from '@mui/system'
import React, { useEffect, useState } from 'react'
import DraftsIcon from '@mui/icons-material/Drafts'
import AuthInput from '../layout/authInput'
import { useForm } from 'react-hook-form'
import PersonIcon from '@mui/icons-material/Person'
import LockIcon from '@mui/icons-material/Lock'
import { Link as ReactLink, useNavigate } from 'react-router-dom'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useTheme } from '@emotion/react'
import { useRegisterMutation } from '../../api/authApi'
import { useUploadImageMutation } from '../../api/userApi'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'


const Registration = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      profileImage: ''
    },
    mode: 'onBlur'
  })

  const [fileSizeError, setFileSizeError] = useState('')
  const [fileTypeError, setFileTypeError] = useState('')
  const [profileImage, setProfileImage] = useState('')
  
  const [uploadImage] = useUploadImageMutation()

  
  //image upload
  const fileUpload = ({ target: { files } }) => {
    const file = files[0]

    if (!file) return
    const fileSizeInMB = file.size / (1024 * 1024)
    const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif']

    // File size validation
    if (fileSizeInMB > 1) {
      toast.error('File size exceeded the limit of 1 MB', {
        position: 'top-center'   
      })
      return
    } else {
      setFileSizeError('')
    }
    if (!acceptedImageTypes.includes(file.type)) {
      toast.error(
        'Invalid file type. Only images (JPEG, PNG, GIF) are allowed.',
        {
          position: 'top-center'     
        }
      )
      return
    } else {
      setFileTypeError('')
    }
    const reader = new FileReader()
    reader.onload = event => {
      const imageDataUrl = event.target.result
      setPreviewImage(imageDataUrl)
    }

    reader.readAsDataURL(file)

    const body = new FormData()
    body.append('profileImage', file)

    uploadImage(body)
      .unwrap()
      .then(data => {
        setProfileImage(data?.profileImage)
        setValue('profileImage', data?.profileImage)
      })
  }
                                     
  const [previewImage, setPreviewImage] = useState(null)
  const navigate = useNavigate()
  const [formError, setFormError] = useState()
  const [registerCall] = useRegisterMutation()
  const [showPassword, setShowPassword] = React.useState(false)
  const [imageHover, setImageHover] = useState(false)
  const theme = useTheme()
  
  const handleClickShowPassword = () => setShowPassword(show => !show)
  const validation = {
    name: {
      required: 'Name is required',
      minLength: { value: 3, message: 'Minimum 3 characters required' },
      maxLength: {
        value: 10,
        message: 'Maximum limit exceeded'
      }
    },
    email: {
      required: 'Email is required',
      pattern: {
        value:
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        message: 'Invalid Email'
      }
    },
    password: {
      required: 'Password is required',
      minLength: { value: 6, message: 'Minimum 6 characters required' }
    },
    confirmPassword: {
      required: 'Confirm password is required',
      validate: val => {
        if (watch('password') !== val) {
          return "Password doesn't match"
        }
      }
    }
  }

  useEffect(() => {
    setFormError(errors)
  }, [errors])
  useEffect(() => {
  }, [formError])

  const onSubmit = data => {
  let updatedData;
  if (profileImage) {
    updatedData = {
      name:data.name,
      email:data.email,
      password:data.password,
      confirmPassword:data.confirmPassword,
      profileImage: profileImage
    };
  } else {
    updatedData = {
      name:data.name,
      email:data.email,
      password:data.password,
      confirmPassword:data.confirmPassword,
      };
  }
  
  registerCall(updatedData)
    .unwrap()
    .then(() => {
      navigate('/login');
    })
    .catch(error => console.log(error));
   };

  const handleMouseDownPassword = event => {
    event.preventDefault()
  }
  
  return (
    <div>
      <ToastContainer />
      <Container
        maxWidth='xl'
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <Grid container>
          <Grid item display={{ xs: 'none', sm: 'block' }} sm={6}>
            <Paper
              elevation={16}
              sx={{
                padding: theme.spacing(2),
                textAlign: 'center',
                color: theme.palette.text.secondary,
                minHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <img
                src='https://images.unsplash.com/photo-1611175694989-4870fafa4494?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Y2hhdCUyMGFwcHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
                height='783px' alt='img' ></img>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={16}
              sx={{
                padding: theme.spacing(2),
                textAlign: 'center',
                color: theme.palette.text.secondary,
                minHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Box
                component={'div'}
                className='profile-image'
                sx={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  my: 3,
                  mb: 4
                }}
              >
               
                <Box
                  component={'div'}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    '&:hover': {
                      cursor: 'pointer'
                    }
                  }}
                  onMouseMove={() => setImageHover(true)}
                  onMouseLeave={() => setImageHover(false)}
                >
                  <img
                    sx={{
                      borderRadius: '50%',
                      border: '2px solid black'
                    }}
                    src={
                      previewImage
                        ? previewImage
                        : 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/480px-Default_pfp.svg.png'
                    }
                    alt=''
                    height={120}
                    width={120}
                  />
                  
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      transition: 'opacity .2s ease-in-out',
                      opacity: imageHover ? 1 : 0,
                      height: '35%',
                      width: '100%',
                      backgroundColor: 'rgba(32,33,36,.6)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    component={'div'}
                  >
                    <IconButton
                      color='primary'
                      aria-label='upload picture'
                      component='label'
                      sx={{
                        width: '100%',
                        height: '240px'
                      }}
                    >
                      <input
                        hidden
                        accept='image/*'
                        type='file'
                        onChange={fileUpload}
                      />
                      <PhotoCamera
                        sx={{
                          color: 'background.default'
                        }}
                      />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
              <form onSubmit={handleSubmit(onSubmit)}>
                <AuthInput
                  type={'text'}
                  placeholder='Name'
                  Icon={PersonIcon}
                  form={register}
                  label='name'
                  formError={formError?.name}
                  validation={validation.name}
                />

                <AuthInput
                  type={'text'}
                  placeholder='Email'
                  Icon={DraftsIcon}
                  form={register}
                  label='email'
                  formError={formError?.email}
                  validation={validation.email}
                />
                <AuthInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Password'
                  Icon={LockIcon}
                  form={register}
                  label='password'
                  formError={formError?.password}
                  validation={validation.password}
                  End={
                    <IconButton
                      aria-label='toggle password visibility'
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge='end'
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  }
                />
                <AuthInput
                  type={'text'}
                  placeholder='Confirm Password'
                  Icon={LockIcon}
                  form={register}
                  formError={formError?.confirmPassword}
                  validation={validation.confirmPassword}
                  label='confirmPassword'
                />
                <Box
                  component={'div'}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    my: 5
                  }}
                  width={'100%'}
                >
                  
                  <Box component={'div'} width={'60%'}>
                    <Button
                      fullWidth
                      size='large'
                      variant='contained'
                      type='button'
                      onClick={handleSubmit(onSubmit)}
                      sx={{
                        background: theme.palette.primary.secondary,
                        borderRadius: 'calc(34px/2)',
                        boxShadow: 1
                      }}
                    >
                      Submit
                    </Button>
                  </Box>
                </Box>
              </form>

              <Box component={'div'} sx={{ my: 2 }}>
                <Typography
                  component={'p'}
                  align='center'
                  color={'text.secondary'}
                >
                  Already Registerd?{' '}
                  <Link
                    component={ReactLink}
                    color='primary'
                    underline='hover'
                    to='/login'
                  >
                    Login
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  )
}

export default Registration
