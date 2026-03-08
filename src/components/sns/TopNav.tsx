import { Link, useLocation } from "react-router-dom";
import { Bot, Network, Database, Home } from "lucide-react";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/network", label: "Network", icon: Network },
  { path: "/pipeline", label: "Pipeline", icon: Database },
];

const TopNav = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          <span className="font-heading font-bold text-lg text-foreground">
            RoboHire
          </span>
          <span className="text-xs font-mono bg-primary/15 text-primary px-2 py-0.5 rounded-full ml-1">
            SNS
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive =
              path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
