import {
  Avatar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  TextField,
  Typography
} from '@mui/material'
import Modal from '@mui/material/Modal'
import { Box } from '@mui/system'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import InsertEmoticonOutlinedIcon from '@mui/icons-material/InsertEmoticonOutlined'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import React, { useEffect, useState, useRef } from 'react'
import SendIcon from '@mui/icons-material/Send'
import { generateColorHsl } from '../../utils/generateColorHsl'
import GetMyProfileImage from '../layout/getMyProfileImage'
import ChatMessage from './chatMessage'
import {
  useSendPrivateMessageMutation,
  useRecentMessageQuery
} from '../../api/userApi'
import BlockIcon from '@mui/icons-material/Block'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDispatch } from 'react-redux'
import { blockedUser } from '../../store/slice/authSlice'
import { Link as ReactLink, useNavigate } from 'react-router-dom'
import SearchIcon from '@mui/icons-material/Search'

const { REACT_APP_API_ENDPOINT } = process.env

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3
}

const ChatDetails = ({
  messageList,
  name,
  email,
  profileImage,
  id,
  isLoading,
  isFetching,
  chatLoading,
  blocked,
  callNextPage,
  handleNewMessage
}) => {
  const [keyword, setKeyword] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const netPage = useRef(1)

  const [allUserParam, setAllUserParam] = useState({
    page: 1,
    keyword: '',
    size: 1
  })

  const timer = useRef(null)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [blockopen, setOpen] = React.useState(false)
  const [isBlocked, setIsBlocked] = useState(false)

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      sendMessageHandle()
    }
  }

  const handleOpen = () => {
    setOpen(true)
  }
  const handleCloses = () => {
    setOpen(false)
  }

  useEffect(() => {
    setIsBlocked(blocked)
  }, [blocked])

  const handleBlockOpen = async () => {
    try {
      const response = await axios.patch(
        `${REACT_APP_API_ENDPOINT}user/blockUnblockUser?userId=${id}&status=${1}`
      )
      let payload = {
        status: 1
      }
      dispatch(blockedUser(payload))
      if (response.status === 200) {
        setOpen(false)
        setIsBlocked(true)
        toast.success('User blocked successfully!', {
          toastId: 'detailupdatesuccess',
          position: 'top-center'
        })
      } else if (response.status === 500) {
        setOpen(false)
        toast.info('User is already blocked', {
          toastId: 'detailupdatesuccess',
          position: 'top-center'
        })
      }
    } catch (error) {
      toast.error('An unexpected error has occurred.', {
        position: 'top-center'
      })
    }
    navigate('/group')
  }

  useRecentMessageQuery()

  const handleUnBlockOpen = async () => {
    try {
      const response = await axios.patch(
        `${REACT_APP_API_ENDPOINT}user/blockUnblockUser?userId=${id}&status=${0}`
      )
      if (response.status === 200) {
        setOpen(false)
        toast.success('User unblocked successfully!', {
          toastId: 'detailupdatesuccess',
          position: 'top-center'
        })
      } else if (response.status === 500) {
        setOpen(false)
        toast.info('User is already unblocked', {
          toastId: 'detailupdatesuccess',
          position: 'top-center'
        })
      }
    } catch (error) {
      toast.error('An error occurred while unblocking the user.', {
        toastId: 'detailupdatesuccess',
        position: 'top-center'
      })
    }
  }

  let color
  if (!isLoading) {
    color = generateColorHsl(name, [40, 60], [40, 60])
  }

  const [sendMessage, { isLoading: sendMessageLoading, data: newMessage }] =
    useSendPrivateMessageMutation()

  const sendMessageHandle = () => {
    let payload = {
      message: keyword,
      recipientId: id
    }
    if (keyword) {
      setKeyword('')
      sendMessage(payload)
    }
  }

  useEffect(() => {
    console.log(newMessage, 'new msg')
    if(newMessage){
      handleNewMessage(newMessage)
    }
  }, [newMessage])

  useEffect(() => {
    const clearKeyWord = () => {
      // clear key word in seperate chat select
      setKeyword('')
    }
    clearKeyWord()
  }, [id])

  const recieverAvatar = value =>
    profileImage ? (
      <Avatar src={profileImage} sx={{ mr: 1, width: value, height: value }} />
    ) : (
      <Avatar sx={{ bgcolor: color, mr: 1, width: value, height: value }}>
        {name[0].toUpperCase()}
      </Avatar>
    )

  const [state, setState] = useState()

  const searchUserMessage = a => {
    setState(a)
  }

  return (
    <Box
      component={'div'}
      width={'75%'}
      height={'calc(100vh - 66px)'}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <Box
        component={'div'}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 99,
          bgcolor: 'background.default',
          display: 'flex',
          borderBottom: '1px solid',
          borderColor: 'background.border',
          height: '65px',
          justifyContent: 'space-between'
        }}
      >
        <Box
          component={'span'}
          sx={{ display: 'flex', alignItems: 'center', px: 1 }}
        >
          {isLoading ? (
            <Skeleton
              variant='circular'
              width={40}
              height={40}
              sx={{ mr: 1 }}
            />
          ) : profileImage ? (
            <Avatar src={profileImage} sx={{ mr: 1, width: 40, height: 40 }} />
          ) : (
            <Avatar sx={{ bgcolor: color, mr: 1, width: 40, height: 40 }}>
              {name[0].toUpperCase()}
            </Avatar>
          )}
          <Box component={'span'}>
            <Typography variant='h6'>
              {isLoading ? (
                <Skeleton variant='text' width={100} height={28} />
              ) : (
                name[0].toUpperCase() + name.slice(1)
              )}
            </Typography>
            <Typography variant='caption'>
              {isLoading ? <Skeleton variant='text' width={150} /> : email}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex' }}>
          <SearchIcon sx={{ marginTop: '2vh' }} onClick={searchUserMessage} />
          <IconButton
            aria-label='more'
            id='long-button'
            aria-haspopup='true'
            aria-controls={open ? 'account-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            <MoreVertIcon color='primary' />
          </IconButton>
          <Menu
            id='account-menu'
            open={open}
            // onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                right: 23,
                top: '48px !important',
                left: 'unset !important',
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0
                }
              }
            }}
            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          >
            <MenuItem sx={{ height: '13vh', width: '20vh' }}>
              {isBlocked ? (
                <Button onClick={handleOpen}>
                  <BlockIcon /> UnBlock
                </Button>
              ) : (
                <Button onClick={handleOpen}>
                  <BlockIcon /> Block
                </Button>
              )}
            </MenuItem>
          </Menu>
        </Box>
        <Modal
          open={blockopen}
          onClose={handleCloses}
          aria-labelledby='child-modal-title'
          aria-describedby='child-modal-description'
        >
          <Box sx={{ ...style, width: '50vh' }}>
            <h2 id='child-modal-title'>{`${
              blocked ? 'UnBlock' : 'Block'
            } ${name}`}</h2>
            {!blocked ? (
              <>
                <p id='child-modal-description'>
                  {name} won't be able to message you directly, and their
                  messages in the space will be hidden for you. They can still
                  read any messages that you send to the space.
                </p>
                <Button onClick={handleBlockOpen}>Block</Button>
              </>
            ) : (
              <>
                <p id='child-modal-description'>Unblock {name} ?</p>
                <Button onClick={handleUnBlockOpen}>UnBlock</Button>
              </>
            )}
          </Box>
        </Modal>
      </Box>

      <Box
        sx={{
          height: 'calc(100vh - 131.06px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        {isBlocked ? ( // If user is blocked, display blocked message
          <Typography variant='body1'></Typography>
        ) : (
          <ChatMessage
            messageList={messageList}
            id={id}
            GetMyProfileImage={GetMyProfileImage}
            recieverAvatar={recieverAvatar}
            isLoading={isLoading}
            chatLoading={chatLoading}
            isFetching={isFetching}
            callNextPage={callNextPage}
          />
        )}

        <Box px={1}>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'primary.main',
              p: 2,
              borderRadius: 'calc(20px/2)',
              maxHeight: '30vh'
            }}
          >
            {!isBlocked ? (
              <TextField
                maxRows={5}
                fullWidth
                multiline
                variant='standard'
                value={keyword}
                onChange={e => {
                  if (!isBlocked) {
                    setKeyword(e.target.value)
                  }
                }}
                placeholder='Reply'
                InputProps={{
                  disableUnderline: true
                }}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <div
                style={{
                  color: '#cc6666',
                  fontStyle: 'italic',
                  fonsize: '1rem'
                }}
              >
                You blocked {name}
                {name} will not be able to message you anymore
                {isBlocked ? (
                  <IconButton
                    onClick={handleOpen}
                    style={{
                      left: '66vh',
                      height: '4vh',
                      color: 'blueviolet'
                    }}
                  >
                    <BlockIcon />
                    <h6>Unblock</h6>
                  </IconButton>
                ) : (
                  <Button onClick={handleOpen}>
                    <BlockIcon /> Block
                  </Button>
                )}
              </div>
            )}

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                position: 'sticky',
                bottom: 0
              }}
            >
              <Box>
                {!isBlocked && (
                  <>
                    <IconButton
                      aria-label='more'
                      id='long-button'
                      aria-haspopup='true'
                      // onClick={handleClick}
                    >
                      <AttachFileOutlinedIcon color='primary' />
                    </IconButton>
                    <IconButton
                      aria-label='more'
                      id='long-button'
                      aria-haspopup='true'
                      // onClick={handleClick}
                    >
                      <InsertEmoticonOutlinedIcon color='primary' />
                    </IconButton>
                  </>
                )}
              </Box>
              <Box>
                {!isBlocked && (
                  <IconButton
                    type='submit'
                    aria-label='more'
                    id='long-button'
                    aria-haspopup='true'
                    disabled={sendMessageLoading || isLoading || isFetching}
                    onClick={sendMessageHandle}
                  >
                    <SendIcon color='primary' />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default ChatDetails
