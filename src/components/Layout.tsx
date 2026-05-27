import { ReactNode } from "react";
import TopNavigation from "./TopNavigation";

interface LayoutProps {
  children: ReactNode;
  noPadding?: boolean;
}

const Layout = ({ children, noPadding }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavigation />
      <main className={noPadding ? "flex-1 flex flex-col" : "flex-1 p-4"}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
