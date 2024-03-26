import {
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Skeleton
} from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useRef, useState } from 'react'
import { generateColorHsl } from '../../utils/generateColorHsl'
import styles from './searchChat.module.css'

const SearchChat = ({ list, isLoading, onSelect, page ,onInfinte,stopScroll,curentPage,totalPages}) => {
  const infinity = useRef(null)
  const currentPge = useRef(1)
  const [array] = useState([1, 2, 3])

  

  useEffect(() => {
    const divQWE = infinity.current
    const handleScroll = () => {
      if (divQWE.scrollTop === 0) {
        
        // Perform actions when the scroll reaches the top
      onInfinte("top")
      } else if (
        divQWE.scrollTop + divQWE.clientHeight +30 >=
        divQWE.scrollHeight
      ) {
        
        if(currentPge.current < totalPages){
          currentPge.current=currentPge.current+1
                
        divQWE.scrollTop = 150;
        }   
       // Scroll to the top
        onInfinte("bottom")
        // Perform actions when the scroll reaches the bottom
      }
    }

    divQWE.addEventListener('scroll', handleScroll)

    return () => {
      divQWE.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
   
  }, [isLoading, page])

  const searchSelect = (e, id) => {
    onSelect(e, id)
    
  }

  return (
    <List
      sx={{ width: 300, bgcolor: 'background.paper' }}
      ref={infinity}
      className={styles.chatbox}
    >
      {list?.length > 0 &&
        !isLoading &&

        list.map(({ _id, name, email, profileImage }, index) => {
          let color
          const fullName = name&&  name?.length > 0 &&( name[0]?.toUpperCase() + name?.slice(1))
          if (!profileImage) {
            color = generateColorHsl(name ||" ", [40, 60], [40, 60])
          }

          return (
            <Box key={_id} component={'span'}>
              <ListItem alignItems='flex-start'>
                <ListItemButton onClick={e => searchSelect(e, _id)}>
                  <ListItemAvatar>
                    {profileImage ? (
                      <Avatar src={profileImage} />
                    ) : (
                      <Avatar sx={{ bgcolor: color }}>{fullName&&fullName[0]}</Avatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={fullName}
                    secondary={<React.Fragment>{email}</React.Fragment>}
                  />
                  
                </ListItemButton>
              </ListItem>
              {index !== list.length - 1 && (
                <Divider variant='middle' component='li' />
              )}
            </Box>
          )
        })}
      {isLoading &&
        array.map((res, index) => (
          <Box key={res} component={'span'}>
            <ListItem alignItems='flex-start'>
              <ListItemAvatar>
                <Skeleton
                  animation='wave'
                  variant='circular'
                  width={40}
                  height={40}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Skeleton
                    animation='wave'
                    height={10}
                    width='40%'
                    // style={{ marginBottom: 6 }}
                  />
                }
                secondary={
                  <React.Fragment>
                    {
                      <Skeleton
                        animation='wave'
                        height={10}
                        width='%'
                        style={{ marginBottom: 6 }}
                      />
                    }
                  </React.Fragment>
                }
              />
            </ListItem>
            {index !== array.length - 1 && (
              <Divider variant='middle' component='li' />
            )}
          </Box>
        ))}
      {!isLoading && !list.length && (
        <Box component={'span'}>
          <ListItem alignItems='flex-start'>No user</ListItem>
        </Box>
      )}
    </List>
  )
}

export default SearchChat
