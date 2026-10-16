import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import Sidebar from "./Sidebar";
import "../styles/components/Header.css";

function Header() {
  const userMenuRef = useRef(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <header className="header">
        <a
          className="header-brand"
          href="#home"
          aria-label="MICA - Trang chủ"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <Logo w={40} h={40} bg className="header-favicon" />
          <img
            className="header-text-logo"
            src="/images/MICA-TextLogo.png"
            alt="MICA"
          />
        </a>
        <div className="header-controls">
          <div className="header-user" ref={userMenuRef}>
            <button
              className="user-icon"
              type="button"
              aria-label="Tài khoản"
              aria-expanded={isUserMenuOpen}
              aria-controls="user-menu"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            />
            <div className={`user-menu ${isUserMenuOpen ? "open" : ""}`} id="user-menu">
              <span className="user-name">Khách</span>
              <button className="user-menu-item" type="button">Đăng nhập</button>
              <button className="user-menu-item" type="button">Đăng ký</button>
            </div>
          </div>
          <button
            className="mobile-menu-button"
            type="button"
            aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="main-sidebar"
            onClick={() => {
              setIsUserMenuOpen(false);
              setIsMobileMenuOpen((isOpen) => !isOpen);
            }}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>
    </>
  );
}

export default Header;