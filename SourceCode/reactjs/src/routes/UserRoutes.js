import React from 'react'
import { AuthProtected } from './AuthProtected'

import { Navigate } from 'react-router-dom'
import ChangePassword from '../components/layout/changePassword'
const Chat = React.lazy(() => import('../components/chat/chat'))
const Group = React.lazy(() => import('../components/group/group'))
const Settings = React.lazy(() => import('../components/settings/settings'))
const ProFile = React.lazy(() => import('../components/layout/proFile'))


export const UserRoutes = [
  {
    path: '/',
    element: <AuthProtected />,
    children: [
      {
        index: true,
        path: '',
        element: <Navigate to='/chat' replace />
      },
      {
        path: 'chat',
        element: <Chat />
      },
      {
        path: 'group',
        element: <Group />
      },
      {
        path: 'settings',
        element: <Settings />
      },
      {
        path: 'changePassword',
        element: <ChangePassword />
      },
      {
        path: 'proFile',
        element: <ProFile />
      },
     
    ]
  }
]
