import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewsletterSignup from '../components/NewsletterSignup'

vi.mock('../lib/shopify', () => ({
  subscribeToNewsletter: vi.fn(),
}))

import { subscribeToNewsletter } from '../lib/shopify'

describe('NewsletterSignup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits name and trimmed email, then shows success state', async () => {
    subscribeToNewsletter.mockResolvedValueOnce('subscribed')
    const user = userEvent.setup()
    render(<NewsletterSignup />)

    await user.type(screen.getByPlaceholderText('Name'), 'Tvesa')
    await user.type(screen.getByPlaceholderText('Email'), ' TEST@example.com ')
    await user.click(screen.getByRole('button', { name: 'Subscribe' }))

    await waitFor(() => {
      expect(subscribeToNewsletter).toHaveBeenCalledWith('TEST@example.com', 'Tvesa')
    })
    expect(screen.getByText('Thank you for signing up!')).toBeInTheDocument()
  })

  it('shows already-subscribed confirmation state', async () => {
    subscribeToNewsletter.mockResolvedValueOnce('already_subscribed')
    const user = userEvent.setup()
    render(<NewsletterSignup />)

    await user.type(screen.getByPlaceholderText('Email'), 'existing@example.com')
    await user.click(screen.getByRole('button', { name: 'Subscribe' }))

    expect(await screen.findByText("You're already on the list!")).toBeInTheDocument()
  })

  it('surfaces API errors to the user', async () => {
    subscribeToNewsletter.mockRejectedValueOnce(new Error('Service unavailable'))
    const user = userEvent.setup()
    render(<NewsletterSignup />)

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Subscribe' }))

    expect(await screen.findByText('Service unavailable')).toBeInTheDocument()
  })
})
