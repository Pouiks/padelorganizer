import './globals.css'
import { ToastContainer } from '../components/Toast.js'

export const metadata = {
  title: 'Padel Organizer',
  description: 'Simple organisation de créneaux padel',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 min-h-screen">
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}