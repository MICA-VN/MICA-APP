import { useEffect, useRef, useState } from "react";
import homeIcon from "../../private/svg/home.svg";
import "../styles/header.css";

function Header() {
  const userMenuRef = useRef(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <aside className="app-sidebar" aria-label="Điều hướng chính">
        <a
          className="sidebar-brand"
          aria-label="MICA - Trang chủ"
          href="#home"
        >
          <img src="/images/MICA-Favicon.png" alt="" />
        </a>
        <nav className="sidebar-nav">
          <a
            className="sidebar-nav-item active"
            aria-label="Trang chủ"
            href="#home"
          >
            <img src={homeIcon} alt="" />
            <span className="sidebar-tooltip" role="tooltip">Trang chủ</span>
          </a>
        </nav>
      </aside>
      <header className="header">
        <a className="header-brand" href="#home" aria-label="MICA - Trang chủ">
          <img
            className="header-text-logo"
            src="/images/MICA-TextLogo.png"
            alt="MICA"
          />
        </a>
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
      </header>
    </>
  );
}

export default Header;