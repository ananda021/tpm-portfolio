export const metadata = {
  title: 'TPM Portfolio',
  description: 'AI tools built for TPM workflows',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#fff' }}>
        {children}
      </body>
    </html>
  )
}