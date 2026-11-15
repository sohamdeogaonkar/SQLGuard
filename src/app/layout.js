import './globals.css';

export const metadata = {
  title: 'SQLGuard — WAF & SQL Injection Inspection Console',
  description: 'Real-time HTTP traffic inspection, attack pattern classification, and SQL injection prevention system.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
