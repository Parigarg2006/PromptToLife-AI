import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PromptToLife | Conversational AI Assistant',
  description: 'Sleek, upgraded ChatGPT / Claude style AI Assistant.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
