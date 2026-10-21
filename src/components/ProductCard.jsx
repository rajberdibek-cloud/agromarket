import { ShoppingCart, CheckCircle2, ArrowUpRight } from 'lucide-react';

export default function ProductCard({ product, onAdd, onOpen, language, t }) {
  const isKk = language === 'kk';
  return (
    <article className="product-card">
      <button className="product-image-button" onClick={() => onOpen(product.id)} aria-label={t.viewProduct}>
        <img className="product-image" src={product.image} alt={isKk ? product.nameKk : product.name}
          loading="lazy" onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x420/e8f4eb/16834a?text=AgroMarket'; }} />
        <span className="stock-badge"><CheckCircle2 size={13} /> {t.stock}</span>
        <span className="image-open"><ArrowUpRight size={17} /></span>
      </button>
      <div className="product-info">
        <span className="product-category">{isKk ? product.categoryKk : product.category}</span>
        <button className="product-name-button" onClick={() => onOpen(product.id)}><h3>{isKk ? product.nameKk : product.name}</h3></button>
        <p className="product-description">{isKk ? (product.descriptionKk || product.description) : product.description}</p>
        <div className="product-bottom">
          <strong className="product-price">{Number(product.price).toLocaleString(isKk ? 'kk-KZ' : 'ru-RU')} ₸</strong>
          <button className="button button-primary add-button" onClick={() => onAdd(product)}><ShoppingCart size={16} /><span>{t.addToCart}</span></button>
        </div>
      </div>
    </article>
  );
}