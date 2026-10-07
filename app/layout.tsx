import './globals.css'
import { Toaster } from 'sonner'
export const metadata = { title: 'The Cut — Admin', description: 'Platform operations' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Root layout wraps every route, so this rule (written for pages/_document) doesn't apply here. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,600;0,6..96,700;1,6..96,400&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      {/* Browser extensions (e.g. ColorZilla's cz-shortcut-listen) inject attributes on <body> */}
      <body className="h-full" suppressHydrationWarning>
        <Toaster position="top-center" offset={72} toastOptions={{ style: { borderRadius: '14px' } }} />
        {children}
      </body>
    </html>
  )
}
