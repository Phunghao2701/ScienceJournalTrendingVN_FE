import Icon from '../../../../shared/components/Icon';

export default function PeerMatchingPromoCard() {
  return (
    <div className="admin-promo-card">
      {/* "NEW SYSTEM" tag + icon */}
      <div className="admin-promo-card__tag">
        <Icon icon="lucide:sparkles" />
        <span>New System</span>
      </div>

      <h3 className="admin-promo-card__title">Automated Peer-Matching Engine</h3>
      <p className="admin-promo-card__description">
        Instantly identify the most qualified reviewers for new submissions using AI that scans
        citation networks and research semantics.
      </p>

      <button type="button" className="admin-promo-card__btn">
        Launch Matching Engine
      </button>
    </div>
  );
}