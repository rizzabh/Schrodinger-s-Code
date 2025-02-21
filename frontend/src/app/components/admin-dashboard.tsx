"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "../components/ui/sidebar"
import { Bolt, BarChart2, ClipboardList, Users } from "lucide-react"
import { TriggerTab } from "./trigger-tab"
import { RealTimeTransactionTab } from "./real-time-transaction-tab"
import { RecentTransactionTab } from "./recent-transaction-tab"
import { RegisteredUsersTab } from "./registered-users-tab"

const tabs = [
  { name: "Trigger", icon: Bolt },
  { name: "Real Time Transaction", icon: BarChart2 },
  { name: "Recent Transaction", icon: ClipboardList },
  { name: "Registered Users", icon: Users },
]

export function AdminDashboard({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("Trigger")

  return (
    <div className="flex h-screen w-full bg-gray-100">
      <Sidebar className="w-64 bg-white shadow-md">
        <SidebarContent className="p-4">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Dashboard</h1>
          <SidebarMenu>
            {tabs.map((tab) => (
              <SidebarMenuItem key={tab.name} className="mb-2">
                <SidebarMenuButton
                  onClick={() => setActiveTab(tab.name)}
                  isActive={activeTab === tab.name}
                  className="w-full justify-start px-4 py-2 rounded-md transition-colors duration-200"
                >
                  <tab.icon className="mr-3 h-5 w-5" />
                  <span>{tab.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === "Trigger" && <TriggerTab />}
          {activeTab === "Real Time Transaction" && <RealTimeTransactionTab />}
          {activeTab === "Recent Transaction" && <RecentTransactionTab />}
          {activeTab === "Registered Users" && <RegisteredUsersTab />}
          {children}
        </div>
      </main>
    </div>
  )
}

