import React from 'react'
import {
  Avatar,
  Box,
  IconButton,
  Skeleton,
  Typography,
  Menu,
  MenuItem,
  Grid,
  Paper
} from '@mui/material'
function ViewGroupInfo () {
  return (
    <Box
      component={'div'}
      width={'75%'}
      height={'calc(100vh -66px)'}
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
          bgcolor: 'background.defalult',
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
          <Box
          component={'div'}
          sx={{display:'flex',justifyContent:'left',}}>
            <div  sx={{display:'flex',}}>
                Members
            </div>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default ViewGroupInfo
