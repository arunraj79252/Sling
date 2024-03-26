import { apliSlice } from "./apiSlice";



export const authApi = apliSlice.injectEndpoints({
    endpoints:builder =>({
        login:builder.mutation({
            query:(payload)=>({
                url:"login",
                method:"post",
                data:payload
            })
        }),
        register:builder.mutation({
            query:(payload)=>({
                url:"user",
                method:"post",
                data:payload
            })
        }),
        googleLogin:builder.mutation({
            query:(payload)=>({
                url:"sessions/oauth/google",
                method:"post",
                data:payload
            })
        })
    })
})


export const {useLoginMutation , useGoogleLoginMutation ,useRegisterMutation } = authApi