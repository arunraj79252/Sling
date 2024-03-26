import React, { useEffect, useState } from 'react'
import {
  List,
  Box,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Divider,
  ListItemButton,
  Button
} from '@mui/material'
import { generateColorHsl } from '../../utils/generateColorHsl'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  groupListUpdateSelector,
  selectGroupChatIdSelector
} from '../../store/selectors/groupChatSelector'
import { selectGroupChatId } from '../../store/slice/groupChatSlice'

const { REACT_APP_API_ENDPOINT } = process.env

function RecentGroupChat ({ detailsdata, id }) {
  const [data, setData] = useState([])
  const [pageNumber, setPageNumber] = useState(1)
  const dispatch = useDispatch()
  const selectId = useSelector(selectGroupChatIdSelector)
  const groupListUpdate = useSelector(groupListUpdateSelector)

  const getMessage = (updatecall = false) => {
    axios
      .get(`${REACT_APP_API_ENDPOINT}group`, {
        params: {
          page: pageNumber
        }
      })
      .then(response => {
        if (updatecall) {
          setData([...response.data.docs])
        } else {
          setData([...data, ...response.data.docs])
        }
        console.log(response, 'groups details')
      })
      .catch(error => {
        // Handle error
        console.error(error)
      })
  }

  useEffect(() => {
    console.log(groupListUpdate, 'recent listtttttttttttttttttttttttt')
    let updatecall = true
    getMessage(updatecall)
  }, [groupListUpdate])

  useEffect(() => {
    getMessage()
  }, [pageNumber])

  const loadmore = () => {
    let newPageNumber = pageNumber + 1
    setPageNumber(newPageNumber)
  }

  const onSelect = id => {
    dispatch(selectGroupChatId({ id: id }))
    console.log(id, 'idddddddddddddd')
    axios.get(`${REACT_APP_API_ENDPOINT}group/${id}/message`).then(response => {
      console.log(response.data)
      detailsdata(response.data)
    })
  }

  return (
    <>
      <div>
        {' '}
        <List sx={{ width: '100%', bgcolor: 'background.papaer' }}>
          {data?.map(({ message, name, image, id }, index) => {
            let color
            const GroupName = name[0].toUpperCase() + name.slice(1)
            if (!image) {
              color = generateColorHsl(name, [40, 60], [40, 60])
            }

            return (
              <Box key={index} component={'span'}>
                <ListItem alignItems='flex-start'>
                  <ListItemButton
                    onClick={() => onSelect(id)}
                    sx={{
                      backgroundColor: selectId === id && 'background.select',
                      borderRadius: '8px'
                    }}
                  >
                    <ListItemAvatar>
                      {image ? (
                        <Avatar src={image} />
                      ) : (
                        <Avatar sx={{ bgcolor: color }}>{GroupName[0]}</Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      sx={{
                        '&.MuiListItemText-secondary , & .MuiListItemText-primary':
                          {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'flex',
                            justifyContent: 'space=between'
                          }
                      }}
                    >
                      <React.Fragment>
                        <Typography
                          variant='subtitle'
                          overflow={'hidden'}
                          textOverflow={'ellipsis'}
                          whiteSpace={'nowrap'}
                          component='span'
                        >
                          {GroupName}
                        </Typography>
                      </React.Fragment>
                    </ListItemText>
                  </ListItemButton>
                </ListItem>
                <Divider variant='middle' component='li' />
              </Box>
            )
          })}
        </List>
        <Button
          onClick={loadmore}
          style={{
            border: 'none',
            width: '100%',
            color: 'black',
            borderRadius: '68px',
            height: '4vh',
            display: 'flex',
            gap: '3px'
          }}
        >
          <ExpandMoreIcon />
          Show More
        </Button>
      </div>
    </>
  )
}

export default RecentGroupChat
