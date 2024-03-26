import { createSlice} from "@reduxjs/toolkit";

const initialState ={
    id:"",
    listChange:false
}
const groupChatSlice = createSlice({

    name:"groupChat",
    initialState:initialState,
    reducers:{
        selectGroupChatId:(state, {payload})=>{
            state.id= payload.id
        },
        setListChangeFlag:(state, {payload})=>{
            console.log(payload)
            state.listChange= payload
        }
    }


})
export default groupChatSlice.reducer;
export const {selectGroupChatId,setListChangeFlag} =groupChatSlice.actions;