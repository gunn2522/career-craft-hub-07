import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Instagram, Youtube } from "lucide-react";
import logo from "@/assets/logo.png";

export const Footer = () => {
  return (
    <footer className="bg-[#12122B] border-t border-secondary/10">
      <div className="w-full px-4 md:px-8 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <img src={logo} alt="Career Craft Cafe" className="h-14 w-auto" />
            </Link>
            <p className="text-secondary/80 leading-relaxed">
              Empowering students to craft their careers, build skills, and connect with opportunities that matter.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Linkedin, href: "https://www.linkedin.com/company/careercraftcafe/" },
                { Icon: Instagram, href: "https://www.instagram.com/career_craft_cafe/" },
                { Icon: Youtube, href: "https://www.youtube.com/@Careercraftcafe" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary hover:bg-secondary hover:text-primary transition-all duration-300"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6 text-secondary">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: "Explore Careers", path: "/careers" },
                { name: "Skill Roadmaps", path: "/craft" },
                { name: "Events & Cafe", path: "/cafe" },
                { name: "C-Cells Program", path: "/ambassador" },
                { name: "About Us", path: "/about" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-secondary/70 hover:text-secondary transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6 text-secondary">Resources</h4>
            <ul className="space-y-3">
              {[
                { name: "Blog", path: "/blogs" },
                { name: "Success Stories", path: "/about" },
                { name: "FAQs", path: "/faqs" },
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms of Service", path: "/terms" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-secondary/70 hover:text-secondary transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6 text-secondary">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-highlight mt-0.5" />
                <a href="mailto:careercraftcafe0@gmail.com" className="text-secondary/80 hover:text-secondary transition-colors">careercraftcafe0@gmail.com</a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-highlight mt-0.5" />
                <a href="tel:+919988066050" className="text-secondary/80 hover:text-secondary transition-colors">+91 99880 66050</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-highlight mt-0.5" />
                <span className="text-secondary/80">
                  Ludhiana, Punjab
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-secondary/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-secondary/70 text-sm">
              © {new Date().getFullYear()} Career Craft Cafe. All rights reserved.
            </p>
            <p className="text-secondary/70 text-sm">
              Made with <span className="text-highlight">🔥</span> for students who dare to dream
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};