import React, { useState,useEffect } from 'react';
import { Box } from "@mui/material";
import RecentGroupChat from './recentGroupChat';
import { useDispatch } from "react-redux";
import { selectGroupChatId } from '../../store/slice/groupChatSlice';
import {useGroupMessageQuery} from "../../api/userApi"
import GroupChatDetails from './groupChatDetails';


const GroupChat = () => {
  const dispatch = useDispatch();
  const [selectId,setSelectId]=useState({id:""})
  const [chatLoading, setChatLoading] = useState(false);

  const {
    data:groupChat,
    isLoading: chatDetailsLoading,
    isFetching: chatDetailsFetching,
 }= useGroupMessageQuery(
    {id:selectId.id,size:50},
    {
        skip:!selectId.id
    }
 )

 useEffect(() => {
 if(chatDetailsFetching === false && chatDetailsLoading){
    setChatLoading(false);
 }

 }, [chatDetailsFetching, chatDetailsLoading])
 

  const hanldeSelect = (e,id)=>{
    e.preventDefault();
    dispatch(selectGroupChatId({id:id}));
    setSelectId({id:id});
    setChatLoading(true);
  }

  return (
    <Box component={'div'} sx={{display: "flex"}}>
      <RecentGroupChat 
      onSelect={hanldeSelect}
      />
      {(groupChat || chatDetailsLoading ||chatDetailsFetching)&&(
        <GroupChatDetails
        isLoading={chatDetailsLoading}
        isFetching={chatDetailsFetching}
        chatDetailsLoading={chatDetailsLoading}
        chatLoading={chatLoading}
        name={groupChat?.docs?.name}
        image={groupChat?.docs?.image}
        />
      )}

    </Box>
  );
}

export default GroupChat;
