
/**
 * RoleBadge Component
 * Renders user role badges using the design system's color schemes.
 * 
 * @param {Object} props - Props
 * @param {string} props.role - User role
 */
export default function RoleBadge({ role }) {
  // Define styling map matching SCImago / mockup aesthetics
  const styles = {
    RESEARCHER: {
      backgroundColor: '#fff0e8',
      color: '#ff7a33',
      border: '1px solid rgba(255, 122, 51, 0.2)'
    },
    LECTURER: {
      backgroundColor: '#fff0f5',
      color: '#db2777',
      border: '1px solid rgba(219, 39, 119, 0.2)'
    },
    STUDENT: {
      backgroundColor: '#f1f5f9',
      color: '#475569',
      border: '1px solid rgba(71, 85, 105, 0.2)'
    },
    ADMINISTRATOR: {
      backgroundColor: '#ecfdf5',
      color: '#059669',
      border: '1px solid rgba(5, 150, 105, 0.2)'
    }
  };

  const labels = {
    RESEARCHER: 'Researcher',
    LECTURER: 'Lecturer',
    STUDENT: 'Student',
    ADMINISTRATOR: 'Administrator',
  };

  const currentStyle = styles[role] || styles.RESEARCHER;

  return (
    <span 
      className="badge rounded-3 px-2.5 py-1 fw-semibold text-xs" 
      style={{
        fontSize: '0.75rem',
        textTransform: 'capitalize',
        ...currentStyle
      }}
    >
      {labels[role] || role}
    </span>
  );
}
