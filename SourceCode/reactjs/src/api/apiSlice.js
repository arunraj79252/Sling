import { createApi,  } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

const {REACT_APP_API_ENDPOINT} = process.env
export const apliSlice = createApi({
    reducerPath:'api',
    baseQuery:axiosBaseQuery({baseUrl:REACT_APP_API_ENDPOINT}),
    tagTypes:['Auth','Users','Recent'],
    endpoints:(builder) => ({})
})
