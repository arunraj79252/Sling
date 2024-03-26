import { Box } from '@mui/system'
import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectedIdSelector } from '../../store/selectors/ChatSelector'
import ChatInnerMessage from './chatInnerMessage'
import ChatMessagingSkelton from './chatMessagingSkelton'

const ChatMessage = ({
  messageList,
  id,
  recieverAvatar,
  isLoading,
  chatLoading,
  isFetching,
  callNextPage
}) => {
  const dispatch = useDispatch()
  const chatDiv = useRef(null)
  const selectedId = useSelector(selectedIdSelector)

  useEffect(() => {}, [selectedId])

  useEffect(() => {
    console.log(messageList)
  }, [messageList])


  useEffect(() => {}, [chatLoading, isFetching])

  useEffect(() => {
    const scrollableDiv = chatDiv.current
    const handleScroll = () => {
      console.log(scrollableDiv.scrollTop)
      if (scrollableDiv.scrollTop < -140) {
        // alert("get new page")
        console.log('call new page top')
        // scrollableDiv.scrollTop = scrollableDiv.scrollTop+5
        callNextPage()
      }

      // Perform actions when the scroll reaches the top
      if (scrollableDiv.scrollTop <= (scrollableDiv.scrollHeight * 1) / 5) {
      }
      // console.log('call new page');
      
    }

    scrollableDiv?.addEventListener('scroll', handleScroll)
    return () => {
      scrollableDiv?.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <Box
      className='chat-list'
      sx={{
        // height: "calc(100vh - 322px)" ,
        // overflowY: "auto",
        display: 'flex',
        flexDirection: 'column-reverse'
      }}
      ref={chatDiv}
    >
      {
        // true ? (
        isFetching && selectedId !== id ? (
          <Box>
            <ChatMessagingSkelton />
          </Box>
        ) : (
          messageList?.map(({ _id, sender, body, deleted }, index) => {
            let flag = false
            let parentFlag = false
            if (index > 0) {
              flag = messageList[index - 1].sender === sender ? true : false
            }

            if (index + 1 <= messageList.length - 1) {
              parentFlag =
                messageList[index + 1].sender === sender ? true : false
            }
            return (
              <Box key={_id}>
                <ChatInnerMessage
                  flag={flag}
                  parentFlag={parentFlag}
                  sender={sender}
                  id={id}
                  recieverAvatar={recieverAvatar(32)}
                  body={body}
                  messageId={_id}
                  deleted={deleted}
                />
              </Box>
            )
          })
        )
      }
    </Box>
  )
}

export default ChatMessage
