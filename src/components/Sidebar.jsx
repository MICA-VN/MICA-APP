import Logo from "./Logo";
import SvgIcon from "./SvgIcon";
import "../styles/components/Sidebar.css";

function Sidebar({ currentPage, isMobileMenuOpen, onNavigate, onClose }) {
  const handleNavigation = (event) => {
    onNavigate(event);
    onClose();
  };

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
        <button
          type="button"
          className="sidebar-brand"
          data-page="home"
          aria-label="MICA - Trang chủ"
          onClick={handleNavigation}
        >
          <Logo w={64} h={64} animation className="sidebar-logo" />
        </button>
        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-nav-item ${currentPage === "home" ? "active" : ""}`}
            data-page="home"
            aria-label="Trang chủ"
            aria-current={currentPage === "home" ? "page" : undefined}
            onClick={handleNavigation}
          >
            <SvgIcon name="home" size={23} className="sidebar-home-icon" />
            <span className="sidebar-nav-label">Trang chủ</span>
            <span className="sidebar-tooltip" role="tooltip">Trang chủ</span>
          </button>
          <button
            type="button"
            className={`sidebar-nav-item ${currentPage === "periodic-table" ? "active" : ""}`}
            data-page="periodic-table"
            aria-label="Bảng tuần hoàn"
            aria-current={currentPage === "periodic-table" ? "page" : undefined}
            onClick={handleNavigation}
          >
            <SvgIcon name="periodic-table" size={23} className="sidebar-periodic-table-icon" />
            <span className="sidebar-nav-label">Bảng tuần hoàn</span>
            <span className="sidebar-tooltip" role="tooltip">Bảng tuần hoàn</span>
          </button>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
