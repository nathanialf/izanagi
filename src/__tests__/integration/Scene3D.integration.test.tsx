import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ControlPanel from '@/components/ControlPanel'

// Mock React Three Fiber components
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas">{children}</div>
  ),
}))

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
}))

describe('Control Panel Integration', () => {
  const mockOnShowMaterialChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('integrates with parent component state management', async () => {
    const user = userEvent.setup()
    render(<ControlPanel onShowMaterialChange={mockOnShowMaterialChange} />)
    
    // Open control panel
    const settingsButton = screen.getByRole('button', { name: /open controls/i })
    await user.click(settingsButton)
    
    // Should show controls
    expect(screen.getByText('Controls')).toBeInTheDocument()
    expect(screen.getByText('Show Material')).toBeInTheDocument()
    
    // Should have checkbox for show material toggle
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  it('handles show material state changes with parent callbacks', async () => {
    const user = userEvent.setup()
    render(<ControlPanel onShowMaterialChange={mockOnShowMaterialChange} />)
    
    // Open control panel
    const settingsButton = screen.getByRole('button', { name: /open controls/i })
    await user.click(settingsButton)
    
    const checkbox = screen.getByRole('checkbox')
    
    // Should start checked (show material = true)
    expect(checkbox).toBeChecked()
    
    // Toggle to spectral mode
    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
    expect(mockOnShowMaterialChange).toHaveBeenCalledWith(false)
    
    // Toggle back to material mode
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    expect(mockOnShowMaterialChange).toHaveBeenCalledWith(true)
  })

  it('maintains state persistence through localStorage integration', async () => {
    const user = userEvent.setup()
    
    // Mock localStorage
    const mockSetItem = jest.spyOn(Storage.prototype, 'setItem')
    const mockGetItem = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('false')
    
    render(<ControlPanel onShowMaterialChange={mockOnShowMaterialChange} />)
    
    // Should load from localStorage on mount
    expect(mockGetItem).toHaveBeenCalledWith('izanagi-show-material')
    expect(mockOnShowMaterialChange).toHaveBeenCalledWith(false)
    
    // Open control panel
    const settingsButton = screen.getByRole('button', { name: /open controls/i })
    await user.click(settingsButton)
    
    const checkbox = screen.getByRole('checkbox')
    
    // Toggle setting
    await user.click(checkbox)
    
    // Should save to localStorage
    expect(mockSetItem).toHaveBeenCalledWith('izanagi-show-material', 'true')
    expect(mockOnShowMaterialChange).toHaveBeenCalledWith(true)
    
    mockSetItem.mockRestore()
    mockGetItem.mockRestore()
  })

  it('handles edge cases in state management', async () => {
    const user = userEvent.setup()
    
    // Test with corrupted localStorage
    const mockGetItem = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('invalid')
    
    render(<ControlPanel onShowMaterialChange={mockOnShowMaterialChange} />)
    
    // Should default to true when localStorage has invalid data
    expect(mockOnShowMaterialChange).toHaveBeenCalledWith(true)
    
    mockGetItem.mockRestore()
  })
})