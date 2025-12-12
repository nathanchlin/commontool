import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '工作工具平台',
  description: '整合工作开发工具，包括会议纪要整理等功能',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  )
}

