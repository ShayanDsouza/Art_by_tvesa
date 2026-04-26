import { useCart } from '../contexts/CartContext'
import { formatPrice } from '../lib/shopify'

export default function ShopCart() {
  const { cartOpen, closeCart, lines, totalAmount, checkoutUrl, removeItem, updateItem, loading } = useCart()

  return (
    <>
      {/* Backdrop */}
      {cartOpen && (
        <div className="cart-backdrop" onClick={closeCart} />
      )}

      {/* Drawer */}
      <div className={`cart-drawer${cartOpen ? ' open' : ''}`}>
        <div className="cart-drawer-header">
          <div className="cart-drawer-header-left">
            <h2 className="cart-drawer-title">Your Cart</h2>
            {lines.length > 0 && (
              <span className="cart-drawer-count">{lines.length} {lines.length === 1 ? 'item' : 'items'}</span>
            )}
          </div>
          <button className="cart-drawer-close" onClick={closeCart} aria-label="Close cart">×</button>
        </div>

        {lines.length === 0 ? (
          <div className="cart-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {lines.map(line => {
                const { merchandise } = line
                const image = merchandise.product.images.edges[0]?.node
                return (
                  <li key={line.id} className="cart-line">
                    {image && (
                      <img
                        src={image.url}
                        alt={image.altText || merchandise.product.title}
                        className="cart-line-img"
                      />
                    )}
                    <div className="cart-line-body">
                      <div className="cart-line-top">
                        <p className="cart-line-title">{merchandise.product.title}</p>
                        {merchandise.title !== 'Default Title' && (
                          <p className="cart-line-variant">{merchandise.title}</p>
                        )}
                        <p className="cart-line-price">
                          {formatPrice(merchandise.price.amount, merchandise.price.currencyCode)}
                        </p>
                      </div>
                      <div className="cart-line-actions">
                        <div className="cart-line-qty">
                          <button
                            onClick={() => updateItem(line.id, line.quantity - 1)}
                            disabled={loading}
                            aria-label="Decrease quantity"
                          >−</button>
                          <span>{line.quantity}</span>
                          <button
                            onClick={() => updateItem(line.id, line.quantity + 1)}
                            disabled={loading}
                            aria-label="Increase quantity"
                          >+</button>
                        </div>
                        <button
                          className="cart-line-delete"
                          onClick={() => removeItem(line.id)}
                          disabled={loading}
                          aria-label="Remove item"
                        >Remove</button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="cart-footer">
              {totalAmount && (
                <div className="cart-total">
                  <span>Total</span>
                  <span>{formatPrice(totalAmount.amount, totalAmount.currencyCode)}</span>
                </div>
              )}
              <a
                href={checkoutUrl}
                className="cart-checkout-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Checkout
              </a>
            </div>
          </>
        )}
      </div>
    </>
  )
}
