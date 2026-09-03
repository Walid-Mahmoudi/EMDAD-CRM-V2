import './globals.css';

export const metadata = {
  title: 'Moza CRM',
  description: 'Moza CRM - Sales Workspace',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
