import packageInfo from "../../package.json";
import "../styles/components/Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-details">
        <p>
          © {new Date().getFullYear()} {packageInfo.displayName ?? packageInfo.name}
          {" · "}{packageInfo.description}{" · "}v{packageInfo.version}
        </p>
        <p className="footer-author">Phát triển bởi {packageInfo.author.name}</p>
      </div>
    </footer>
  );
}

export default Footer;
