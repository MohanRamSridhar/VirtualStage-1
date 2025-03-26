import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Home, Ticket, UserCircle, Settings, LogOut, VolumeX, Volume2 } from "lucide-react";
import { useAuth } from "@/lib/stores/useAuth";
import { useAudio } from "@/lib/stores/useAudio";

export default function Navigation() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { isMuted, toggleMute, backgroundMusic } = useAudio();
  const [isOpen, setIsOpen] = useState(false);

  // Play background music on user interaction
  const handlePlayMusic = () => {
    if (backgroundMusic && isMuted) {
      toggleMute();
      backgroundMusic.play().catch(error => {
        console.error("Error playing background music:", error);
      });
    } else if (backgroundMusic && !isMuted) {
      toggleMute();
      backgroundMusic.pause();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-4 py-4">
                <Link 
                  to="/" 
                  className="flex items-center gap-2 text-lg font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-primary">VREvents</span>
                </Link>
                <nav className="flex flex-col gap-2">
                  <Link 
                    to="/" 
                    className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                      location.pathname === "/" ? "bg-secondary" : "hover:bg-secondary/50"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                  <Link 
                    to="/events" 
                    className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                      location.pathname.startsWith("/events") ? "bg-secondary" : "hover:bg-secondary/50"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Ticket className="h-4 w-4" />
                    Events
                  </Link>
                  {isAuthenticated && (
                    <Link 
                      to="/profile" 
                      className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                        location.pathname === "/profile" ? "bg-secondary" : "hover:bg-secondary/50"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <UserCircle className="h-4 w-4" />
                      Profile
                    </Link>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold hidden md:inline-block">VREvents</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-6">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm ${
                location.pathname === "/"
                  ? "bg-secondary"
                  : "hover:bg-secondary/50"
              }`}
            >
              Home
            </Link>
            <Link
              to="/events"
              className={`px-3 py-2 rounded-md text-sm ${
                location.pathname.startsWith("/events")
                  ? "bg-secondary"
                  : "hover:bg-secondary/50"
              }`}
            >
              Events
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio control */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handlePlayMusic}
            title={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>

          {/* User dropdown or login */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user.avatar || undefined} 
                      alt={user.displayName || user.username} 
                    />
                    <AvatarFallback>
                      {(user.displayName || user.username || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
