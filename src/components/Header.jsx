import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import Sidebar from "./Sidebar";
import SvgIcon from "./SvgIcon";
import "../styles/components/Header.css";

function Header({ currentPage, onNavigate }) {
  const userMenuRef = useRef(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(
    () => navigator.onLine ? "hidden" : "offline",
  );
  const [indicatorMotion, setIndicatorMotion] = useState(
    () => navigator.onLine ? "" : "entering",
  );
  const connectionStatusRef = useRef(connectionStatus);
  const reconnectTimerRef = useRef(null);
  const [textLogoUrl, setTextLogoUrl] = useState("/images/MICA-TextLogo.png");

  useEffect(() => {
    const updateStatus = (status, motion) => {
      connectionStatusRef.current = status;
      setConnectionStatus(status);
      setIndicatorMotion(motion);
    };

    const handleOnline = () => {
      window.clearTimeout(reconnectTimerRef.current);
      updateStatus("online", "visible");
      reconnectTimerRef.current = window.setTimeout(() => {
        if (navigator.onLine && connectionStatusRef.current === "online") {
          updateStatus("exiting", "exiting");
        }
      }, 2000);
    };
    const handleOffline = () => {
      window.clearTimeout(reconnectTimerRef.current);
      const wasVisible = connectionStatusRef.current !== "hidden";
      updateStatus("offline", wasVisible ? "visible" : "entering");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.clearTimeout(reconnectTimerRef.current);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const objectUrls = new Set();

    const refreshTextLogo = async () => {
      if (!navigator.onLine) return;

      try {
        const response = await fetch("/images/MICA-TextLogo.png", {
          cache: "no-cache",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Text logo request failed (${response.status})`);
        }
        const objectUrl = URL.createObjectURL(await response.blob());
        objectUrls.add(objectUrl);
        setTextLogoUrl(objectUrl);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Failed to refresh text logo after reconnecting", error);
      }
    };

    window.addEventListener("online", refreshTextLogo);
    return () => {
      controller.abort();
      window.removeEventListener("online", refreshTextLogo);
      objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
    };
  }, []);

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
        currentPage={currentPage}
        isMobileMenuOpen={isMobileMenuOpen}
        onNavigate={onNavigate}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <header className="header">
        <button
          type="button"
          className="header-brand"
          data-page="home"
          aria-label="MICA - Trang chủ"
          onClick={(event) => {
            onNavigate(event);
            setIsMobileMenuOpen(false);
          }}
        >
          <Logo w={40} h={40} bg className="header-favicon" />
          <img
            className="header-text-logo"
            src={textLogoUrl}
            alt="MICA"
          />
        </button>
        <div className="header-controls">
          {connectionStatus !== "hidden" && (
            <span
              className={`offline-indicator offline-indicator-${connectionStatus} offline-indicator-motion-${indicatorMotion}`}
              role="status"
              aria-label={connectionStatus === "offline" ? "Đang ngoại tuyến" : "Đã kết nối mạng"}
              title={connectionStatus === "offline" ? "Đang ngoại tuyến" : "Đã kết nối mạng"}
              onAnimationEnd={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.animationName === "offline-indicator-enter") {
                  setIndicatorMotion("visible");
                } else if (
                  event.animationName === "offline-indicator-exit" &&
                  connectionStatusRef.current === "exiting"
                ) {
                  connectionStatusRef.current = "hidden";
                  setConnectionStatus("hidden");
                  setIndicatorMotion("");
                }
              }}
            >
              <span className="offline-indicator-icon" aria-hidden="true">
                <SvgIcon name="offline" size={22} />
              </span>
              <span className="offline-indicator-icon" aria-hidden="true">
                <SvgIcon name="online" size={22} />
              </span>
            </span>
          )}
          <div className="header-user" ref={userMenuRef}>
            <button
              className="user-icon"
              type="button"
              aria-label="Tài khoản"
              aria-expanded={isUserMenuOpen}
              aria-controls="user-menu"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <SvgIcon name="user" size={26} />
            </button>
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