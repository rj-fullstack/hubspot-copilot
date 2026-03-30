import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HubSpot CRM Copilot',
  description: 'HubSpot CRM Microsoft 365 Copilot Plugin API',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
