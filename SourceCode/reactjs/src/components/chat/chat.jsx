import React, { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import {
  useMessageDetailsQuery,
  useRecentMessageQuery
} from '../../api/userApi'

import RecentChatList from './recentChatList'
import ChatDetails from './chatDetails'
import { useDispatch } from 'react-redux'
import { selectChatId } from '../../store/slice/chatSlice'
import { store } from '../../store/store'
import { socketActions } from '../../store/slice/socketSlice'

const Chat = () => {
  const params = {
    size: 20,
    page: 1,
    keyword: ''
  }
  const dispatch = useDispatch()
  const [selectedId, setSelectedId] = useState({ id: '' })
  const [chatLoading, setChatLoading] = useState(false)
  const [hasNext, setHasNext] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [messageList, setMessageList] = useState([])
  const [userList, setUserList] = useState([])
  const [chatParams, setChatParams] = useState({
    id: selectedId?.id,
    size: 16,
    page: currentPage
  })

  const {
    data: users,
    isLoading: recentChatLoading,
  } = useRecentMessageQuery(params, {
    // refetchOnMountOrArgChange: true,
  })

  const {
    data: chat,
    isLoading: chatDetailsLoading,
    isFetching: chatDetailsFetching,
    refetch: refetchChat
  } = useMessageDetailsQuery(chatParams, {
    skip: !selectedId?.id
  })

  useEffect(() => {
    if (chatDetailsFetching === false && chatDetailsLoading) {
      setChatLoading(false)
    }
  }, [chatDetailsFetching, chatDetailsLoading])

  useEffect(() => {
    console.log(chat?.docs, 'new chat recieved')
  }, [chat])

  const hanldeSelect = (e, id) => {
    e.preventDefault()
    dispatch(selectChatId({ id: id }))
    setSelectedId({ id: id })
    setChatParams(prev => ({
      ...prev,
      id: id
    }))
    setChatLoading(true)
  }

  useEffect(() => {
    if (users?.docs.length > 0) {
      setUserList(users.docs)
    }
  }, [users])

  useEffect(() => {
    if (chat) {
      // setUsers((prevUsers) => [...prevUsers, ...allUsers.docs])
      const newArray = checkAndPushArray(messageList, chat?.docs?.message)
      setMessageList(newArray)
    }
    console.log(chat, 'chat next page')
    setHasNext(chat?.hasNextPage)
  }, [chat])


  const callNextPage = () => {
    
    // if(chat?.hasNext){
      
      setChatParams(prev => ({
        ...prev,
        page: prev?.page + 1
      }));
    // }
  }

  function checkAndPushArray(arr1, arr2) {
    const newArray = [...arr1]; // Create a copy of arr1
  
    for (const currentElement of arr2) {
      let isPresent = false;
  
      for (const item of newArray) {
        if (item._id === currentElement._id) {
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

  const handleNewMessage = newMessage => {
    setMessageList(prev => [newMessage, ...prev])
    setCurrentPage(1);
  }

  useEffect(() => {
    if (selectedId.id) {
      let newParams = { id: selectedId.id, size: 16, page: currentPage }
      setMessageList([])
      setChatParams(newParams)
      refetchChat(newParams)
    }
  }, [selectedId, currentPage, refetchChat])

  
  return (
    <Box component={'div'} sx={{ display: 'flex' }}>
      {userList && (
        <RecentChatList
          recentLoading={recentChatLoading}
          userList={userList}
          onSelect={hanldeSelect}
        />
      )}
      {(chat || chatDetailsLoading || chatDetailsFetching) && (
        <ChatDetails
          isLoading={chatDetailsLoading}
          isFetching={chatDetailsFetching}
          chatDetailsLoading={chatDetailsLoading}
          chatLoading={chatLoading}
          messageList={messageList}
          timeList={chat?.docs?.message?.timestamp}
          name={chat?.docs?.receiver?.receiverName}
          email={chat?.docs.receiver?.receiverEmail}
          profileImage={chat?.docs?.receiver?.profileImage}
          id={chat?.docs?.receiver?.receiverId}
          blocked={chat?.docs?.receiver?.isBlocked}
          callNextPage={callNextPage}
          handleNewMessage={handleNewMessage}
        />
      )}
    </Box>
  )
}

export default Chat
