import React, { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { styled, useTheme } from '@mui/material/styles'
import MuiDrawer from '@mui/material/Drawer'
import MuiAppBar from '@mui/material/AppBar'
import LockResetIcon from '@mui/icons-material/LockReset'
import SearchIcon from '@mui/icons-material/Search'
import {
  Avatar,
  Box,
  CssBaseline,
  Divider,
  IconButton,
  List,
  ListItemIcon,
  Menu,
  MenuItem,
  Popover,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  InputAdornment,
  TextField
} from '@mui/material'
import GroupsIcon from '@mui/icons-material/Groups'
import ChatIcon from '@mui/icons-material/Chat'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import SideBarListItem from './sideBarListItem'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slice/authSlice'
import PersonAdd from '@mui/icons-material/PersonAdd'
import Settings from '@mui/icons-material/Settings'
import Logout from '@mui/icons-material/Logout'
import { MaterialUISwitch } from './backgroundSwitch'
import { themeSelector } from '../../store/selectors/ThemeSelectors'
import { changeTheme } from '../../store/slice/themeSlice'
import GetMyProfileImage from './getMyProfileImage'
import { accessTokenSelector } from '../../store/selectors/AuthSelectors'
import { socketActions } from '../../store/slice/socketSlice'
import SearchBar from 'material-ui-search-bar'
import axios from 'axios'
import SearchMessage from '../chat/searchMessages'
import { selectChatId } from '../../store/slice/chatSlice'

// import { useUsersQuery } from '../../api/userApi'

const { REACT_APP_API_ENDPOINT } = process.env

const Header = ({ onSelect, recentLoading }) => {
  const drawerWidth = 240
  const navigate = useNavigate()

  const themeColor = useSelector(themeSelector)
  const token = useSelector(accessTokenSelector)
  const [anchorEl, setAnchorEl] = React.useState(null)
  const location = useLocation()
  const [checked, setChecked] = React.useState(
    themeColor === 'light' ? false : true
  )
  const theme = useTheme()
  const dispatch = useDispatch()

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const [open, setOpen] = React.useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const matches = useMediaQuery(theme.breakpoints.only('xs'))
  const openProfile = Boolean(anchorEl)
  const netPage = useRef(1)
  const [users, setUsers] = useState([])
  const [apiStatus, setapiStatus] = useState(false)
  const totalPages = useRef(1)
  const [page, setpage] = useState(1)
  const scrollStop = useRef(true)
  const openModal = Boolean(anchorEl)
  const [modalstatus, setModalstatus] = useState(false)

  const popCloseAndSelect = (e, keyword) => {
    // onSelect(e, keyword);
    dispatch(selectChatId({ id: keyword }))
    console.log(keyword)
    setModalstatus(false)
    handleClose()
  }

  useEffect(() => {
    if (token) {
      dispatch(socketActions.startConnecting())
    }
  }, [token, dispatch])

  const handleDrawerOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setAnchorEl(null)
    setModalstatus(false)
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  const handleThemeChange = e => {
    if (e.target.checked) {
      dispatch(changeTheme({ theme: 'dark' }))
      setChecked(true)
    } else {
      setChecked(false)
      dispatch(changeTheme({ theme: 'light' }))
    }
  }
  useEffect(() => {
    console.log(location.pathname === '/chat')
  }, [location])
  const handleDrawerClose = () => {
    setOpen(false)
  }
  const openedMixin = theme => ({
    width: drawerWidth,
    background: 'primary',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    overflowX: 'hidden',
    display: 'flex',
    justifyContent: 'space-between'
  })
  const closedMixin = theme => ({
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
      width: `calc(${theme.spacing(8)} + 1px)`
    },
    display: 'flex',
    justifyContent: 'space-between'
  })
  const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar
  }))
  const AppBar = styled(MuiAppBar, {
    shouldForwardProp: prop => prop !== 'open'
  })(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    ...(open && {
      [theme.breakpoints.up('sm')]: {
        // width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen
        })
      },
      [theme.breakpoints.only('xs')]: {
        zIndex: 0
      }
    })
  }))
  const Drawer = styled(MuiDrawer, {
    shouldForwardProp: prop => prop !== 'open'
  })(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
      display: 'flex',
      justifyContent: 'space-between',
      [theme.breakpoints.only('xs')]: {
        position: 'absolute'
      }
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
      [theme.breakpoints.only('xs')]: {
        display: 'none'
      }
    })
  }))

  //SEARCH

  const [allUserParam, setAllUserParam] = useState({
    page: 1,
    keyword: '',
    siz: 1
  })
  const timer = useRef(null)

  //search message
  const [searchValue, setSearchValue] = useState('')
  const wordChange = a => {
    let e = a.target.value
    setSearchValue(e)
    setModalstatus(true)
    console.log('new search')
    netPage.current = 1
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const keyword = e

      console.log(e)
      setAllUserParam(prev => ({
        ...prev,
        keyword: keyword,
        page: 1
      }))
      const headers = {
        Authorization: `SLING ${token}`,
        'Content-Type': 'form-data'
      }
      console.log(setAllUserParam, 'gggggggggggg')
      axios
        .get(`${REACT_APP_API_ENDPOINT}message`, {
          params: { keyword: keyword },
          headers: headers
        })
        .then(response => {
          setUsers(response.data.docs)
          console.log(keyword)
        })
        .catch(error => {
          console.error('Error fetching search results:', error)
        })
    }, 1000)
  }
  useEffect(() => {
    if (users) setapiStatus(false)
  }, [users])

  const onInfiniteScroll = value => {
    let nextPage = netPage.current
    if (value === 'top' && nextPage > 1 && !apiStatus) {
      setapiStatus(true)
      nextPage = nextPage - 1
      // netPage.current = nextPage
    } else if (
      value === 'bottom' &&
      nextPage < totalPages.current &&
      !apiStatus
    ) {
      setapiStatus(true)
      console.log(value, '--------------')
      console.log(nextPage)
      nextPage = nextPage + 1
      console.log(nextPage, '?????????????????????????')
      netPage.current = nextPage
      setpage(nextPage)
    } else {
      console.log('else if if ')
      scrollStop.current = false
    }
    setAllUserParam(prev => ({
      ...prev,
      page: netPage.current
    }))
  }

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar color='background' position='fixed' open={open}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            {/* open button */}
            <IconButton
              color='inherit'
              aria-label='open drawer'
              onClick={handleDrawerOpen}
              edge='start'
              sx={{
                marginRight: 5,
                ...(open && { display: 'none' })
              }}
            >
              <MenuIcon color='primary' />
            </IconButton>
            {/* sidebar close button */}
            <IconButton
              onClick={handleDrawerClose}
              color='primary'
              aria-label='close drawer'
              sx={{
                marginRight: 5,
                ...(!open && { display: 'none' })
              }}
              edge='start'
            >
              {theme.direction === 'rtl' ? (
                <ChevronRightIcon color='primary' />
              ) : (
                <ChevronLeftIcon color='primary' />
              )}
            </IconButton>
            {/* Heading */}

            <TextField
              placeholder='Search'
              autoComplete='off'
              value={searchValue}
              onChange={wordChange}
              sx={{marginLeft:'450px'}}
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

            {/* <input
              value={searchValue}
              onChange={wordChange}
              sx={{
                height: '48px',
                display: 'flex',
                justifycontent: 'center',
                width: '50vh'
              }}
            /> */}

            <Box></Box>
            {/* profile button */}
            <Box sx={{ flexGrow: 0 }}>
              <MaterialUISwitch
                checked={checked}
                onChange={handleThemeChange}
              />
              <Tooltip title='Account settings'>
                <IconButton
                  onClick={handleClick}
                  size='small'
                  sx={{ ml: 2 }}
                  aria-controls={openProfile ? 'account-menu' : undefined}
                  aria-haspopup='true'
                  aria-expanded={openProfile ? 'true' : undefined}
                >
                  <GetMyProfileImage />
                </IconButton>
              </Tooltip>
              <Menu
                // anchorEl={anchorEl}
                id='account-menu'
                open={openProfile}
                onClose={handleClose}
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
                <MenuItem onClick={() => navigate('/proFile')}>
                  <Avatar /> Profile
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  <Avatar /> My account
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleClose}>
                  <ListItemIcon>
                    <PersonAdd fontSize='small' />
                  </ListItemIcon>
                  Add another account
                </MenuItem>
                <MenuItem onClick={() => navigate('/proFile')}>
                  <ListItemIcon>
                    <Settings fontSize='small' />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <MenuItem onClick={() => navigate('/changePassword')}>
                  <ListItemIcon>
                    <LockResetIcon fontSize='small' />
                  </ListItemIcon>
                  Change Password
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    localStorage.clear()
                    dispatch(logout())
                  }}
                >
                  <ListItemIcon>
                    <Logout fontSize='small' />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Drawer
          variant='permanent'
          open={open}
          sx={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <Box component={'div'}>
            <DrawerHeader>
              <IconButton onClick={handleDrawerClose}>
                {theme.direction === 'rtl' ? (
                  <ChevronRightIcon />
                ) : (
                  <ChevronLeftIcon />
                )}
              </IconButton>
            </DrawerHeader>
            <Divider />
            <List disablePadding>
              <SideBarListItem
                text={'Chat'}
                Icon={ChatIcon}
                open={open}
                index={location.pathname === '/chat' ? true : false}
                onClick={() => {
                  navigate('/chat')
                  handleDrawerClose()
                }}
                disablePadding
                sx={{ display: 'block' }}
              />

              <SideBarListItem
                text={'Group Chat'}
                index={location.pathname === '/group' ? true : false}
                open={open}
                Icon={GroupsIcon}
                disablePadding
                onClick={() => {
                  navigate('/group')
                  handleDrawerClose()
                }}
                sx={{ display: 'block' }}
              />
            </List>
          </Box>
          <Box component={'div'}>
            <List disablePadding>
              <SideBarListItem
                text={'Setting'}
                Icon={Settings}
                open={open}
                index={location.pathname === '/settings' ? true : false}
                onClick={() => {
                  navigate('/settings')
                  handleDrawerClose()
                }}
                disablePadding
                sx={{ display: 'block' }}
              />
            </List>
          </Box>
        </Drawer>
        <Box
          component='main'
          sx={{
            flexGrow: 1,

            minHeight: '100vh',
            maxWidth: '100vw',
            backgroundColor: open && matches ? ' rgba(0, 0, 0, 0.5)' : ''
          }}
        >
          <DrawerHeader />

          <Outlet />
        </Box>
      </Box>

      <Popover
        className='searchModalStyle'
        open={modalstatus}
        anchorEl={anchorEl}
        disableAutoFocus={true}
        disableEnforceFocus={true}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        {modalstatus && (
          <SearchMessage
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
    </>
  )
}

export default Header
