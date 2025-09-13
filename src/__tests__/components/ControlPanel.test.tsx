import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ControlPanel from '@/components/ControlPanel'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('ControlPanel', () => {
  const mockOnShowMaterialChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('renders settings button when closed', () => {
    render(<ControlPanel onShowMaterialChange={mockOnShowMaterialChange} />)
    
    const settingsButton = screen.getByRole('button', { name: /open controls/i })
    expect(settingsButton).toBeInTheDocument()
  })

  it('opens control panel when settings button is clicked', async () => {
    const user = userEvent.setup()
    render(<ControlPanel onShowMaterialChange={mockOnShowMaterialChange} />)
    
    const settingsButton = screen.getByRole('button', { name: /open controls/i })
    await user.click(settingsButton)
    
    expect(screen.getByText('Controls')).toBeInTheDocument()
    expect(screen.getByText('Show Material')).toBeInTheDocument()
  })

  it('closes control panel when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<ControlPanel onShowMaterialChange={mockOnShowMaterialChange} />)
    
    // Open panel
    const settingsButton = screen.getByRole('button', { name: /open controls/i })
    await user.click(settingsButton)
    
    // Close panel
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)
    
    expect(screen.queryByText('Controls')).not.toBeInTheDocument()
  })

  it('loads initial state from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('false')
    render(<ControlPanel onShowMaterialChange={mockOnShowMaterialChange} />)
    
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('izanagi-show-material')
    expect(mockOnShowMaterialChange).toHaveBeenCalledWith(false)
  })

  it('defaults to show material when no localStorage value', () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    render(<ControlPanel onShowMaterialChange={mockOnShowMaterialChange} />)
    
    expect(mockOnShowMaterialChange).toHaveBeenCalledWith(true)
  })

  it('toggles show material setting and saves to localStorage', async () => {
    const user = userEvent.setup()
    mockLocalStorage.getItem.mockReturnValue('true')
    
    render(<ControlPanel onShowMaterialChange={mockOnShowMaterialChange} />)
    
    // Open panel
    const settingsButton = screen.getByRole('button', { name: /open controls/i })
    await user.click(settingsButton)
    
    // Find and toggle show material checkbox specifically
    const checkbox = screen.getByLabelText('Show Material')
    expect(checkbox).toBeChecked()
    
    await user.click(checkbox)
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('izanagi-show-material', 'false')
    expect(mockOnShowMaterialChange).toHaveBeenCalledWith(false)
  })

  it('checkbox reflects current show material state', async () => {
    const user = userEvent.setup()
    mockLocalStorage.getItem.mockReturnValue('false')
    
    render(<ControlPanel onShowMaterialChange={mockOnShowMaterialChange} />)
    
    // Open panel
    const settingsButton = screen.getByRole('button', { name: /open controls/i })
    await user.click(settingsButton)
    
    const checkbox = screen.getByLabelText('Show Material')
    expect(checkbox).not.toBeChecked()
  })
})