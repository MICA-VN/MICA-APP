import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/header.css";

function Header({ route, navigationDirection }) {
  const navigate = useNavigate();
  const title = route?.title || "Hóa Học Tương Tác";
  const parent = route?.parent;
  const currentTitleRef = useRef(title);
  const [displayTitle, setDisplayTitle] = useState(title);
  const [previousTitle, setPreviousTitle] = useState(title);
  const [direction, setDirection] = useState("up");
  const [animationKey, setAnimationKey] = useState(0);
  const [isHoveringBrand, setIsHoveringBrand] = useState(false);

  useEffect(() => {
    if (title === currentTitleRef.current) return;

    setPreviousTitle(currentTitleRef.current);
    setDisplayTitle(title);
    setDirection(navigationDirection);
    setAnimationKey(key => key + 1);
    currentTitleRef.current = title;
  }, [title, navigationDirection]);

  const handleBrandEnter = () => {
    if (isHoveringBrand || title === "Hóa Học Tương Tác") return;

    setPreviousTitle(displayTitle);
    setDisplayTitle("Hóa Học Tương Tác");
    setDirection("down");
    setAnimationKey(key => key + 1);
    setIsHoveringBrand(true);
  };

  const handleBrandLeave = () => {
    if (!isHoveringBrand || title === "Hóa Học Tương Tác") {
      setIsHoveringBrand(false);
      return;
    }

    setPreviousTitle("Hóa Học Tương Tác");
    setDisplayTitle(title);
    setDirection(navigationDirection || "up");
    setAnimationKey(key => key + 1);
    setIsHoveringBrand(false);
  };

  const handleBack = () => {
    navigate(parent, {
      state: {
        navigationDirection: "down"
      }
    });
  };

  return (
    <>
      <header className="header">
        <div
          className="header-brand"
          onMouseEnter={handleBrandEnter}
          onMouseLeave={handleBrandLeave}
        >
          <img
            src="/images/MICA-Logo.png"
            alt="MICA"
            className="header-logo"
          />
          <div className="header-title-wrap">
            {displayTitle !== previousTitle ? (
              <div
                key={animationKey}
                className={`header-title-scroll ${direction}`}
              >
                <span className="header-title header-title-old">
                  {previousTitle}
                </span>
                <span className="header-title header-title-new">
                  {displayTitle}
                </span>
              </div>
            ) : (
              <span className="header-title">{displayTitle}</span>
            )}
          </div>
        </div>
        <div className="header-user">
          <img
            src="/images/user.svg"
            alt="Tài khoản"
            className="user-icon"
          />
          <span>Khách</span>
        </div>
      </header>
      {parent && (
        <button className="header-back" onClick={handleBack}>
          ← Quay lại
        </button>
      )}
    </>
  );
}

export default Header;