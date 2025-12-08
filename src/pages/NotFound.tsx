import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-8xl font-bold gradient-text mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-8">Oops! This page doesn't exist</p>
          <Button variant="gradient" asChild>
            <Link to="/">
              <Home className="w-5 h-5" />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
