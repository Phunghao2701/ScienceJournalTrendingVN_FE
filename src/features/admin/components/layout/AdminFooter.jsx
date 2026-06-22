export default function AdminFooter() {
  // Lấy năm hiện tại để hiển thị copyright động, tránh hard-code năm cố định
  const currentYear = new Date().getFullYear();

  return (
    <footer className="admin-footer">
      <span>&copy; {currentYear} ResearchPulse Admin. All rights reserved.</span>
      <div className="admin-footer__links">
        <a href="#privacy-policy">Privacy Policy</a>
        <a href="#terms-of-service">Terms of Service</a>
        <a href="#contact-support">Contact Support</a>
      </div>
    </footer>
  );
}