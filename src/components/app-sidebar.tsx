"use client";

import { Calendar, CalendarCheck, Home, MapPin, Pill, Syringe, User, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [posto, setPosto] = useState<{ nome: string; endereco?: string } | null>(null);

  useEffect(() => {
    // Get posto info from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setPosto({
          nome: user.nome || "Posto de Saúde",
          endereco: user.endereco,
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

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
        {posto && (
          <div className="mt-3 rounded-lg bg-muted/50 p-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{posto.nome}</span>
                {posto.endereco && (
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {posto.endereco}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
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
