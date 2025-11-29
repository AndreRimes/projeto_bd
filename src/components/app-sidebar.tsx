"use client";

import { Calendar, CalendarCheck, Home, Pill, Syringe, User, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from "~/components/ui/sidebar";

const menuItems = [
  {
    title: "Página Principal",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Pacientes",
    url: "/dashboard/pacientes",
    icon: User,
  },
  {
    title: "Agendamentos",
    url: "/dashboard/agendamentos",
    icon: CalendarCheck,
  },
  {
    title: "Consultas",
    url: "/dashboard/consultas",
    icon:   Calendar,
  },
  {
    title: "Vacinas",
    url: "/dashboard/vacinas",
    icon: Syringe,
  },
  {
    title: "Medicamentos",
    url: "/dashboard/medicamentos",
    icon: Pill,
  },
  {
    title: "Profissionais",
    url: "/dashboard/profissionais",
    icon: UserRound,
  },

];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Home className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Sistema de Saúde</span>
            <span className="text-xs text-muted-foreground">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">v1.0.0</span>
          <SidebarTrigger />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
