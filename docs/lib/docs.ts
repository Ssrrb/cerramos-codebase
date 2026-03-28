export interface SidebarItem {
  description: string;
  href: string;
  title: string;
}

export interface SidebarGroup {
  items: SidebarItem[];
  label: string;
}
