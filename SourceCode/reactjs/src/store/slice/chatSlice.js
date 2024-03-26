import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    id:""
}
const chatSlice = createSlice({
    name:"chat",
    initialState:initialState,
    reducers:{
        selectChatId:(state, {payload})=>{
            state.id = payload.id
        }
    }
})

export default chatSlice.reducer;

export const {selectChatId} = chatSlice.actions;