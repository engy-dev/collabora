
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { 
  BarChart2, 
  Home, 
  FileUp, 
  Database, 
  PieChart, 
  Users, 
  Settings, 
  FileText
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';

const AppSidebar = () => {
  const location = useLocation();
  const { user } = useUserStore();
  const isAdmin = user?.role === 'admin';

  const mainNavItems = [
    { title: 'Dashboard', url: '/dashboard', icon: Home },
    { title: 'Data Import', url: '/import', icon: FileUp },
    { title: 'Datasets', url: '/datasets', icon: Database },
    { title: 'Visualizations', url: '/visualizations', icon: BarChart2 },
    { title: 'Analysis', url: '/analysis', icon: PieChart },
    { title: 'Reports', url: '/reports', icon: FileText },
  ];

  const adminNavItems = [
    { title: 'User Management', url: '/admin/users', icon: Users },
    { title: 'Settings', url: '/admin/settings', icon: Settings },
    { title: 'Audit Log', url: '/admin/audit', icon: FileText }
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={cn(
                      location.pathname === item.url ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                    )}
                  >
                    <Link to={item.url} className="flex gap-2">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      className={cn(
                        location.pathname === item.url ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                      )}
                    >
                      <Link to={item.url} className="flex gap-2">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
