import { IconButton, InputAdornment, Popover, TextField } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useRef, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import { useUsersQuery } from '../../api/userApi'
import SearchChat from './searchChat'
import RecentChatListInner from './recentChatListInner'
import RecentChatLIstInnerSkelton from './recentChatLIstInnerSkelton'

const RecentChatList = ({ userList, onSelect, recentLoading }) => {
  
  const netPage = useRef(1)
  const totalPages = useRef(1)
const scrollStop = useRef(true)
  const [apiStatus, setapiStatus] = useState(false)
  const [page, setpage] = useState(1)
  
  const [allUserParam, setAllUserParam] = useState({
    page: 1,
    keyword: '',
    createdAt: -1
  })
  const timer = useRef(null)

  const { data: allUsers, isLoading: allUsersLoading } = useUsersQuery(
    allUserParam,
    {
      refetchOnMountOrArgChange: true
    }
  )

  const [users, setUsers] = useState([])
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const open = Boolean(anchorEl)
  
  const handleClose = () => {
    setAnchorEl(null)
  }
  const popCloseAndSelect = (e, id) => {
    onSelect(e, id)
    handleClose()
  }

  const handleClick = event => {

    setAnchorEl(event.currentTarget)
   
  }
  const id = open ? 'simple-popover' : undefined

    function checkAndPushArray(arr1, arr2) {
      
      const newArray = [...arr1]; // Create a copy of arr1
    
      for (let i = 0; i < arr2.length; i++) {
        const currentElement = arr2[i];
        let isPresent = false;
    
        for (let j = 0; j < newArray.length; j++) {
          if (newArray[j]._id === currentElement._id) {
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
  
    if (allUsers) {
      // setUsers((prevUsers) => [...prevUsers, ...allUsers.docs])
        const newArray = checkAndPushArray(users, allUsers.docs)
        setUsers(newArray)
     
      totalPages.current = allUsers.totalPages
    }
  }, [allUsers])

useEffect(() => {
  if(users)
  setapiStatus(false)
}, [users])


  useEffect(() => {
    
    setSearchLoading(allUsersLoading)
  }, [allUsersLoading])

  const onKeyWordChange = e => {
    e.preventDefault()
    netPage.current = 1
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setAllUserParam(prev => ({
        ...prev,
        keyword: e.target.value,
        page: 1
      }))
    }, 1000)

    handleClick(e)
  }

  const onInfiniteScroll = value => {
    let nextPage = netPage.current
    if (value === 'top' && nextPage > 1 && !apiStatus) {
      setapiStatus(true)
      nextPage = nextPage - 1
      // netPage.current = nextPage
    } else if (value === 'bottom' && nextPage < totalPages.current && !apiStatus) {
      setapiStatus(true)
      nextPage = nextPage + 1
      netPage.current = nextPage
      setpage(nextPage)
    }else{
      scrollStop.current=false
    }
    setAllUserParam(prev => ({
      ...prev,
      page: netPage.current
    }))
  }

  return (
    <Box
      component={'div'}
      width={'25%'}
      height={'calc(100vh - 64px)'}
      sx={{
        borderRight: '1px solid',
        backgroundColor: 'backround.paper',
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
          placeholder='Search'
          fullWidth
          autoComplete='off'
          value={allUserParam.id}
          onChange={onKeyWordChange}
          sx={{
            // width: "80%",
            px: 1,
            py: 2
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='end'>
                <SearchIcon sx={{ mr: 1 }} color='primary' />
              </InputAdornment>
            ),
            disableUnderline: true
          }}
          variant='standard'
        />

        <Box component={'span'} sx={{ display: 'flex' }}>
          <IconButton aria-label='more' id='long-button' aria-haspopup='true'>
            <FilterAltIcon color='primary' />
          </IconButton>
        </Box>
      </Box>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        disableAutoFocus={true}
        disableEnforceFocus={true}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        {open && (
          <SearchChat
            list={users}
            isLoading={searchLoading}
            onSelect={popCloseAndSelect}
            onInfinte={onInfiniteScroll}
            stopScroll={scrollStop.current}
            curentPage={page}
            totalPages={totalPages.current}
          />
        )}
      </Popover>
      <Box
        component={'div'}
        className='chat-list'
        height={'calc(100vh - 130px)'}
        sx={{ backgroundColor: 'background.paper' }}
      >
        {recentLoading ? (
          <RecentChatLIstInnerSkelton />
        ) : (
          
          <RecentChatListInner userList={userList} onSelect={onSelect} />
        )}
      </Box>
    </Box>
  )
}

export default RecentChatList
