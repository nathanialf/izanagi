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
  const mockOnPixelatedModeChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Clear localStorage to ensure clean state between tests
    localStorage.clear()
  })

  it('integrates with parent component state management', async () => {
    const user = userEvent.setup()
    render(
      <ControlPanel 
        onShowMaterialChange={mockOnShowMaterialChange}
        onPixelatedModeChange={mockOnPixelatedModeChange}
      />
    )
    
    // Open control panel
    const settingsButton = screen.getByRole('button', { name: /open controls/i })
    await user.click(settingsButton)
    
    // Should show controls
    expect(screen.getByText('Controls')).toBeInTheDocument()
    expect(screen.getByText('Show Material')).toBeInTheDocument()
    expect(screen.getByText('Pixelated Mode')).toBeInTheDocument()
    
    // Should have checkboxes for both toggles
    const materialCheckbox = screen.getByLabelText('Show Material')
    const pixelatedCheckbox = screen.getByLabelText('Pixelated Mode')
    expect(materialCheckbox).toBeInTheDocument()
    expect(pixelatedCheckbox).toBeInTheDocument()
  })

  it('handles show material state changes with parent callbacks', async () => {
    const user = userEvent.setup()
    render(
      <ControlPanel 
        onShowMaterialChange={mockOnShowMaterialChange}
        onPixelatedModeChange={mockOnPixelatedModeChange}
      />
    )
    
    // Open control panel
    const settingsButton = screen.getByRole('button', { name: /open controls/i })
    await user.click(settingsButton)
    
    const materialCheckbox = screen.getByLabelText('Show Material')
    const pixelatedCheckbox = screen.getByLabelText('Pixelated Mode')
    
    // Should start with material checked and pixelated unchecked
    expect(materialCheckbox).toBeChecked()
    expect(pixelatedCheckbox).not.toBeChecked()
    
    // Toggle to spectral mode
    await user.click(materialCheckbox)
    expect(materialCheckbox).not.toBeChecked()
    expect(mockOnShowMaterialChange).toHaveBeenCalledWith(false)
    
    // Toggle pixelated mode on
    await user.click(pixelatedCheckbox)
    expect(pixelatedCheckbox).toBeChecked()
    expect(mockOnPixelatedModeChange).toHaveBeenCalledWith(true)
    
    // Toggle back to material mode
    await user.click(materialCheckbox)
    expect(materialCheckbox).toBeChecked()
    expect(mockOnShowMaterialChange).toHaveBeenCalledWith(true)
    
    // Toggle pixelated mode off
    await user.click(pixelatedCheckbox)
    expect(pixelatedCheckbox).not.toBeChecked()
    expect(mockOnPixelatedModeChange).toHaveBeenCalledWith(false)
  })

  it('maintains state persistence through localStorage integration', async () => {
    const user = userEvent.setup()
    
    // Mock localStorage
    const mockSetItem = jest.spyOn(Storage.prototype, 'setItem')
    const mockGetItem = jest.spyOn(Storage.prototype, 'getItem')
      .mockImplementation((key) => {
        if (key === 'izanagi-show-material') return 'false'
        if (key === 'izanagi-pixelated-mode') return 'true'
        return null
      })
    
    render(
      <ControlPanel 
        onShowMaterialChange={mockOnShowMaterialChange}
        onPixelatedModeChange={mockOnPixelatedModeChange}
      />
    )
    
    // Should load from localStorage on mount
    expect(mockGetItem).toHaveBeenCalledWith('izanagi-show-material')
    expect(mockGetItem).toHaveBeenCalledWith('izanagi-pixelated-mode')
    expect(mockOnShowMaterialChange).toHaveBeenCalledWith(false)
    expect(mockOnPixelatedModeChange).toHaveBeenCalledWith(true)
    
    // Open control panel
    const settingsButton = screen.getByRole('button', { name: /open controls/i })
    await user.click(settingsButton)
    
    const materialCheckbox = screen.getByLabelText('Show Material')
    const pixelatedCheckbox = screen.getByLabelText('Pixelated Mode')
    
    // Toggle material setting
    await user.click(materialCheckbox)
    expect(mockSetItem).toHaveBeenCalledWith('izanagi-show-material', 'true')
    expect(mockOnShowMaterialChange).toHaveBeenCalledWith(true)
    
    // Toggle pixelated setting
    await user.click(pixelatedCheckbox)
    expect(mockSetItem).toHaveBeenCalledWith('izanagi-pixelated-mode', 'false')
    expect(mockOnPixelatedModeChange).toHaveBeenCalledWith(false)
    
    mockSetItem.mockRestore()
    mockGetItem.mockRestore()
  })

  it('handles edge cases in state management', async () => {
    const user = userEvent.setup()
    
    // Test with corrupted localStorage
    const mockGetItem = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('invalid')
    
    render(
      <ControlPanel 
        onShowMaterialChange={mockOnShowMaterialChange}
        onPixelatedModeChange={mockOnPixelatedModeChange}
      />
    )
    
    // Should default to true for material and false for pixelated when localStorage has invalid data
    expect(mockOnShowMaterialChange).toHaveBeenCalledWith(true)
    expect(mockOnPixelatedModeChange).toHaveBeenCalledWith(false)
    
    mockGetItem.mockRestore()
  })

  it('handles pixelated mode state independently from material mode', async () => {
    const user = userEvent.setup()
    
    render(
      <ControlPanel 
        onShowMaterialChange={mockOnShowMaterialChange}
        onPixelatedModeChange={mockOnPixelatedModeChange}
      />
    )
    
    // Open control panel
    const settingsButton = screen.getByRole('button', { name: /open controls/i })
    await user.click(settingsButton)
    
    const materialCheckbox = screen.getByLabelText('Show Material')
    const pixelatedCheckbox = screen.getByLabelText('Pixelated Mode')
    
    // Initial state: material on, pixelated off
    expect(materialCheckbox).toBeChecked()
    expect(pixelatedCheckbox).not.toBeChecked()
    
    // Enable pixelated mode while keeping material mode
    await user.click(pixelatedCheckbox)
    expect(pixelatedCheckbox).toBeChecked()
    expect(materialCheckbox).toBeChecked() // Should remain unchanged
    expect(mockOnPixelatedModeChange).toHaveBeenCalledWith(true)
    
    // Disable material mode while keeping pixelated mode
    await user.click(materialCheckbox)
    expect(materialCheckbox).not.toBeChecked()
    expect(pixelatedCheckbox).toBeChecked() // Should remain unchanged
    expect(mockOnShowMaterialChange).toHaveBeenCalledWith(false)
  })

  it('handles Game Boy mode integration with control panel', async () => {
    const mockOnGameBoyModeChange = jest.fn()
    const user = userEvent.setup()
    
    render(
      <ControlPanel 
        onShowMaterialChange={mockOnShowMaterialChange}
        onPixelatedModeChange={mockOnPixelatedModeChange}
        onGameBoyModeChange={mockOnGameBoyModeChange}
      />
    )
    
    // Open control panel
    const settingsButton = screen.getByRole('button', { name: /open controls/i })
    await user.click(settingsButton)
    
    // Should show Game Boy mode toggle
    expect(screen.getByText('Game Boy Mode')).toBeInTheDocument()
    
    const gameBoyCheckbox = screen.getByLabelText('Game Boy Mode')
    expect(gameBoyCheckbox).toBeInTheDocument()
    expect(gameBoyCheckbox).not.toBeChecked()
    
    // Enable Game Boy mode
    await user.click(gameBoyCheckbox)
    expect(gameBoyCheckbox).toBeChecked()
    expect(mockOnGameBoyModeChange).toHaveBeenCalledWith(true)
    
    // Disable Game Boy mode
    await user.click(gameBoyCheckbox)
    expect(gameBoyCheckbox).not.toBeChecked()
    expect(mockOnGameBoyModeChange).toHaveBeenCalledWith(false)
  })

  it('handles all three modes independently', async () => {
    const mockOnGameBoyModeChange = jest.fn()
    const user = userEvent.setup()
    
    render(
      <ControlPanel 
        onShowMaterialChange={mockOnShowMaterialChange}
        onPixelatedModeChange={mockOnPixelatedModeChange}
        onGameBoyModeChange={mockOnGameBoyModeChange}
      />
    )
    
    // Open control panel
    const settingsButton = screen.getByRole('button', { name: /open controls/i })
    await user.click(settingsButton)
    
    const materialCheckbox = screen.getByLabelText('Show Material')
    const pixelatedCheckbox = screen.getByLabelText('Pixelated Mode')
    const gameBoyCheckbox = screen.getByLabelText('Game Boy Mode')
    
    // Enable all modes
    await user.click(pixelatedCheckbox)
    await user.click(gameBoyCheckbox)
    
    // All modes should be enabled independently
    expect(materialCheckbox).toBeChecked() // Default on
    expect(pixelatedCheckbox).toBeChecked()
    expect(gameBoyCheckbox).toBeChecked()
    
    // Disable material mode, others should remain
    await user.click(materialCheckbox)
    expect(materialCheckbox).not.toBeChecked()
    expect(pixelatedCheckbox).toBeChecked()
    expect(gameBoyCheckbox).toBeChecked()
    
    // Verify all callbacks were called
    expect(mockOnShowMaterialChange).toHaveBeenCalledWith(false)
    expect(mockOnPixelatedModeChange).toHaveBeenCalledWith(true)
    expect(mockOnGameBoyModeChange).toHaveBeenCalledWith(true)
  })
})