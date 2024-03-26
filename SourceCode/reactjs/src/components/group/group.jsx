import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Button,
  Modal,
  IconButton,
  Popover
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import Multiselect from 'multiselect-react-dropdown'
import axios from 'axios'
import './group.css'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import { useUploadImageMutation, useViewGroupQuery } from '../../api/userApi'
import SearchGroup from './searchGroup'
import RecentGroupChat from './recentGroupChat'
import GroupChatDetails from './groupChatDetails'

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

const { REACT_APP_API_ENDPOINT } = process.env

const Group = ({ onSelect ,isLoading}) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [opens, setOpens] = useState(false)
  const open = Boolean(anchorEl)
  const openGroup = Boolean(anchorEl)
  const _id = openGroup ? 'simple-popover' : undefined
  const id = open ? 'simple-popover' : undefined
  const [data, setData] = useState([])
  const [members, setMembers] = useState([])
  const [previewImage, setPreviewImage] = useState(null)
  const netPage = useRef(1)
  const totalPages = useRef(1)
  const [profileImage, setProfileImage] = useState('')
  const [fileSizeError, setFileSizeError] = useState('')
  const [fileTypeError, setFileTypeError] = useState('')
  const [uploadImage] = useUploadImageMutation()
  const [isFormComplete, setIsFormComplete] = useState(false)
  const [group, setGroup] = useState()
  const [apiStatus, setapiStatus] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [page, setpage] = useState(1)
  const scrollStop = useRef(true)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: ''
    }
  })

  //list groups api call functions
  const [allGroupsParam, setAllGroupsParam] = useState({
    keyword: '',
    page: 1
  })

  const timer = useRef(null)

  const { data: allGroups, isLoading: allGroupsLoading } = useViewGroupQuery(
    allGroupsParam,
    {
      refetchOnMountOrArgChange: true
    }
  )
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

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    reset()
    setPreviewImage(null)
  }

  const handleOpen = () => {
    setOpens(true)
  }

  const handleCloses = () => {
    setOpens(false)
    reset()
    setPreviewImage(null)
  }

  useEffect(() => {
    getMessage()
  }, [])

  const getMessage = () => {
    axios
      .get(`${REACT_APP_API_ENDPOINT}user`)
      .then(response => {
        setData(response.data.docs)
      })
      .catch(error => {
        console.error(error)
      })
  }
 

  //validation error messages
  useEffect(() => {
    setIsFormComplete(!errors.name&& members?.length > 0 )
    console.log(data.name,'sssssssssssssssssssssssssssssssshshshs');
  }, [errors, members])

  //Create group function
  const onSubmit = data => {
    const currentUserID = 'YOUR_CURRENT_USER_ID'
    const updatedMembers = members.filter(
      member => member.value !== currentUserID
    )
    let requestData
    console.log(profileImage,'ffffffff');
    if (profileImage.length <= 0) {
      console.log(profileImage,'iiiiiiiiiiiiiiiiiiiiffffffff');
      requestData = {
        name: data.name,
        members: updatedMembers.map(member => member.value),
        
      }
    } else {
      console.log(profileImage,'elaseeeeeeeeeeeeeeeeee');
      requestData = {
        name: data.name,
        members: updatedMembers.map(member => member.value),
        image: profileImage
      }
    }
   
    axios
      .post(`${REACT_APP_API_ENDPOINT}group`, requestData)
      .then(response => {
        console.log(response.data)
        toast.success('Group created successfully!', {
          className: 'toast-success',
          position: 'top-center'
        })
        handleCloses()
      })
      .catch(error => {
        console.error(error.response)
        toast.error('Failed to create group.', {
          className: 'toast-success',
          position: 'top-center'
        })
      })
  }

  const popCloseAndSelect = (e, id) => {
    onSelect(e, id)
    handleClose()
  }

  function checkAndPushArray(arr1, arr2) {
    const newArray = Array.isArray(arr1) ? [...arr1] : []; // Create a copy of arr1 if it is an array, otherwise initialize newArray as an empty array
  
    for (const currentElement of arr2) {
      let isPresent = false;
  
      for (const element of newArray) {
        if (element._id === currentElement._id) {
          isPresent = true;
          break;
        }
      }
      if (!isPresent) {
        newArray.push(currentElement);
      }
    }
    return newArray;
  }

  useEffect(() => {
    console.log(allGroups, 'groupss')
    if (allGroups) {
      const newArray = checkAndPushArray(group, allGroups?.docs)
      setGroup(allGroups?.docs)
      console.log(newArray, 'newArray')

      totalPages.current = allGroups?.totalPages
    }
  }, [allGroups])

  useEffect(() => {
    if (group) setapiStatus(false)
  }, [group])

  useEffect(() => {
    setSearchLoading(allGroupsLoading)
  }, [allGroupsLoading])

  const onKeyWordSearch = e => {
    console.log('clickeddddd')
    e.preventDefault()
    netPage.current = 1
    clearTimeout(timer?.current)
    timer.current = setTimeout(() => {
      setAllGroupsParam(prev => ({
        ...prev,
        keyword: e.target.value
      }))
    }, 1000)
  }

  const onInfiniteScroll = value => {
    let nextPage = netPage.current
    if (value === 'top' && nextPage > 1 && !apiStatus) {
      setapiStatus(true)
      nextPage = nextPage - 1
    } else if (
      value === 'button' &&
      nextPage < totalPages.current &&
      !apiStatus
    ) {
      setapiStatus(true)
      nextPage = nextPage + 1
      netPage.current = nextPage
      setpage(nextPage)
    } else {
      scrollStop.current = false
    }
    setAllGroupsParam(prev => ({
      ...prev,
      page: netPage.current
    }))
  }

  const loadNext = () => {
    setAllGroupsParam(prev => ({
      ...prev,
      page: allGroupsParam + 1
    }))
  }
  const [detaildATA, setdetaildATA] = useState({})
  const setDetails =(data)=>{
    console.log(data?.docs,"dddddddddddddd-----------------------------------------------")
    setdetaildATA(data?.docs)
  }


  return (
     <Box component={"div"} sx={{ display: "flex" }}>
    <Box
      component={'div'}
      width={'25%'}
      height={'calc(100vh - 64px)'}
      sx={{
        borderRight: '1px solid',
        bgcolor: 'background.paper',
        borderColor: 'background.border'
      }}
    >
      <Box
        component={'div'}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 99,
          bgcolor: 'background.paper',
          display: 'flex',
          borderBottom: '1px solid',
          borderColor: 'background.border'
        }}
      >
        <TextField
          placeholder='New space'
          fullWidth
          autoComplete='off'
          sx={{
            px: 1,
            py: 2
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='end'>
                <AddIcon sx={{ mr: 1 }} color='primary' />
              </InputAdornment>
            ),
            disableUnderline: true
          }}
          variant='standard'
          onClick={handleClick}
        />
      </Box>

      <Menu
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
        PaperProps={{
          style: { minWidth: '300px', height: '347px' }
        }}
      >
        <TextField
          placeholder='Groups'
          fullWidth
          autoComplete='off'
          variant='standard'
          value={allGroupsParam?.id}
          onChange={onKeyWordSearch}
          sx={{
            px: 1,
            py: 2
          }}
          InputProps={{
            startAdornment: <InputAdornment position='end'></InputAdornment>
          }}
        ></TextField>

        <MenuItem
          sx={{ color: 'grey', display: 'flex', alignItems: 'center' }}
          onClick={handleOpen}
          onClose={handleClose}
        >
          <GroupAddIcon sx={{ marginRight: '10px' }} />
          Create Group
        </MenuItem>

        {openGroup && (
          <SearchGroup
            list={group}
            isLoading={searchLoading}
            onSelect={popCloseAndSelect}
            onInfinte={onInfiniteScroll}
            stopScroll={scrollStop.current}
            currentPage={page}
            totalPages={totalPages.current}
            nextPage={loadNext}
          />
        )}
      </Menu>

      {/* <Popover
        id={_id}
        open={openGroup}
        anchorEl={anchorEl}
        disableAutoFocus={true}
        disableEnforceFocus={true}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      > */}

      {/* </Popover> */}
      <Modal
        open={opens}
        onClose={handleCloses}
        aria-labelledby='child-modal-title'
        aria-describedby='child-modal-description'
      >
        <Box
          sx={{
            ...style,
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            width: '52vh',
            borderRadius: '9px',
            height: '45%',
            borderColor: 'none',
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            border: 'none !important'
          }}
        >
          <div
            style={{
              fontFeatureSettings: 'liga',
              fontVariantLigatures: 'no-contextual',
              fontSize: '1.375rem',
              fontWeight: '400',
              lineHeight: '1.75rem',
              marginTop: '30px'
            }}
          >
            Create group
          </div>

          <div style={{ paddingLeft: '7px' }}>
            <img
              style={{
                borderRadius: '50%',
                height: '100px',
                width: '100px'
              }}
              src={
                previewImage
                  ? previewImage
                  : 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/480px-Default_pfp.svg.png'
              }
              alt=''
              height={40}
              width={40}
            />
            <IconButton
              backgroundColor='black'
              aria-label='upload picture'
              component='label'
              sx={{ width: '0px', height: '0pc' }}
            >
              <input
                hidden
                accept='image/*'
                type='file'
                onChange={fileUpload}
              />
              <PhotoCamera
                sx={{
                  color: 'lightgray',
                  marginLeft: '-4vh',
                  marginTop: '-2vh'
                }}
              />
            </IconButton>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register('name', {
                required: 'Group name is required',
                minLength: {
                  value: 3,
                  message: 'Group name should be at least 3 characters long'
                },
                maxLength: {
                  value: 50,
                  message: 'Group name should not exceed 50 characters'
                }
              })}
              placeholder='Group name'
              fullWidth
              autoComplete='off'
              sx={{
                px: 1,
                py: 2,
                '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline':
                  {
                    borderColor: 'red'
                  }
              }}
              inputProps={{
                style: { paddingLeft: '5px' }
              }}
              variant='standard'
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <Multiselect
              options={data.map(user => ({
                label: user.name,
                value: user._id
              }))}
              placeholder='Enter name'
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
            <Button
              style={{
                bottom: '-30px',
                left: '25vh',
                borderRadius: '20px',
                color: 'blue'
              }}
              onClick={handleCloses}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              style={{
                bottom: '-30px',
                left: '27vh',
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
          </form>
        </Box>
      </Modal>
      <Box
        component={'div'}
        className='grop-chat'
        height={'calc(100vh - 130px)'}
        sx={{
          bgcolor: 'background.paper',
          maxHeight: '90%',
          overflowY: 'auto'
        }}
      >
        <RecentGroupChat onSelect={onSelect} detailsdata={setDetails} />
      </Box>
    </Box>

   {detaildATA.name?.length >0 && <GroupChatDetails data={detaildATA} isLoading={isLoading}/>
}

    </Box>

  )
}

export default Group
