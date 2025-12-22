import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Handshake, LogOut, LayoutDashboard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Careers", path: "/careers" },
  { name: "Craft", path: "/craft" },
  { name: "Cafe", path: "/cafe" },
  { name: "Success Stories", path: "/success-stories" },
  { name: "C-Cells", path: "/ambassador" },
  { name: "Blogs", path: "/blogs" },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="w-full px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={logo} 
              alt="Career Craft Cafe" 
              className="h-16 w-auto transition-transform duration-300 group-hover:scale-110"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative font-medium transition-colors duration-300 hover:text-primary ${
                  location.pathname === link.path ? "text-primary" : "text-foreground/80"
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10" asChild>
              <Link to="/partner" className="flex items-center gap-2">
                <Handshake className="w-4 h-4" />
                Become a Partner
              </Link>
            </Button>
            {user ? (
              <>
                {isAdmin && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin" className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Admin
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Log In</Link>
                </Button>
                <Button variant="gradient" size="sm" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {isOpen && (
          <nav className="lg:hidden py-6 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`py-2 font-medium transition-colors duration-300 ${
                    location.pathname === link.path ? "text-primary" : "text-foreground/80"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
                <Button variant="outline" className="border-primary/50 text-primary" asChild>
                  <Link to="/partner" onClick={() => setIsOpen(false)} className="flex items-center gap-2 justify-center">
                    <Handshake className="w-4 h-4" />
                    Become a Partner
                  </Link>
                </Button>
                {user ? (
                  <>
                    {isAdmin && (
                      <Button variant="outline" asChild>
                        <Link to="/admin" onClick={() => setIsOpen(false)}>Admin Dashboard</Link>
                      </Button>
                    )}
                    <Button variant="gradient" onClick={handleSignOut}>Sign Out</Button>
                  </>
                ) : (
                  <Button variant="gradient" asChild>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>Get Started</Link>
                  </Button>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
