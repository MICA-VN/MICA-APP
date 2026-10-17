import Logo from "./Logo";
import SvgIcon from "./SvgIcon";
import "../styles/components/Sidebar.css";

function Sidebar({ isMobileMenuOpen, onClose }) {
  return (
    <>
      {isMobileMenuOpen && (
        <button
          className="sidebar-overlay"
          type="button"
          aria-label="Đóng thanh điều hướng"
          onClick={onClose}
        />
      )}
      <aside
        id="main-sidebar"
        className={`app-sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}
        aria-label="Điều hướng chính"
      >
        <a
          className="sidebar-brand"
          aria-label="MICA - Trang chủ"
          onClick={onClose}
        >
          <Logo w={64} h={64} animation className="sidebar-logo" />
        </a>
        <nav className="sidebar-nav">
          <a
            className="sidebar-nav-item active"
            aria-label="Trang chủ"
            href="#home"
            onClick={onClose}
          >
            <SvgIcon name="home" size={23} className="sidebar-home-icon" />
            <span className="sidebar-nav-label">Trang chủ</span>
            <span className="sidebar-tooltip" role="tooltip">Trang chủ</span>
          </a>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
