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
          <h2 className="cart-drawer-title">Your Cart</h2>
          <button className="cart-drawer-close" onClick={closeCart} aria-label="Close cart">×</button>
        </div>

        {lines.length === 0 ? (
          <div className="cart-empty">
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
                    <div className="cart-line-info">
                      <p className="cart-line-title">{merchandise.product.title}</p>
                      {merchandise.title !== 'Default Title' && (
                        <p className="cart-line-variant">{merchandise.title}</p>
                      )}
                      <p className="cart-line-price">
                        {formatPrice(merchandise.price.amount, merchandise.price.currencyCode)}
                      </p>
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
                    </div>
                    <button
                      className="cart-line-remove"
                      onClick={() => removeItem(line.id)}
                      disabled={loading}
                      aria-label="Remove item"
                    >×</button>
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
