"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/app/actions/auth";
import {
  Search,
  LayoutDashboard,
  User,
  FolderOpen,
  Map,
  Wrench,
  Settings,
  ChevronDown,
  Briefcase,
  GraduationCap,
  Code2,
  Mail,
  Fingerprint,
  LogOut,
  ExternalLink,
  View,
  FileText,
  Trophy,
  PenTool,
  BarChart,
  Star,
  Image as ImageIcon,
  Phone
} from "lucide-react";

/** ======================= Local SVG paths (inline) ======================= */
const svgPaths = {
  p36880f80:
    "M0.32 0C0.20799 0 0.151984 0 0.109202 0.0217987C0.0715695 0.0409734 0.0409734 0.0715695 0.0217987 0.109202C0 0.151984 0 0.20799 0 0.32V6.68C0 6.79201 0 6.84801 0.0217987 6.8908C0.0409734 6.92843 0.0715695 6.95902 0.109202 6.9782C0.151984 7 0.207989 7 0.32 7L3.68 7C3.79201 7 3.84802 7 3.8908 6.9782C3.92843 6.95903 3.95903 6.92843 3.9782 6.8908C4 6.84801 4 6.79201 4 6.68V4.32C4 4.20799 4 4.15198 4.0218 4.1092C4.04097 4.07157 4.07157 4.04097 4.1092 4.0218C4.15198 4 4.20799 4 4.32 4L19.68 4C19.792 4 19.848 4 19.8908 4.0218C19.9284 4.04097 19.959 4.07157 19.9782 4.1092C20 4.15198 20 4.20799 20 4.32V6.68C20 6.79201 20 6.84802 20.0218 6.8908C20.041 6.92843 20.0716 6.95903 20.1092 6.9782C20.152 7 20.208 7 20.32 7L23.68 7C23.792 7 23.848 7 23.8908 6.9782C23.9284 6.95903 23.959 6.92843 23.9782 6.8908C24 6.84802 24 6.79201 24 6.68V0.32C24 0.20799 24 0.151984 23.9782 0.109202C23.959 0.0715695 23.9284 0.0409734 23.8908 0.0217987C23.848 0 23.792 0 23.68 0H0.32Z",
  p355df480:
    "M0.32 16C0.20799 16 0.151984 16 0.109202 15.9782C0.0715695 15.959 0.0409734 15.9284 0.0217987 15.8908C0 15.848 0 15.792 0 15.68V9.32C0 9.20799 0 9.15198 0.0217987 9.1092C0.0409734 9.07157 0.0715695 9.04097 0.109202 9.0218C0.151984 9 0.207989 9 0.32 9H3.68C3.79201 9 3.84802 9 3.8908 9.0218C3.92843 9.04097 3.95903 9.07157 3.9782 9.1092C4 9.15198 4 9.20799 4 9.32V11.68C4 11.792 4 11.848 4.0218 11.8908C4.04097 11.9284 4.07157 11.959 4.1092 11.9782C4.15198 12 4.20799 12 4.32 12L19.68 12C19.792 12 19.848 12 19.8908 11.9782C19.9284 11.959 19.959 11.9284 19.9782 11.8908C20 11.848 20 11.792 20 11.68V9.32C20 9.20799 20 9.15199 20.0218 9.1092C20.041 9.07157 20.0716 9.04098 20.1092 9.0218C20.152 9 20.208 9 20.32 9H23.68C23.792 9 23.848 9 23.8908 9.0218C23.9284 9.04098 23.959 9.07157 23.9782 9.1092C24 9.15199 24 9.20799 24 9.32V15.68C24 15.792 24 15.848 23.9782 15.8908C23.959 15.9284 23.9284 15.959 23.8908 15.9782C23.848 16 23.792 16 23.68 16H0.32Z",
  pfa0d600:
    "M6.32 10C6.20799 10 6.15198 10 6.1092 9.9782C6.07157 9.95903 6.04097 9.92843 6.0218 9.8908C6 9.84802 6 9.79201 6 9.68V6.32C6 6.20799 6 6.15198 6.0218 6.1092C6.04097 6.07157 6.07157 6.04097 6.1092 6.0218C6.15198 6 6.20799 6 6.32 6L17.68 6C17.792 6 17.848 6 17.8908 6.0218C17.9284 6.04097 17.959 6.07157 17.9782 6.1092C18 6.15198 18 6.20799 18 6.32V9.68C18 9.79201 18 9.84802 17.9782 9.8908C17.959 9.92843 17.9284 9.95903 17.8908 9.9782C17.848 10 17.792 10 17.68 10H6.32Z",
};
/** ======================================================================= */

// Softer spring animation curve
const softSpringEasing = "cubic-bezier(0.25, 1.1, 0.4, 1)";

/* ----------------------------- Brand / Logos ----------------------------- */

function BrandBadge() {
  return (
    <div className="relative shrink-0 w-full mb-4">
      <div className="flex items-center p-1 w-full">
        <div className="h-10 w-8 flex items-center justify-center pl-2">
          <Fingerprint className="size-6 text-ice-500" />
        </div>
        <div className="px-2 py-1">
          <div className="font-bold text-[18px] tracking-tight text-ice-50">
            Portfolio CMS
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Search Input ----------------------------- */

function SearchContainer({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div
      className={`relative shrink-0 transition-all duration-500 mb-4 ${
        isCollapsed ? "w-full flex justify-center" : "w-full"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      <div
        className={`bg-ink-1/50 border border-ink-3 h-10 relative rounded-xl flex items-center transition-all duration-500 ${
          isCollapsed ? "w-10 min-w-10 justify-center" : "w-full"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        <div
          className={`flex items-center justify-center shrink-0 transition-all duration-500 ${
            isCollapsed ? "p-1" : "px-2"
          }`}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <div className="size-8 flex items-center justify-center">
            <Search size={16} className="text-ice-400" />
          </div>
        </div>

        <div
          className={`flex-1 relative transition-opacity duration-500 overflow-hidden ${
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          }`}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <div className="flex flex-col justify-center size-full">
            <div className="flex flex-col gap-2 items-start justify-center pr-2 py-1 w-full">
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-[14px] text-ice-100 placeholder:text-ice-400"
                tabIndex={isCollapsed ? -1 : 0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Types / Content Map -------------------------- */

interface MenuItemT {
  icon?: React.ReactNode;
  label: string;
  href?: string;
  badge?: string;
  hasDropdown?: boolean;
  children?: MenuItemT[];
}
interface MenuSectionT {
  title: string;
  items: MenuItemT[];
}
interface SidebarContent {
  title: string;
  sections: MenuSectionT[];
}

function getSidebarContent(activeSection: string): SidebarContent {
  const contentMap: Record<string, SidebarContent> = {
    overview: {
      title: "Dashboard",
      sections: [
        {
          title: "Main Views",
          items: [
            { icon: <View size={16} />, label: "Overview", href: "/admin" },
          ],
        },
      ],
    },
    profile: {
      title: "Profile setup",
      sections: [
        {
          title: "Identity",
          items: [
            { icon: <User size={16} />, label: "01. Introduction", href: "/admin/introduction" },
            { icon: <BarChart size={16} />, label: "08. Metrics", href: "/admin/metrics" },
            { icon: <Phone size={16} />, label: "12. Contact", href: "/admin/contact" },
          ],
        },
      ],
    },
    resume: {
      title: "Experience",
      sections: [
        {
          title: "Professional",
          items: [
            { icon: <Code2 size={16} />, label: "02. Technical Skills", href: "/admin/skills" },
            { icon: <Map size={16} />, label: "03. Engineering Journey", href: "/admin/journey" },
            { icon: <Trophy size={16} />, label: "04. Recognition", href: "/admin/recognition" },
          ],
        },
      ],
    },
    portfolio: {
      title: "Portfolio",
      sections: [
        {
          title: "Showcases",
          items: [
            { icon: <FolderOpen size={16} />, label: "05. Featured Projects", href: "/admin/projects" },
            { icon: <Briefcase size={16} />, label: "06. Other Projects", href: "/admin/other-projects" },
            { icon: <ImageIcon size={16} />, label: "11. Personal Gallery", href: "/admin/gallery" },
          ],
        },
      ],
    },
    content: {
      title: "Content",
      sections: [
        {
          title: "Publishing",
          items: [
            { icon: <FileText size={16} />, label: "07. Blog / Articles", href: "/admin/blog" },
            { icon: <Star size={16} />, label: "09. Testimonials", href: "/admin/testimonials" },
            { icon: <PenTool size={16} />, label: "10. Services", href: "/admin/services" },
          ],
        },
      ],
    },
    system: {
      title: "System",
      sections: [
        {
          title: "Settings",
          items: [
            { icon: <Settings size={16} />, label: "Global Settings", href: "/admin/settings" },
          ],
        },
      ],
    },
  };

  return contentMap[activeSection] || contentMap.overview;
}

/* ---------------------------- Left Icon Nav Rail -------------------------- */

function IconNavButton({
  children,
  isActive = false,
  onClick,
  title,
}: {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      className={`flex items-center justify-center rounded-xl size-12 min-w-12 transition-all duration-300
        ${isActive ? "bg-ice-500/20 text-ice-100 shadow-sm border border-ice-500/30" : "text-ice-400 hover:bg-ink-2 hover:text-ice-100 border border-transparent"}`}
      style={{ transitionTimingFunction: softSpringEasing }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function IconNavigation({
  activeSection,
  onSectionChange,
}: {
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  const router = useRouter();
  
  const navItems = [
    { id: "overview", icon: <LayoutDashboard size={20} />, label: "Overview" },
    { id: "profile", icon: <User size={20} />, label: "Profile" },
    { id: "resume", icon: <FileText size={20} />, label: "Resume" },
    { id: "portfolio", icon: <FolderOpen size={20} />, label: "Portfolio" },
    { id: "content", icon: <Star size={20} />, label: "Content" },
  ];

  return (
    <aside className="bg-ink-1/80 backdrop-blur-md flex flex-col gap-2 items-center py-4 w-20 h-screen border-r border-ink-3 z-20">
      {/* Logo */}
      <div className="mb-6 size-12 flex items-center justify-center bg-ice-500 rounded-xl shadow-lg shadow-ice-500/20">
        <Fingerprint className="size-6 text-ink-0" />
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col gap-3 w-full items-center">
        {navItems.map((item) => (
          <IconNavButton
            key={item.id}
            title={item.label}
            isActive={activeSection === item.id}
            onClick={() => onSectionChange(item.id)}
          >
            {item.icon}
          </IconNavButton>
        ))}
      </div>

      <div className="flex-1" />

      {/* Bottom section */}
      <div className="flex flex-col gap-3 w-full items-center mb-2">
        <IconNavButton 
          title="View Live Site"
          onClick={() => router.push("/")}
        >
          <ExternalLink size={20} />
        </IconNavButton>
        <IconNavButton 
          title="System"
          isActive={activeSection === "system"} 
          onClick={() => onSectionChange("system")}
        >
          <Settings size={20} />
        </IconNavButton>
        
        <form action={logout} className="w-full flex justify-center">
          <IconNavButton title="Log out">
            <LogOut size={20} className="text-red-400" />
          </IconNavButton>
        </form>
      </div>
    </aside>
  );
}

/* ------------------------------ Right Sidebar ----------------------------- */

function SectionTitle({
  title,
  onToggleCollapse,
  isCollapsed,
}: {
  title: string;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
}) {
  if (isCollapsed) {
    return (
      <div className="w-full flex justify-center transition-all duration-500 mb-4" style={{ transitionTimingFunction: softSpringEasing }}>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex items-center justify-center rounded-xl size-10 min-w-10 transition-all duration-500 hover:bg-ink-2 text-ice-400 hover:text-ice-100"
          style={{ transitionTimingFunction: softSpringEasing }}
          aria-label="Expand sidebar"
        >
          <span className="inline-block rotate-180">
            <ChevronDown size={18} />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden transition-all duration-500 mb-4" style={{ transitionTimingFunction: softSpringEasing }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center h-10">
          <div className="px-2 py-1">
            <div className="font-bold text-[20px] text-ice-100 tracking-tight">
              {title}
            </div>
          </div>
        </div>
        <div className="pr-1">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex items-center justify-center rounded-xl size-10 min-w-10 transition-all duration-500 hover:bg-ink-2 text-ice-400 hover:text-ice-100"
            style={{ transitionTimingFunction: softSpringEasing }}
            aria-label="Collapse sidebar"
          >
            <ChevronDown size={18} className="-rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailSidebar({ activeSection }: { activeSection: string }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const content = getSidebarContent(activeSection);
  const router = useRouter();
  const pathname = usePathname() || "";

  const toggleCollapse = () => setIsCollapsed((s) => !s);
  
  const toggleExpanded = (itemKey: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) next.delete(itemKey);
      else next.add(itemKey);
      return next;
    });
  };

  return (
    <aside
      className={`bg-ink-0/60 backdrop-blur-md flex flex-col items-start p-4 border-r border-ink-3 transition-all duration-500 h-screen overflow-hidden ${
        isCollapsed ? "w-20 min-w-[80px] !px-2 justify-start items-center" : "w-72"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      {!isCollapsed && <BrandBadge />}

      <SectionTitle title={content.title} onToggleCollapse={toggleCollapse} isCollapsed={isCollapsed} />
      <SearchContainer isCollapsed={isCollapsed} />

      <div
        className={`flex flex-col w-full overflow-y-auto flex-1 transition-all duration-500 no-scrollbar ${
          isCollapsed ? "gap-2 items-center" : "gap-6 items-start"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        {content.sections.map((section, index) => (
          <MenuSection
            key={`${activeSection}-${index}`}
            section={section}
            expandedItems={expandedItems}
            onToggleExpanded={toggleExpanded}
            isCollapsed={isCollapsed}
            currentPath={pathname}
            onNavigate={(href) => router.push(href)}
          />
        ))}
      </div>
    </aside>
  );
}

/* ------------------------------ Menu Elements ---------------------------- */

function MenuItem({
  item,
  isExpanded,
  onToggle,
  onItemClick,
  isCollapsed,
  isActive,
}: {
  item: MenuItemT;
  isExpanded?: boolean;
  onToggle?: () => void;
  onItemClick?: () => void;
  isCollapsed?: boolean;
  isActive?: boolean;
}) {
  const handleClick = () => {
    if (item.hasDropdown && onToggle) onToggle();
    else onItemClick?.();
  };

  return (
    <div
      className={`relative shrink-0 transition-all duration-500 mb-1 ${
        isCollapsed ? "w-full flex justify-center" : "w-full"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      <div
        className={`rounded-xl cursor-pointer transition-all duration-300 flex items-center relative ${
          isActive && !item.hasDropdown
            ? "bg-ice-500/20 text-ice-100 shadow-md shadow-ice-500/10 border border-ice-500/30" 
            : "text-ice-400 hover:bg-ink-2 hover:text-ice-100 border border-transparent"
        } ${isCollapsed ? "w-12 min-w-[48px] h-12 justify-center p-2" : "w-full h-11 px-3"}`}
        style={{ transitionTimingFunction: softSpringEasing }}
        onClick={handleClick}
        title={isCollapsed ? item.label : undefined}
      >
        <div className="flex items-center justify-center shrink-0">
          {item.icon}
        </div>

        <div
          className={`flex-1 relative transition-opacity duration-500 overflow-hidden ${
            isCollapsed ? "opacity-0 w-0" : "opacity-100 ml-3"
          }`}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <div className="text-[14px] font-medium leading-[20px] truncate">
            {item.label}
          </div>
        </div>

        {item.badge && !isCollapsed && (
          <div className={`ml-2 shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-ice-500 text-ink-0 shadow-sm'}`}>
            {item.badge}
          </div>
        )}

        {item.hasDropdown && (
          <div
            className={`flex items-center justify-center shrink-0 transition-opacity duration-500 ${
              isCollapsed ? "opacity-0 w-0" : "opacity-100 ml-2"
            }`}
            style={{ transitionTimingFunction: softSpringEasing }}
          >
            <ChevronDown
              size={16}
              className="text-ice-400 transition-transform duration-500"
              style={{
                transitionTimingFunction: softSpringEasing,
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SubMenuItem({ item, onItemClick }: { item: MenuItemT; onItemClick?: () => void }) {
  return (
    <div className="w-full pl-8 pr-1 py-[1px]">
      <div
        className="h-10 w-full rounded-lg cursor-pointer transition-colors hover:bg-ink-2 flex items-center px-3 py-1"
        onClick={onItemClick}
      >
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-ice-400 hover:text-ice-100 leading-[18px] truncate">
            {item.label}
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuSection({
  section,
  expandedItems,
  onToggleExpanded,
  isCollapsed,
  currentPath,
  onNavigate,
}: {
  section: MenuSectionT;
  expandedItems: Set<string>;
  onToggleExpanded: (itemKey: string) => void;
  isCollapsed?: boolean;
  currentPath: string;
  onNavigate: (href: string) => void;
}) {
  return (
    <div className="flex flex-col w-full">
      <div
        className={`relative shrink-0 w-full transition-all duration-500 overflow-hidden ${
          isCollapsed ? "h-0 opacity-0 mb-0" : "h-8 opacity-100 mb-1"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        <div className="flex items-center h-8 px-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ice-400">
            {section.title}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-0.5 w-full">
        {section.items.map((item, index) => {
          const itemKey = `${section.title}-${index}`;
          const isActive = item.href ? currentPath === item.href : false;
          const isExpanded = expandedItems.has(itemKey);
          
          return (
            <div key={itemKey} className="w-full flex flex-col">
              <MenuItem
                item={item}
                isActive={isActive}
                isExpanded={isExpanded}
                onToggle={() => onToggleExpanded(itemKey)}
                onItemClick={() => {
                  if (item.href) onNavigate(item.href);
                }}
                isCollapsed={isCollapsed}
              />
              {isExpanded && item.children && !isCollapsed && (
             <div className="flex flex-col gap-1 mb-2">
                  {item.children.map((child, childIndex) => (
                    <SubMenuItem
                      key={`${itemKey}-${childIndex}`}
                      item={child}
                      onItemClick={() => {
                        if (child.href) onNavigate(child.href);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------------- Layout -------------------------------- */

export default function AdminSidebar() {
  const pathname = usePathname() || "";
  
  const getInitialSection = () => {
    if (pathname.includes('/admin/introduction') || pathname.includes('/admin/metrics') || pathname.includes('/admin/contact')) return 'profile';
    if (pathname.includes('/admin/skills') || pathname.includes('/admin/journey') || pathname.includes('/admin/recognition')) return 'resume';
    if (pathname.includes('/admin/projects') || pathname.includes('/admin/other-projects') || pathname.includes('/admin/gallery')) return 'portfolio';
    if (pathname.includes('/admin/blog') || pathname.includes('/admin/testimonials') || pathname.includes('/admin/services')) return 'content';
    if (pathname.includes('/admin/settings')) return 'system';
    return 'overview';
  };

  const [activeSection, setActiveSection] = useState(getInitialSection());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Keep sidebar section in sync with URL changes when navigating via links
  useEffect(() => {
    setActiveSection(getInitialSection());
  }, [pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-ink-0/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className={`h-screen shrink-0 z-50 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'fixed md:static inset-y-0 left-0 flex' : 'hidden md:flex'}`}>
        <IconNavigation activeSection={activeSection} onSectionChange={setActiveSection} />
        <DetailSidebar activeSection={activeSection} />
      </div>
    </>
  );
}
