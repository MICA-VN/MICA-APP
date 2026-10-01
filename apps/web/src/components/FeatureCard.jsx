import { useNavigate } from "react-router-dom";
import "../styles/home.css";

function FeatureCard({ icon, title, tagline, button, url }) {
  const navigate = useNavigate();
  const isImage = typeof icon === "string" && /\.(svg|png|jpg|jpeg|webp)$/i.test(icon);

  const handleClick = () => {
    if (url) {
      navigate(`/${url.replace(/^\/+/, "")}`);
    }
  };

  return (
    <div className="feature-card-reveal">
      <div
        className="feature-card"
        onClick={handleClick}
        role={url ? "link" : undefined}
        tabIndex={url ? 0 : undefined}
        onKeyDown={event => {
          if (url && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            handleClick();
          }
        }}
      >
        <div className="feature-icon">
          {isImage ? <img src={icon} alt="" /> : <span>{icon}</span>}
        </div>
        <h2>{title}</h2>
        <p>{tagline}</p>
        <span className="feature-action">
          {button}
          <span className="feature-arrow">→</span>
        </span>
      </div>
    </div>
  );
}

export default FeatureCard;