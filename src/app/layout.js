import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'SQLGuard — SQL Injection Detection',
  description: 'Detect and prevent SQL injection attacks with real-time analysis and risk scoring.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
