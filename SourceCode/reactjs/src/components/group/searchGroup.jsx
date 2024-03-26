import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  Divider,
  Box,
  Skeleton,
  ListItemText
} from '@mui/material'
import React, { useState,useRef,useEffect} from 'react'
import { generateColorHsl } from '../../utils/generateColorHsl'

function SearchGroup ({list, isLoading, onSelect,onInfinte,totalPages,page,nextPage}) {
  const [array] = useState([1, 2, 3])
  const infinity = useRef(null)
  const currentPge = useRef(1)

  useEffect(() => {
    console.log(list,'listssssssssssssssssssss');
    const divQWE = infinity.current;
  
    const handleScroll = () => {
      console.log("listssssssssssssssssssss");
      if (divQWE && divQWE.scrollTop === 0) {
        console.log("top");
        onInfinte("top");
      } else if (divQWE && divQWE.scrollTop + divQWE.clientHeight + 30 >= divQWE.scrollHeight) {
        console.log("bottom")
        if (currentPge.current < totalPages) {
          currentPge.current = currentPge.current + 1;
          divQWE.scrollTop = 150;
        }
        onInfinte("bottom");
      }
    };
  
    if (divQWE) {
      divQWE.addEventListener("scroll", handleScroll);
    }
  
    return () => {
      if (divQWE) {
        divQWE.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);
  

  useEffect(() => {
   
  }, [isLoading, page])


  const searchSelect = (e, id) => {
    // onSelect(e, id)
  }
  return (
    <List sx={{ width: 300, backgroundColor: 'background.paper' }}  ref={infinity}>
      {list?.length > 0 &&
        !isLoading &&
        list.map(({ _id, name, image }, index) => {
          let color
          const GroupName =
          name && name?.length > 0 && name[0]?.toUpperCase() + name?.slice(1)
          if (!image) {
            color = generateColorHsl(name || ' ', [40, 60], [40, 60])
          }
          return (
            <Box key={_id} component={'span'}>
              <ListItem alignItems='flex-start'>
                <ListItemButton onClick={e => searchSelect(e, _id)}>
                  <ListItemAvatar>
                    {image ? (
                      <Avatar src={image} />
                    ) : (
                      <Avatar sx={{ bgcolor: color }}>
                        {GroupName && GroupName[0]}
                      </Avatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={GroupName}
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
            <ListItem alignItems='flext-start'>
              <ListItemAvatar>
                <Skeleton
                  animation='wave'
                  variant='circular'
                  width={40}
                  height={40}
                />
              </ListItemAvatar>
              <ListItemText
                primary={<Skeleton animation='wave' height={10} width='40%' />}
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
            {
              index !== array.length - 1 &&(
                <Divider variant='middle' component='li'/>
              )  
            }
          </Box>
        ))}
         {!isLoading && !list.length && (
        <Box component={'span'}>
          <ListItem alignItems='flex-start'>No groups</ListItem>
        </Box>
      )}
    </List>
  )
}

export default SearchGroup
