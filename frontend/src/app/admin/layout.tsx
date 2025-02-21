import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SidebarProvider } from "../components/ui/sidebar";
import { AdminDashboard } from "../components/admin-dashboard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Next.js Admin Dashboard",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider>
          <AdminDashboard>{children}</AdminDashboard>
        </SidebarProvider>
      </body>
    </html>
  );
}
