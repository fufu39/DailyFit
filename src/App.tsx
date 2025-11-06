import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import AppRouter from './router'

const App: React.FC = () => {
  return (
    <>
      <BrowserRouter>
        {/* ModalsProvider：管理全局模态框 */}
        <ModalsProvider>
          {/* Notifications：全局通知中心 */}
          <Notifications position="top-right" zIndex={9000} />
          <AppRouter />
        </ModalsProvider>
      </BrowserRouter>
    </>
  )
}

export default App
