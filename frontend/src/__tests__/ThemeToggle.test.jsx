import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeToggle from '../components/ui/ThemeToggle.jsx'
import { ThemeProvider } from '../context/ThemeContext.jsx'

describe('ThemeToggle', () => {
  it('switches between light and dark and remembers the choice', () => {
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>)
    const button = screen.getByRole('button', { name: 'Switch to dark mode' })
    fireEvent.click(button)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
