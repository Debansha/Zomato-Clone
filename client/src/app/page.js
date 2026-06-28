import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className="flex-col">
      {/* Navbar overlaying the hero */}
      <header className={styles.header}>
        <div className={`container flex justify-between items-center ${styles.navContainer}`}>
          <div className={styles.logo}>
            <span className="text-h3 font-bold text-inverse">zomato</span>
          </div>
          <nav className="flex gap-6 items-center text-inverse font-medium">
            <Link href="/investor" className={styles.navLink}>Investor Relations</Link>
            <Link href="/add-restaurant" className={styles.navLink}>Add restaurant</Link>
            <Link href="/login" className={styles.navLink}>Log in</Link>
            <Link href="/signup" className={styles.navLink}>Sign up</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <Image 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
            alt="Delicious food background"
            fill
            priority
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay}></div>
        </div>
        
        <div className={`container flex-col items-center justify-center animate-slide-up ${styles.heroContent}`}>
          <h1 className={styles.heroTitle}>zomato</h1>
          <p className="text-h3 text-inverse font-medium">Discover the best food & drinks in Bengaluru</p>
          
          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <div className={styles.locationSelector}>
              <span className={styles.icon}>📍</span>
              <select className={styles.select}>
                <option>Bengaluru</option>
                <option>Mumbai</option>
                <option>Delhi NCR</option>
              </select>
            </div>
            <div className={styles.searchDivider}></div>
            <div className={styles.searchInputWrapper}>
              <span className={styles.icon}>🔍</span>
              <input 
                type="text" 
                placeholder="Search for restaurant, cuisine or a dish" 
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Cards Section */}
      <section className="container" style={{ marginTop: 'var(--space-10)', marginBottom: 'var(--space-10)' }}>
        <div className={`grid grid-cols-3 gap-6`}>
          <div className={styles.actionCard}>
            <div className={styles.actionCardImg}>
              <Image src="https://images.unsplash.com/photo-1526318896980-cf78c088247c?q=80&w=600&auto=format&fit=crop" alt="Order Online" fill />
            </div>
            <div className={styles.actionCardContent}>
              <h3 className="text-h4 font-semibold">Order Online</h3>
              <p className="text-muted">Stay home and order to your door</p>
            </div>
          </div>
          
          <div className={styles.actionCard}>
            <div className={styles.actionCardImg}>
              <Image src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop" alt="Dining Out" fill />
            </div>
            <div className={styles.actionCardContent}>
              <h3 className="text-h4 font-semibold">Dining Out</h3>
              <p className="text-muted">View the city's favourite dining venues</p>
            </div>
          </div>
          
          <div className={styles.actionCard}>
            <div className={styles.actionCardImg}>
              <Image src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop" alt="Nightlife and Clubs" fill />
            </div>
            <div className={styles.actionCardContent}>
              <h3 className="text-h4 font-semibold">Nightlife and Clubs</h3>
              <p className="text-muted">Explore the city's top nightlife outlets</p>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="container" style={{ marginBottom: 'var(--space-16)' }}>
        <h2 className="text-h2 font-medium" style={{ marginBottom: 'var(--space-2)' }}>Collections</h2>
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-6)' }}>
          <p className="text-h4 text-muted font-medium">Explore curated lists of top restaurants, cafes, pubs, and bars in Bengaluru, based on trends</p>
          <Link href="/collections" className="text-primary hover:underline">All collections in Bengaluru ➔</Link>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { title: "Top Trending Spots", count: 29, img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=400&auto=format&fit=crop" },
            { title: "Best Insta-worthy Places", count: 21, img: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=400&auto=format&fit=crop" },
            { title: "Newly Opened", count: 18, img: "https://images.unsplash.com/photo-1466978913421-bac2e5e75e4e?q=80&w=400&auto=format&fit=crop" },
            { title: "Great Cafes", count: 22, img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=400&auto=format&fit=crop" }
          ].map((collection, idx) => (
            <div key={idx} className={styles.collectionCard}>
              <Image src={collection.img} alt={collection.title} fill className={styles.collectionImg} />
              <div className={styles.collectionOverlay}>
                <h4 className="text-h4 text-inverse font-medium">{collection.title}</h4>
                <p className="text-inverse text-small">{collection.count} Places ▶</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Get App Section */}
      <section className={styles.getAppSection}>
        <div className={`container flex items-center justify-center gap-12`}>
          <div className={styles.phoneMockup}>
            <Image src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=400&auto=format&fit=crop" alt="App Mockup" width={250} height={500} style={{ borderRadius: 'var(--radius-xl)' }} />
          </div>
          <div className={styles.getAppContent}>
            <h2 className="text-h1 font-medium" style={{ marginBottom: 'var(--space-4)' }}>Get the Zomato app</h2>
            <p className="text-h4 text-muted" style={{ marginBottom: 'var(--space-6)' }}>
              We will send you a link, open it on your phone to download the app
            </p>
            
            <div className="flex gap-4" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="app-link" defaultChecked />
                <span>Email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="app-link" />
                <span>Phone</span>
              </label>
            </div>

            <div className="flex gap-2" style={{ marginBottom: 'var(--space-6)' }}>
              <input type="text" placeholder="Email" className="input" style={{ maxWidth: '300px' }} />
              <button className="btn btn-primary" style={{ padding: '0 var(--space-6)' }}>Share App Link</button>
            </div>

            <p className="text-muted text-small" style={{ marginBottom: 'var(--space-2)' }}>Download app from</p>
            <div className="flex gap-4">
              <div className={styles.storeBtn}>Google Play</div>
              <div className={styles.storeBtn}>App Store</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-8)' }}>
            <h2 className="text-h2 font-bold">zomato</h2>
            <div className="flex gap-4">
              <select className="input" style={{ width: 'auto' }}><option>India</option></select>
              <select className="input" style={{ width: 'auto' }}><option>English</option></select>
            </div>
          </div>
          <div className={styles.footerDivider}></div>
          <p className="text-small text-muted" style={{ marginTop: 'var(--space-6)' }}>
            By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies. All trademarks are properties of their respective owners. 2008-2026 © Zomato™ Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
