import { useCallback, useRef, useState } from "react";
import SvgIcon from "./SvgIcon";
import "../styles/components/Logo.css";

function createClassSuffix() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  return Array.from(
    { length: 5 },
    () => letters[Math.floor(Math.random() * letters.length)],
  ).join("");
}

function Logo({ w = 24, h = 24, bg = false, animation = false, className }) {
  const [suffix] = useState(createClassSuffix);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [hasLeftSincePlay, setHasLeftSincePlay] = useState(false);
  const logoRef = useRef(null);
  const classes = {
    root: `mica-logo-root-${suffix}`,
    animated: `mica-logo-hover-${suffix}`,
    animation: "mica-logo-animated",
    playing: `mica-logo-playing-${suffix}`,
    playingBase: "mica-logo-playing",
    noBackground: `mica-logo-no-bg-${suffix}`,
    noBackgroundBase: "mica-logo-no-bg",
  };
  const handleSvgLoad = useCallback((svg) => {
    if (!animation) return;

    svg.querySelectorAll(".mica-logo-outer-outline, .mica-logo-inner-outline").forEach((outline) => {
      const pathLength = outline.getTotalLength();
      outline.style.setProperty("--mica-logo-path-length", `${pathLength}px`);
      outline.style.strokeDasharray = `${pathLength}px`;
      outline.style.strokeDashoffset = "0";
    });
  }, [animation]);

  const playAnimation = () => {
    if (!animation || isPlaying || (hasPlayed && !hasLeftSincePlay)) return;

    const svg = logoRef.current?.querySelector("svg");
    if (!svg) return;
    svg.querySelectorAll(".mica-logo-outer-outline, .mica-logo-inner-outline").forEach((outline) => {
      outline.style.strokeDashoffset = outline.style.getPropertyValue("--mica-logo-path-length");
    });
    svg.querySelector(".mica-logo-fill").style.opacity = "0";
    setHasPlayed(true);
    setHasLeftSincePlay(false);
    setIsPlaying(true);
  };

  const handlePointerEnter = () => {
    if (isPlaying) {
      setHasLeftSincePlay(false);
      return;
    }
    playAnimation();
  };

  const handlePointerLeave = () => {
    if (hasPlayed) setHasLeftSincePlay(true);
  };

  const handleAnimationEnd = (event) => {
    if (event.animationName !== "mica-logo-settle") return;

    const svg = logoRef.current?.querySelector("svg");
    if (!svg) return;
    svg.querySelectorAll(".mica-logo-outer-outline, .mica-logo-inner-outline").forEach((outline) => {
      outline.style.strokeDashoffset = "0";
    });
    svg.querySelector(".mica-logo-fill").style.opacity = "1";
    setIsPlaying(false);
  };

  const rootClasses = [
    "mica-logo",
    classes.root,
    animation ? `${classes.animated} ${classes.animation}` : "",
    isPlaying ? `${classes.playing} ${classes.playingBase}` : "",
    bg ? "" : `${classes.noBackground} ${classes.noBackgroundBase}`,
    className ?? "",
  ].filter(Boolean).join(" ");

  return (
    <span
      ref={logoRef}
      className={rootClasses}
      onPointerEnter={animation ? handlePointerEnter : undefined}
      onPointerLeave={animation ? handlePointerLeave : undefined}
      onClick={animation ? playAnimation : undefined}
      onAnimationEnd={animation ? handleAnimationEnd : undefined}
      style={{ display: "block", flex: "0 0 auto", width: w, height: h }}
    >
      <SvgIcon
        name="MICA-Logo"
        w={w}
        h={h}
        className={`mica-logo-asset-${suffix}`}
        onLoad={handleSvgLoad}
      />
    </span>
  );
}

export default Logo;
