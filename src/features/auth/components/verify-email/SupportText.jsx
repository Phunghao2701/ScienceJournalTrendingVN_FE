const SupportText = () => {
  return (
    <p
      className="text-center mt-4"
      style={{
        fontSize: '0.85rem',
        color: 'var(--text-muted, #6B6B6B)',
      }}
    >
      {'Cần hỗ trợ? '}
      <a
        href="mailto:support@researchpulse.io"
        style={{
          color: 'var(--primary)',
          textDecoration: 'none',
          fontWeight: 500,
        }}
      >
        Liên hệ chúng tôi
      </a>
    </p>
  );
};

export default SupportText;