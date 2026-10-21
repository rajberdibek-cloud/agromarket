import { useEffect, useMemo, useState } from 'react';
import {
  Sprout, ShoppingCart, Search, Menu, X, Truck, ShieldCheck, Headset,
  Leaf, ArrowRight, Plus, Minus, Trash2, CheckCircle2, AlertCircle,
  PackageSearch, Languages, ChevronLeft, Heart, PackageCheck
} from 'lucide-react';
import ProductCard from './components/ProductCard.jsx';
import { translations } from './translations.js';

const categories = [
  ['all', 'all'], ['seeds', 'Семена'], ['fertilizers', 'Удобрения'],
  ['machinery', 'Техника'], ['tools', 'Инструменты']
];

function App() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('default');
  const [onlyStock, setOnlyStock] = useState(false);
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('agromarket-cart') || '[]'); } catch { return []; }
  });
  const [page, setPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [language, setLanguage] = useState(() => localStorage.getItem('agromarket-language') || 'ru');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [orderComplete, setOrderComplete] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const t = translations[language];
  const isKk = language === 'kk';

  async function loadProducts() {
    setLoading(true); setError(false);
    try {
      const response = await fetch('http://localhost:3001/products');
      if (!response.ok) throw new Error('Request failed');
      setProducts(await response.json());
    } catch {
      setError(true);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { localStorage.setItem('agromarket-cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('agromarket-language', language); document.documentElement.lang = language; }, [language]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const name = `${product.name} ${product.nameKk || ''}`.toLowerCase();
      return name.includes(searchTerm.trim().toLowerCase())
        && (category === 'all' || product.category === category)
        && (!onlyStock || product.inStock);
    });
    if (sort === 'asc') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'desc') result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [products, searchTerm, category, sort, onlyStock]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2800);
  }
  function addToCart(product) {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      return found
        ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, quantity: 1 }];
    });
    showNotice(`${isKk ? product.nameKk : product.name} — ${t.added}`);
  }
  function changeQuantity(id, amount) {
    setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0));
  }
  function goTo(nextPage) {
    setPage(nextPage); setSelectedProduct(null); setMobileMenuOpen(false); setOrderComplete(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function openProduct(id) {
    setSelectedProduct(products.find((item) => item.id === id) || null);
    setPage('product'); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function toggleLanguage() { setLanguage((current) => current === 'ru' ? 'kk' : 'ru'); }
  const visibleProducts = page === 'home' ? filteredProducts.slice(0, 6) : filteredProducts;
  const productName = (product) => isKk ? (product.nameKk || product.name) : product.name;
  const money = (amount) => `${Number(amount).toLocaleString(isKk ? 'kk-KZ' : 'ru-RU')} ₸`;

  return (
    <div className="app-shell">
      <div className="top-strip"><div className="container top-strip-inner">
        <span><Truck size={14} /> {t.delivery}</span><span className="top-strip-right"><ShieldCheck size={14} /> {t.quality}</span>
      </div></div>
      <header className="site-header"><div className="container header-inner">
        <button className="brand" onClick={() => goTo('home')} aria-label="AgroMarket home">
          <span className="brand-mark"><Sprout size={25} /></span>
          <span className="brand-text">Агро<span>Маркет</span><small>{t.heroEyebrow}</small></span>
        </button>
        <nav className={`main-nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
          <button className={page === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => goTo('home')}>{t.home}</button>
          <button className={page === 'catalog' || page === 'product' ? 'nav-link active' : 'nav-link'} onClick={() => goTo('catalog')}>{t.catalog}</button>
          <button className="nav-link" onClick={() => { goTo('home'); setTimeout(() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>{t.about}</button>
          <button className="nav-link" onClick={() => document.getElementById('site-footer')?.scrollIntoView({ behavior: 'smooth' })}>{t.contacts}</button>
        </nav>
        <div className="header-actions">
          <button className="language-button" onClick={toggleLanguage} title="Change language"><Languages size={17} /><span>{isKk ? 'ҚАЗ' : 'РУС'}</span></button>
          <button className="icon-button cart-header-button" onClick={() => goTo('cart')} aria-label={t.cart}><ShoppingCart size={21} /><span>{cartCount}</span></button>
          <button className="login-header" onClick={() => goTo('auth')}>{t.login}</button>
          <button className="mobile-menu-button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Menu">{mobileMenuOpen ? <X /> : <Menu />}</button>
        </div>
      </div></header>

      <main>
        {page === 'home' && <section className="hero-section"><div className="container hero-grid">
          <div className="hero-content"><span className="eyebrow"><Leaf size={15} /> {t.heroEyebrow}</span>
            <h1>{t.heroTitle}<span>.</span></h1><p>{t.heroText}</p>
            <button className="button button-primary hero-button" onClick={() => goTo('catalog')}>{t.goCatalog}<ArrowRight size={18} /></button>
            <div className="hero-mini-stats"><span><CheckCircle2 size={16} /> {t.quality}</span><span><Truck size={16} /> {t.delivery}</span></div>
          </div>
          <div className="hero-image-area"><img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1300&q=85" alt="Agricultural field" />
            <div className="hero-image-label"><span className="hero-label-icon"><Sprout size={20} /></span><span><strong>AgroMarket</strong><small>{isKk ? 'Фермерлерге арналған' : 'Для фермеров Казахстана'}</small></span></div>
            <div className="floating-leaf"><Leaf size={25} /></div>
          </div>
        </div></section>}

        {page === 'home' && <section className="benefits-strip container" id="benefits">
          <div className="benefit-item"><span><Truck /></span><div><strong>{t.delivery}</strong><small>{isKk ? 'Ел бойынша ыңғайлы жеткізу' : 'Удобная доставка по стране'}</small></div></div>
          <div className="benefit-item"><span><ShieldCheck /></span><div><strong>{t.benefitOne}</strong><small>{isKk ? 'Таңдалған тауарлар' : 'Товары для хозяйства'}</small></div></div>
          <div className="benefit-item"><span><Headset /></span><div><strong>{t.benefitThree}</strong><small>{isKk ? 'Сатып алуға көмектесеміз' : 'Поможем с выбором'}</small></div></div>
        </section>}

        {(page === 'home' || page === 'catalog') && <section className="container catalog-section" id="catalog">
          <div className="section-heading"><div><span className="eyebrow">{page === 'home' ? t.popular : t.catalog}</span><h2>{page === 'home' ? t.popular : t.catalogTitle}</h2><p>{page === 'catalog' ? t.catalogSubtitle : ''}</p></div>
            {page === 'home' && <button className="text-link" onClick={() => goTo('catalog')}>{t.allProducts}<ArrowRight size={16} /></button>}
          </div>
          <div className="catalog-toolbar">
            <label className="search-box"><Search size={19} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={t.search} />{searchTerm && <button onClick={() => setSearchTerm('')} aria-label="Clear search"><X size={16} /></button>}</label>
            <label className="sort-select"><span>{t.sort}:</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="default">{t.defaultSort}</option><option value="asc">{t.priceAsc}</option><option value="desc">{t.priceDesc}</option></select></label>
          </div>
          <div className="catalog-layout"><aside className="filters-panel"><h3>{t.categories}</h3>
            <div className="category-list">{categories.map(([key, value]) => <button key={key} className={category === value ? 'category-button selected' : 'category-button'} onClick={() => setCategory(value)}><span className="category-dot" />{t[key]}<span className="category-arrow">›</span></button>)}</div>
            <div className="filter-divider" /><label className="stock-filter"><input type="checkbox" checked={onlyStock} onChange={(event) => setOnlyStock(event.target.checked)} /><span>{t.inStock}</span></label>
            <button className="reset-filters" onClick={() => { setSearchTerm(''); setCategory('all'); setSort('default'); setOnlyStock(false); }}>{t.reset}</button>
          </aside>
          <div className="catalog-results">{loading ? <div className="loading-state"><span className="spinner" /><strong>{t.loading}</strong></div> :
            error ? <div className="error-state"><AlertCircle size={34} /><h3>{t.loadError}</h3><button className="button button-primary" onClick={loadProducts}>{t.retry}</button></div> :
            visibleProducts.length === 0 ? <div className="empty-state compact"><PackageSearch size={36} /><h3>{t.noResults}</h3><p>{t.noResultsText}</p><button className="button button-outline" onClick={() => { setSearchTerm(''); setCategory('all'); setOnlyStock(false); }}>{t.reset}</button></div> :
            <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={addToCart} onOpen={openProduct} language={language} t={t} />)}</div>}
          </div></div>
        </section>}

        {page === 'product' && <section className="container page-section">
          <button className="back-link" onClick={() => goTo('catalog')}><ChevronLeft size={17} /> {t.backCatalog}</button>
          {!selectedProduct ? <div className="empty-state"><PackageSearch size={36}/><h2>{t.productNotFound}</h2><button className="button button-primary" onClick={() => goTo('catalog')}>{t.backCatalog}</button></div> :
            <div className="product-detail"><img src={selectedProduct.image} alt={productName(selectedProduct)} onError={(e) => {e.currentTarget.src='https://placehold.co/700x600/e8f4eb/16834a?text=AgroMarket';}} />
              <div className="product-detail-info"><span className="eyebrow">{isKk ? selectedProduct.categoryKk : selectedProduct.category}</span><h1>{productName(selectedProduct)}</h1><div className="detail-stock"><CheckCircle2 size={16}/>{t.stock}</div><strong className="detail-price">{money(selectedProduct.price)}</strong><h3>{t.description}</h3><p>{isKk ? (selectedProduct.descriptionKk || selectedProduct.description) : selectedProduct.description}</p>
                <button className="button button-primary button-wide" onClick={() => addToCart(selectedProduct)}><ShoppingCart size={18}/>{t.addToCart}</button>
                <button className="button button-outline button-wide favorite-button" onClick={() => setFavorites((current) => current.includes(selectedProduct.id) ? current.filter((id) => id !== selectedProduct.id) : [...current, selectedProduct.id])}><Heart size={17} fill={favorites.includes(selectedProduct.id) ? 'currentColor' : 'none'}/>{favorites.includes(selectedProduct.id) ? (isKk ? 'Таңдаулылардан алу' : 'Убрать из избранного') : (isKk ? 'Таңдаулыларға қосу' : 'В избранное')}</button>
              </div>
            </div>}
        </section>}

        {page === 'cart' && <section className="container page-section cart-page">
          <button className="back-link" onClick={() => goTo('catalog')}><ChevronLeft size={17}/>{t.continueShopping}</button>
          <div className="section-heading"><div><span className="eyebrow">{t.cart}</span><h1>{t.cart}</h1></div><span className="muted">{cartCount} {t.items}</span></div>
          {cart.length === 0 ? <div className="empty-state"><span className="empty-icon"><ShoppingCart size={34}/></span><h2>{t.emptyCart}</h2><p>{t.emptyCartText}</p><button className="button button-primary" onClick={() => goTo('catalog')}>{t.continueShopping}<ArrowRight size={17}/></button></div> :
            <div className="cart-layout"><div className="cart-items">{cart.map((item) => <article className="cart-item" key={item.id}>
              <img src={item.image} alt={productName(item)}/><div className="cart-item-info"><button className="product-name-button" onClick={() => openProduct(item.id)}><h3>{productName(item)}</h3></button><strong>{money(item.price)}</strong></div>
              <div className="quantity-control"><button onClick={() => changeQuantity(item.id, -1)} aria-label="Decrease"><Minus size={15}/></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)} aria-label="Increase"><Plus size={15}/></button></div>
              <button className="remove-button" onClick={() => setCart((current) => current.filter((x) => x.id !== item.id))} aria-label={t.remove}><Trash2 size={17}/></button>
            </article>)}</div>
            <aside className="cart-summary"><h2>{t.total}</h2><div className="summary-total">{money(cartTotal)}</div><p className="muted">{cartCount} {t.items}</p><button className="button button-primary button-wide" onClick={() => goTo('checkout')}>{t.checkout}</button><p className="small-note">{t.checkoutNote}</p></aside></div>}
        </section>}

        {page === 'checkout' && <section className="container page-section narrow-page">
          <button className="back-link" onClick={() => goTo('cart')}><ChevronLeft size={17}/>{t.cart}</button>
          {orderComplete ? <div className="success-panel"><span><PackageCheck size={40}/></span><h1>{t.orderSuccess}</h1><p>{t.checkoutNote}</p><button className="button button-primary" onClick={() => { setCart([]); goTo('home'); }}>{t.backHome}</button></div> :
          <div className="checkout-layout"><form className="form-card" onSubmit={(event) => { event.preventDefault(); setOrderComplete(true); showNotice(t.orderSuccess); }}>
            <span className="eyebrow">{t.checkout}</span><h1>{t.checkout}</h1>
            <label>{t.name}<input required name="name" placeholder={t.name}/></label>
            <div className="form-row"><label>{t.phone}<input required name="phone" type="tel" placeholder="+7 700 000 00 00"/></label><label>{t.email}<input name="email" type="email" placeholder="name@example.com"/></label></div>
            <label>{t.address}<textarea required name="address" rows="3" placeholder={t.address}/></label>
            <button className="button button-primary button-wide" type="submit">{t.submitOrder}</button>
            <p className="small-note">{t.checkoutNote}</p>
          </form><aside className="cart-summary"><h2>{t.orderSummary}</h2>{cart.map((item) => <div className="summary-line" key={item.id}><span>{productName(item)} × {item.quantity}</span><strong>{money(item.price * item.quantity)}</strong></div>)}<div className="summary-total">{money(cartTotal)}</div></aside></div>}
        </section>}

        {page === 'auth' && <section className="container page-section auth-page"><div className="auth-card">
          <span className="auth-logo"><Sprout size={29}/></span><span className="eyebrow">AgroMarket</span><h1>{authMode === 'login' ? t.login : t.register}</h1><p>{t.demoAuth}</p>
          <div className="auth-tabs"><button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>{t.login}</button><button className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>{t.register}</button></div>
          <form onSubmit={(event) => { event.preventDefault(); showNotice(t.loginSuccess); goTo('home'); }} className="auth-form">
            {authMode === 'register' && <label>{t.fullName}<input required name="fullName" autoComplete="name" placeholder={t.fullName}/></label>}
            <label>Email<input required type="email" name="email" autoComplete="email" placeholder="name@example.com"/></label>
            <label>{t.password}<input required type="password" name="password" minLength="4" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} placeholder="••••••••"/></label>
            <button className="button button-primary button-wide" type="submit">{authMode === 'login' ? t.signIn : t.createAccount}</button>
          </form>
          <p className="auth-switch">{authMode === 'login' ? t.noAccount : t.hasAccount} <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? t.register : t.login}</button></p>
        </div></section>}
      </main>

      <footer className="site-footer" id="site-footer"><div className="container footer-main">
        <div className="footer-brand"><span className="brand-mark"><Sprout size={24}/></span><div><strong>АгроМаркет</strong><p>{t.footerText}</p></div></div>
        <div className="footer-contact"><strong>{t.contacts}</strong><span>Astana, Kazakhstan</span><span>info@agromarket.local</span></div>
      </div><div className="container footer-bottom"><span>{t.footer}</span><span>React · Vite · json-server</span></div></footer>
      {notice && <div className="toast"><CheckCircle2 size={19}/><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Close"><X size={16}/></button></div>}
    </div>
  );
}

export default App;