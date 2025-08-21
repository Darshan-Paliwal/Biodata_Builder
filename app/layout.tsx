import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Biodata PDF Generator",
  description: "Generate biodata PDFs easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <footer
          style={{
            textAlign: "center",
            marginTop: "20px",
            padding: "10px",
            fontSize: "14px",
            color: "#666",
          }}
        >
          Created by Darshan Paliwal
          <br />
          <a
            href="https://darshanpaliwal.netlify.app"
            style={{ color: "#0070f3", textDecoration: "none" }}
          >
            darshanpaliwal.netlify.app
          </a>
        </footer>
      </body>
    </html>
  );
}