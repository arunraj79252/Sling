import React, { useState, useEffect } from 'react'
import {
  Avatar,
  Box,
  IconButton,
  Skeleton,
  Typography,
  Button,
  TextField
} from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import axios from 'axios'
import { generateColorHsl } from '../../utils/generateColorHsl'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Modal from '@mui/material/Modal'
import { useTheme } from '@emotion/react'
import {
  selectGroupChatId,
  setListChangeFlag
} from '../../store/slice/groupChatSlice'
import { useDispatch, useSelector } from 'react-redux'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import AddIcon from '@mui/icons-material/Add'
import SendIcon from '@mui/icons-material/Send'
import Multiselect from 'multiselect-react-dropdown'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import './group.css'
import EditIcon from '@mui/icons-material/Edit'
import ClearIcon from '@mui/icons-material/Clear'
import CheckIcon from '@mui/icons-material/Check'
import { groupListUpdateSelector } from '../../store/selectors/groupChatSelector'
import DeleteIcon from '@mui/icons-material/Delete'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { Link as ReactLink, useNavigate } from 'react-router-dom'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import InsertEmoticonOutlinedIcon from '@mui/icons-material/InsertEmoticonOutlined'
import { useSendPrivateMessageGroupMutation } from '../../api/userApi'
import FormatColorTextIcon from '@mui/icons-material/FormatColorText'
import { Editor } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { EditorState, convertToRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html'

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

const GroupChatDetails = ({ data, isFetching }) => {
  const isLoading = false
  const groupListUpdate = useSelector(groupListUpdateSelector)

  const [value, setValue] = useState([])
  const [datas, setDatas] = useState([])
  const [anchorEl, setAnchorEl] = useState(null)

  const open = Boolean(anchorEl)
  const [opens, setOpens] = useState(false)
  const [openModal, setOpenModal] = useState()
  const [anchorElDeltes, setanchorElDeltes] = useState(null)
  const [anchorElDelete, setAnchorElDelete] = useState(null)
  const openDeleteMenu = Boolean(anchorElDelete)
  const [blockopen, setOpen] = React.useState(false)
  const theme = useTheme()
  const dispatch = useDispatch()
  const [members, setMembers] = useState([])
  const [isFormComplete, setIsFormComplete] = useState(false)
  const [isDivOpen, setIsDivOpen] = useState(false)
  const [userData, setUserDta] = useState(false)
  const [capitalizedName, setCapitalizedName] = useState('')
  const [isDisabled, setIsDisabled] = useState(true)
  const [error, setError] = useState()
  const [isOpen, setIsOpen] = useState(false)
  const [editName, setEditName] = useState()
  const navigate = useNavigate()
  const [keyword, setKeyWord] = useState('')
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [userIdLocal, setuserIdLocal] = useState(
    localStorage.getItem('userId') || 0
  )
  const [iconColor, setIconColor] = useState('primary');
  const [editorState, setEditorState] = useState(EditorState.createEmpty())

  const onEditorStateChange = newEditorState => {
    setEditorState(newEditorState)
    const content = draftToHtml(convertToRaw(editorState.getCurrentContent()))
    console.log(content)
    setKeyWord(content)
  }

  useEffect(() => {}, [data])

  const {
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: ''
    }
  })

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleCloses = () => {
    setOpens(false)
    setIsDivOpen(false)
    setIsOpen(false)
  }
  const [userDataGroup, setUserDataGroup] = useState('')
  const [openGroupMenu, setopenGroupMenu] = useState(false)
  const handleOpenDelete = (e, user) => {
    setopenGroupMenu(true)
    setanchorElDeltes(e.currentTarget)
    setUserDataGroup(user)
    setAnchorElDelete(user.memberId._id)
  }

  const handleCloseDeletemenu = () => {
    setAnchorElDelete(false)
  }
  //editor
  const handleEditorOpen = () => {
    setIsEditorOpen(!isEditorOpen)
    setIconColor(iconColor === 'primary' ? 'secondary' : 'primary');
  }

  const handleOpen = () => {
    axios
      .get(`${REACT_APP_API_ENDPOINT}group/${data._id}`)
      .then(response => {
        const groupData = response.data
        // Process the retrieved groupData as needed
        setDatas(groupData.members)
        setOpens(true)
      })
      .catch(error => {
        console.error(error)
        // Handle error response here
      })
  }

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      sendMessageGroup()
    }
  }

  let color = '#1421'
  if (!isLoading) {
    color = generateColorHsl(data?.name, [40, 60], [40, 60])
  }

  const [sendMessage, { isLoading: sendMessageGroupLoading }] =
    useSendPrivateMessageGroupMutation()

  const sendMessageGroup = () => {
    let payload = {
      message: keyword,
      groupId: data._id.toString()
    }
    if (keyword) {
      setKeyWord('')
      sendMessage(payload)
    }
  }

  const handleAddCloses = () => {
    setOpenModal(false)
    setIsDivOpen(false)
  }

  const handleAddUser = () => {
    let userId = localStorage.getItem('userId')
    let currentUser = data.members.find(
      element => element.memberId.toString() === userId
    )
    setUserDta(currentUser)
    if (currentUser.memberType === 1) {
      setIsDivOpen(!isDivOpen)
    } else {
      toast.error('Only the admin has permission to add members', {
        position: 'top-center'
      })
    }
  }

  useEffect(() => {
    setIsFormComplete(members?.length > 0)
  }, [members])

  useEffect(() => {
    getMessage()
  }, [])

  const getMessage = () => {
    axios
      .get(`${REACT_APP_API_ENDPOINT}user`)
      .then(response => {
        setValue(response.data.docs)
      })
      .catch(error => {
        console.error(error)
      })
  }

  const onSubmit = () => {
    let users = []
    members.map(member => users.push(member.value))

    const requestBody = {
      members: users
    }
    axios
      .post(`${REACT_APP_API_ENDPOINT}group/${data._id}/member`, requestBody)
      .then(response => {
        toast.success('Member added successfully!', {
          className: 'toast-success',
          position: 'top-center'
        })
        setIsDivOpen(false)
      })
      .catch(error => {
        console.error(error.response)
        toast.error('One or more members already exist in group.', {
          className: 'toast-error',
          position: 'top-center'
        })
      })
  }

  //Remove user from group
  const deleteUser = memberId => {
    axios
      .delete(`${REACT_APP_API_ENDPOINT}group/${data._id}/${memberId}`)
      .then(response => {
        setDatas(prevMembers =>
          prevMembers.filter(member => member._id !== memberId)
        )
        toast.success('Member removed successfully!', {
          className: 'toast-success',
          position: 'top-center'
        })
        handleCloseDeletemenu()
        handleOpen()
      })
      .catch(error => {
        console.error(error)
        toast.error('Only the group admin can remove members from group.', {
          className: 'toast-error',
          position: 'top-center'
        })
      })
  }

  const showToast = (type, message, toastId) => {
    toast[type](message, {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
      toastId: toastId
    })
  }

  useEffect(() => {
    if (data && data.name) {
      setCapitalizedName(data.name[0].toUpperCase() + data.name.slice(1))
    }
  }, [data])

  //edit group name validation

  let updateflag = 0
  const usernameLength = event => {
    let capitalizedName = event.target.value

    let message = ''
    switch (true) {
      case capitalizedName.length > 35:
        message = 'Please enter a groupname between 1 and 35'
        updateflag = 1
        break
      case capitalizedName === '':
        message = 'groupname required!'
        updateflag = 1
        setCapitalizedName('')
        break

      default:
        setCapitalizedName(capitalizedName)
        break
    }
    if (message) {
      showToast('error', message, 109)
    }
  }

  // edit group name
  const updateUserDetails = () => {
    let usName = capitalizedName
    if (usName.length < 36) {
      updateflag = 0
    }
    setIsDisabled(true)
    if (updateflag === 1) {
    } else {
      const requestBody = {
        groupId: data._id.toString(),
        name: capitalizedName
      }
      axios
        .put(`${REACT_APP_API_ENDPOINT}group`, requestBody)
        .then(response => {
          toast.success('Groupname updated successfully!', {
            className: 'toast-success',
            position: 'top-center'
          })
          dispatch(setListChangeFlag(!groupListUpdate))
          setIsOpen(false)
        })
        .catch(error => {})
    }
  }
  const edit = () => {
    setIsOpen(true)
  }
  const editClose = () => {
    setIsOpen(false)
    if (data && data.name) {
      setCapitalizedName(data.name[0].toUpperCase() + data.name.slice(1))
    }
  }
  //Change admin role
  const roleChange = memberId => {
    axios
      .patch(
        `${REACT_APP_API_ENDPOINT}group/changeAdmin?groupId=${
          data._id
        }&memberId=${memberId}&memberType=${1}`
      )
      .then(response => {
        toast.success('make admin successfully!', {
          className: 'toast-success',
          position: 'top-center'
        })
        dispatch(setListChangeFlag(!groupListUpdate))
        setIsOpen(false)
        handleCloseDeletemenu()
        handleOpen()
      })
      .catch(error => {})
  }

  const roleChangeUser = memberId => {
    axios
      .patch(
        `${REACT_APP_API_ENDPOINT}group/changeAdmin?groupId=${
          data._id
        }&memberId=${memberId}&memberType=${0}`
      )
      .then(response => {
        toast.success('Change for admin to user successfully!', {
          className: 'toast-success',
          position: 'top-center'
        })
        dispatch(setListChangeFlag(!groupListUpdate))
        setIsOpen(false)
        handleCloseDeletemenu()
        handleOpen()
      })
      .catch(error => {})
  }

  //Delete group
  const deleteFunction = () => {
    axios
      .delete(`${REACT_APP_API_ENDPOINT}group/${data._id}`)
      .then(response => {
        toast.success('Group deleted  successfully!', {
          className: 'toast-success',
          position: 'top-center'
        })
        dispatch(setListChangeFlag(!groupListUpdate))
        setIsOpen(false)
        handleCloseDeletemenu()
        handleOpen()
      })
      .catch(error => {
        toast.error('Only the group admin can delete group!', {
          className: 'toast-success',
          position: 'top-center'
        })
      })
    navigate('/chat')
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
          height: '65px',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'background.border'
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
          ) : data?.image ? (
            <Avatar src={data?.image} sx={{ mr: 1, width: 40, height: 40 }} />
          ) : (
            <Avatar sx={{ bgcolor: color, mr: 1, width: 40, height: 40 }}>
              {data && data.name && data.name.length > 0
                ? data.name[0].toUpperCase()
                : ''}
            </Avatar>
          )}
          <Box component={'span'}>
            <Typography variant='h6'>
              {isLoading ? (
                <Skeleton variant='text' width={100} height={28} />
              ) : (
                <Typography variant='h6'>{capitalizedName}</Typography>
              )}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex' }}>
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
            open={Boolean(anchorEl)}
            onClick={handleClose}
            anchorEl={anchorEl}
            PaperProps={{
              elevation: 0,
              sx: {
                right: 23,
                top: '48px !important',
                left: 'unset !important',
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '&.MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1
                },
                '&.before': {
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
            <MenuItem
              sx={{ color: 'grey', display: 'flex', alignItems: 'center' }}
              onClose={handleClose}
              onClick={handleOpen}
            >
              <PersonAddAltIcon sx={{ marginRight: '10px' }} />
              Manage members
            </MenuItem>
            <MenuItem
              sx={{ color: 'grey', display: 'flex', alignItems: 'center' }}
              onClose={handleClose}
              onClick={deleteFunction}
            >
              <PersonAddAltIcon sx={{ marginRight: '10px' }} />
              Delete Group
            </MenuItem>
          </Menu>
        </Box>
        <Modal
          open={opens}
          onClose={handleCloses}
          aria-labelledby='child-modal-title'
          aria-describedby='child-modal-description'
        >
          <Box
            sx={{
              ...style,
              position: 'absolute',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderColor: 'none'
            }}
            className='infoStyle' // Apply the .infoStyle class to the Box component
          >
            <div
              style={{
                mozBoxAligin: 'center',
                alignItems: 'center',
                display: 'flex',
                mozBoxPack: 'justify',
                justifyContent: 'space-between',
                marginBottom: '10px'
              }}
            ></div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <input
                id='name'
                type='text'
                name='capitalizedName'
                value={capitalizedName}
                style={{
                  backgroundColor: '#f4f4f9',
                  border: 'none',
                  fontSize: '2rem'
                }}
                onChange={event => usernameLength(event)}
                onClick={edit}
              ></input>
              {isOpen && (
                <>
                  <ClearIcon
                    sx={{ marginTop: '1vh', color: 'red' }}
                    onClick={editClose}
                  />
                  <CheckIcon
                    sx={{ marginTop: '1vh', color: 'green' }}
                    onClick={updateUserDetails}
                  />
                </>
              )}
              {/* <EditIcon sx={{marginTop:'1vh'}}/> */}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div
                style={{
                  fontfamily: 'Google Sans,Google Sans,Roboto,Arial,sans-serif',
                  lineHeght: '2rem',
                  fontSize: '1rem',
                  letterSpacing: '0',
                  fontWeight: '400',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: 'var(--gm3-color-on-surface)',
                  height: 'auto'
                }}
              >
                Members
              </div>
              <div>
                <Button
                  onClick={handleAddUser}
                  sx={{
                    fontStyle: 'normal',
                    borderRadius: '5vh',
                    width: '8rem',
                    border: '1px solid black',
                    borderColor: 'background.border',
                    bgcolor: 'background.default'
                  }}
                >
                  <AddIcon sx={{ marginRight: '10px' }} />
                  Add
                </Button>
              </div>
            </div>
            <hr style={{ height: '3px', color: 'black', width: '100%' }} />
            {isDivOpen && (
              <div
                style={{
                  background: '#f4f4f9',
                  padding: '10px',
                  borderRadius: '5px',
                  marginTop: '-42px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '20px'
                  }}
                >
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    style={{ width: '100%', height: '50%' }}
                  >
                    <div style={{ width: '100%', marginTop: '2vh' }}>
                      <Multiselect
                        options={value.map(user => ({
                          label: user.name,
                          value: user._id
                        }))}
                        placeholder='Search for user'
                        isObject={true}
                        displayValue='label'
                        fullWidth
                        autoComplete='off'
                        className='select'
                        onSelect={selectedValues => {
                          setMembers([...selectedValues])
                        }}
                        onRemove={selectedValues => {
                          setMembers([...selectedValues])
                        }}
                        InputProps={{
                          color: 'rgb(103, 58, 183)',
                          fontSize: '16px'
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '20px',
                        justifyContent: 'end',
                        marginTop: '40px'
                      }}
                    >
                      <Button
                        style={{
                          borderRadius: '20px',
                          color: 'blue'
                        }}
                        onClick={handleAddCloses}
                      >
                        Cancel
                      </Button>
                      <Button
                        type='submit'
                        style={{
                          borderRadius: '20px',
                          color: 'white',
                          backgroundColor: isFormComplete
                            ? 'rgb(103, 58, 183)'
                            : 'lightgrey'
                        }}
                        disabled={!isFormComplete} // Disable the button if the form is incomplete
                      >
                        Create
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            <div style={{ overflow: 'auto' }}>
              {datas.map(user => (
                <div
                  key={user?.memberId?._id}
                  className='hoverName'
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    justifyContent: 'space-between'
                  }}
                  anchorElDeltes
                >
                  <div style={{ display: 'flex' }}>
                    <Avatar
                      src={user?.memberId?.profileImage}
                      sx={{ marginRight: '8px' }}
                    />
                    <div>
                      <Typography variant='body1'>
                        {user?.memberId?.name}
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{ color: 'text.secondary' }}
                      >
                        {user?.memberId?.email}
                      </Typography>
                    </div>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <Typography sx={{ color: 'green' }}>
                      {user?.memberType === 1 ? 'Admin' : ''}
                    </Typography>{' '}
                  </div>
                  <div>
                    {' '}
                    <Button
                      id='demo-positioned-button'
                      sx={{
                        hoverColor: 'lightgray',
                        minWidth: '0px',
                        borderRadius: '100vh',
                        color: 'black'
                      }}
                      aria-controls={
                        openDeleteMenu ? 'demo-positioned-button' : undefined
                      }
                      aria-expanded={openDeleteMenu ? 'true' : undefined}
                      aria-haspopup='true'
                      onClick={e => handleOpenDelete(e, user)}
                    >
                      <MoreVertIcon />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Box>
        </Modal>
        {openGroupMenu && (
          <Menu
            id='demo-positioned-button'
            open={Boolean(anchorElDelete)}
            onClose={handleCloseDeletemenu}
            anchorEl={anchorElDeltes}
          >
            <MenuItem
              sx={{
                color: 'grey',

                alignItems: 'center'
              }}
              onClose={handleCloseDeletemenu}
              onClick={() => deleteUser(anchorElDelete)}
            >
              <DeleteIcon sx={{ marginRight: '10px' }} />
              Remove user
            </MenuItem>
            {userDataGroup.memberType === 1 ? (
              <MenuItem
                sx={{
                  color: 'grey',
                  alignItems: 'center'
                }}
                onClick={() => roleChangeUser(anchorElDelete)}
              >
                <AdminPanelSettingsIcon sx={{ marginRight: '10px' }} />

                {userIdLocal == userDataGroup.memberId._id
                  ? ' remove admin '
                  : 'change from admin to user'}
              </MenuItem>
            ) : (
              <MenuItem
                sx={{
                  color: 'grey',

                  alignItems: 'center'
                }}
                onClick={() => roleChange(anchorElDelete)}
              >
                <AdminPanelSettingsIcon sx={{ marginRight: '10px' }} />
                Make admin
              </MenuItem>
            )}
          </Menu>
        )}
        <Modal
          open={openModal}
          onClose={handleAddCloses}
          aria-labelledby='child-modal-title'
          aria-describedby='child-modal-description'
        >
          <Box
            sx={{
              ...style,
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              width: '20%',
              borderRadius: '9px',
              height: '40%',
              borderColor: 'none',
              position: 'absolute',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              boxShadow: 24,
              border: 'none !important',
              overflow: 'auto' // Add scroll functionality
            }}
          ></Box>
        </Modal>
        {/* <Box px={1}>
          <Box sx={{
            border:'1px solid',
            borderColor:'primary.main',
            p:2,
            borderRadius:'calc(20px/2)',
            maxHeight:'30vh',
          }}>
            <TextField 
             maxRows={5}
             fullWidth
             multiline
             variant='standard'
             placeholder='Reply'
             value={keyword}
             onChange={e =>setKeyWord(e.target.value)}
             InputProps={{
              disableUnderline: true
            }}
            />
           <Box>

           </Box>
            
          </Box>

        </Box> */}
      </Box>
      <Box px={1} sx={{ display: 'flex' }}>
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'primary.main',
            p: 2,
            borderRadius: 'calc(20px/2)',
            maxHeight: '30vh',
            width: '85%',
         
          }}
        >
          {!isEditorOpen && (
            <TextField
              maxRows={5}
              multiline
              variant='standard'
              placeholder='Reply'
              value={keyword}
              onChange={e => setKeyWord(e.target.value)}
              InputProps={{
                disableUnderline: true
              }}
              
              onKeyDown={handleKeyDown}
            />
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              position: 'sticky',
              bottom: 0
            }}
          >
            {isEditorOpen && (
              <Box sx={{marginBottom:'15vh'}}>
                <Editor
                  editorState={editorState}
                  toolbarClassName='toolbarClassName'
                  wrapperClassName='wrapperClassName'
                  editorClassName='editorClassName'
                  onEditorStateChange={onEditorStateChange}
                  toolbar={{
                    options: [
                      "inline",
                      "blockType",
                      "fontSize",
                      "list",
                      "textAlign",
                      "colorPicker",
                      "link",
                      "emoji",
                      "history",
                    ],
                    link: {
                      options: ["link"],
                    },
                    inline: {
                      inDropdown: true,
                      options: [
                        "bold",
                        "italic",
                        "underline",
                        "strikethrough",
                      ],
                    },
                    blockType: {
                      inDropdown: true,
                      options: [
                        "Normal",
                        "H1",
                        "H2",
                        "H3",
                        "H4",
                        "H5",
                        "H6",
                        "Blockquote",
                      ],
                    },
                    fontSize: {
                      inDropdown: true,
                      options: [8, 9, 10, 11, 12, 14, 16, 18, 24],
                    },
                    fontFamily: {
                      inDropdown: true,
                      options: [
                        "Arial",
                        "Georgia",
                        "Impact",
                        "Tahoma",
                        "Times New Roman",
                        "Verdana",
                      ],
                    },
                    list: { inDropdown: true },
                    textAlign: { inDropdown: true },
                    history: { inDropdown: false },
                  }}

                />
              </Box>
            )}
          </Box>
        </Box>
        <Box>
        <IconButton
            aria-label='more'
            id='long-button'
            aria-haspopup='true'
            onClick={handleEditorOpen}
          >
            <FormatColorTextIcon color={iconColor}/>
          </IconButton>
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
        </Box>
        <Box>
          <IconButton
            type='submit'
            aria-label='more'
            id='long-button'
            aria-haspopup='true'
            disabled={sendMessageGroupLoading || isLoading || isFetching}
            onClick={sendMessageGroup}
          >
            <SendIcon color='primary' />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}

export default GroupChatDetails
