import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  Package, 
  Settings, 
  Home,
  TrendingUp
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: TrendingUp,
  },
  {
    title: "Users",
    url: "/users", 
    icon: Users,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Products",
    url: "/products",
    icon: Package,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="sidebar-responsive">
      <SidebarHeader className="p-4 sm:p-6">
        <Link to="/" className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-sidebar-foreground mobile-hidden">
            DataDash
          </span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-2 sm:px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 sm:px-4 text-xs sm:text-sm">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link to={item.url}>
                    <SidebarMenuButton 
                      isActive={location.pathname === item.url}
                      className="text-sidebar-foreground hover:text-blue-600 hover:bg-sidebar-accent data-[active=true]:bg-blue-50 dark:data-[active=true]:bg-blue-900/20 data-[active=true]:text-blue-600 data-[active=true]:border-l-2 data-[active=true]:border-blue-600 text-sm sm:text-base"
                    >
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="mobile-hidden">{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 sm:p-6">
        <div className="text-xs text-sidebar-foreground text-center mobile-hidden">
          © 2025 DataDash
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
