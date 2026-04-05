import './globals.css'

export const metadata = {
  title: 'EVIT Sales Dashboard',
  description: 'AI-Powered Sales Analytics \u2014 EVIT Organization',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
