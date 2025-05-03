"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  HomeIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { name: "Home", href: "/home", icon: HomeIcon },
  {
    name: "Resume Optimizer",
    href: "/resume-optimizer",
    icon: DocumentTextIcon,
  },
  {
    name: "LinkedIn Optimizer",
    href: "/linkedin-optimizer",
    icon: BriefcaseIcon,
  },
  { name: "Cover Letter", href: "/cover-letter", icon: DocumentTextIcon },
  { name: "Interview Prep", href: "/interview-prep", icon: UserCircleIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = () => {
    auth.signOut();
    router.push("/");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    // Sidebar
    //collapsible updated sidebar
    <nav className={`fixed top-0 left-0 h-full ${collapsed ? "w-20" : "w-64"} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-10 flex flex-col`}>
      {/* Logo/Brand Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        {!collapsed && (<h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
          CVSwitch
        </h1>)}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          {collapsed ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
</svg>
 : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
 <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
</svg>

}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                />
                {/* if collapsed, don't show text */}
                {!collapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="pt-4 px-1 border-t border-gray-200 dark:border-gray-700 flex justify-start items-center">
        <div className="space-y-2 flex items-end flex-col w-full">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {mounted && theme === "dark" ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
            {!collapsed && <span>
              {mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>}
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            {/* if collapsed, don't show text */}
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
      <div className="pt-4 my-4 pl-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 px-3">
              <span>© {new Date().getFullYear()} CVSwitch</span>
              <span> | </span>
              <span>All rights reserved</span>
            </div>
          </div>
    </nav>
  );
}
