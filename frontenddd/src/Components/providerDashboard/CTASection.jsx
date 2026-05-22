import { MdArrowForward, MdAutoAwesome } from "react-icons/md";

function CTASection({ onClick }) {
  return (
    <section className="provider-visibility-cta provider-animate-in">
      <div className="provider-cta-icon"><MdAutoAwesome /></div>
      <div>
        <h2>Augmentez votre visibilite</h2>
        <p>Completez votre profil et ajoutez plus de photos pour attirer plus de clients.</p>
      </div>
      <button type="button" onClick={onClick}>
        Ameliorer mon profil <MdArrowForward />
      </button>
    </section>
  );
}

export default CTASection;
