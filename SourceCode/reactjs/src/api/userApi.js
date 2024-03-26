import { apliSlice } from './apiSlice'
import { io } from 'socket.io-client'
import { store } from '../store/store'


// const { REACT_APP_WEBSOCKET_URL } = process.env

export const userApi = apliSlice.injectEndpoints({

  endpoints: builder => ({
    users: builder.query({
      query: params => ({ url: 'user', method: 'get', params: params }),
      providesTags: ['Users']
    }),
    
    recentMessage: builder.query({
      query: params => ({ url: 'message', method: 'get', params: params }),
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.docs.map(({ receiverId }) => ({
                type: 'Recent',
                receiverId
              })),
              'Recent'
            ]
          : ['Recent']
    }),
    messageDetails: builder.query({
      query: params => ({ url: 'message/viewMessage', params: params }),
      providesTags: (result, error, params) => [
        { type: 'ViewMessage', id: params.id }
      ]
    }),

    sendPrivateMessage: builder.mutation({
      query: payload => ({
        url: 'message',
        method: 'post',
        data: payload
      }),

      invalidatesTags: (result, error, payload) => [
        { type: 'Recent' },
        { type: 'ViewMessage', id: payload.recipientId }
      ]
    }), 

    uploadImage: builder.mutation({
      query: file => ({
        url: 'user/profileImage',
        method: 'patch',
        data: file, 
        headers: {
          'Content-type': 'multipart/form-data'
        },
      })
    }),
    viewProfile:builder.query({
      query:params => ({url:'user/profile',method: 'get',params:params}),
      providesTags: ['user/profile'],
      headers :{
        Authorization:"SLING "+store.getState().auth.accessToken,
      },
    }),
   viewGroup:builder.query({
    query:params =>({url:'group', method: 'get',params:params}),
    providesTags:['Groups']
   }),
   groupMessage:builder.query({
    query:params =>({url:'group/:groupId/message',method: 'get',params:params}),
    providesTags: (result, error, params) => [
      { type: 'ViewMessage', id: params.id }
    ]
   })
  })
})  

export const {
  useUsersQuery,
  useMessageDetailsQuery,
  useSendPrivateMessageMutation,
  useRecentMessageQuery,
  useUploadImageMutation,
  useViewProfileQuery,
  useViewGroupQuery,
  useGroupMessageQuery,
  

} = userApi
