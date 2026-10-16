import { useEffect, useRef, useState } from "react";
import logoSvg from "../assets/MICA-Logo.svg?raw";
import "../styles/components/Logo.css";

const svgContent = logoSvg.slice(logoSvg.indexOf(">") + 1, logoSvg.lastIndexOf("</svg>"));

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
  const svgRef = useRef(null);
  const classes = {
    root: `mica-logo-root-${suffix}`,
    animated: `mica-logo-hover-${suffix}`,
    animation: "mica-logo-animated",
    playing: `mica-logo-playing-${suffix}`,
    playingBase: "mica-logo-playing",
    noBackground: `mica-logo-no-bg-${suffix}`,
    noBackgroundBase: "mica-logo-no-bg",
  };
  const content = svgContent.replace(/class="([^"]+)"/g, (_match, names) => {
    const namesWithSuffix = names.split(/\s+/).map((name) => `${name} ${name}-${suffix}`);
    return `class="${namesWithSuffix.join(" ")}"`;
  });

  useEffect(() => {
    if (animation) {
      const svg = svgRef.current;
      svg.querySelectorAll(".mica-logo-outer-outline, .mica-logo-inner-outline").forEach((outline) => {
        outline.style.setProperty("--mica-logo-path-length", `${outline.getTotalLength()}px`);
        outline.style.strokeDasharray = "var(--mica-logo-path-length)";
      });
    }
  }, [animation, classes.root]);

  const playAnimation = () => {
    if (!animation || isPlaying || (hasPlayed && !hasLeftSincePlay)) return;

    const svg = svgRef.current;
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

    const svg = svgRef.current;
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={w}
      height={h}
      ref={svgRef}
      className={rootClasses}
      aria-hidden="true"
      focusable="false"
      onPointerEnter={animation ? handlePointerEnter : undefined}
      onPointerLeave={animation ? handlePointerLeave : undefined}
      // onClick={animation ? playAnimation : undefined}
      onAnimationEnd={animation ? handleAnimationEnd : undefined}
      style={{ display: "block", flex: "0 0 auto" }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export default Logo;
