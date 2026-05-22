import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../Styles/ServiceCategories.css";
import { fetchCategories } from "../services/api";

// يمكنك استبدال الرموز التعبيرية بأيقونات SVG أو صور لاحقاً لتبدو مثل الـ PPT
const categoryIconMap = {
  "lieux-de-reception": "🏰",
  traiteur: "🍽️",
  negafa: "👑",
  photographie: "📸",
  "dj-orchestre": "🎵",
  bijoux: "💎",
  tayfer: "🎁",
};

function ServiceCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories();
        const categoriesData = Array.isArray(response) ? response : [];
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <section className="categories-section">
        <div className="section-header">
          <h2>Catégories de services</h2>
          <p>Chargement des catégories...</p>
        </div>
      </section>
    );
  }

  const categoriesList = categories.map(cat => ({
    id: cat.slug,
    title: cat.name,
    icon: categoryIconMap[cat.slug] || "✨"
  })).filter(cat => cat.id !== 'all');

  return (
    <section className="categories-section">
      <div className="section-header">
        <h2>Catégories de services</h2>
        <p>Explorez nos services exclusifs pour un mariage de rêve</p>
      </div>

      <div className="grid-container">
        {categoriesList.map((cat) => (
          <Link to={`/services?category=${cat.id}`} key={cat.id} className="grid-item">
            <div className="icon-circle">
              {cat.icon}
            </div>
            <h3>{cat.title}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default ServiceCategories;