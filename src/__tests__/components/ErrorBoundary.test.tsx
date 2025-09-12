import { render, screen } from '@testing-library/react'
import { ErrorBoundary, ErrorFallback } from '@/components/ErrorBoundary'

// Component that throws an error for testing
const ThrowError = ({ shouldError }: { shouldError: boolean }) => {
  if (shouldError) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  // Suppress console.error for cleaner test output
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  
  afterAll(() => {
    console.error = originalError
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary fallback={ErrorFallback}>
        <ThrowError shouldError={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('renders error fallback when there is an error', () => {
    const { container } = render(
      <ErrorBoundary fallback={ErrorFallback}>
        <ThrowError shouldError={true} />
      </ErrorBoundary>
    )
    
    // Check that the fallback component is rendered (Three.js elements are rendered as custom elements)
    expect(container.querySelector('group')).toBeInTheDocument()
  })

  it('logs error to console when error occurs', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    render(
      <ErrorBoundary fallback={ErrorFallback}>
        <ThrowError shouldError={true} />
      </ErrorBoundary>
    )
    
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})

describe('ErrorFallback', () => {
  const mockError = new Error('Test error message')
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

  afterEach(() => {
    consoleSpy.mockClear()
  })

  afterAll(() => {
    consoleSpy.mockRestore()
  })

  it('logs error message to console', () => {
    // Temporarily capture console.error during render
    const originalConsoleError = console.error
    const mockConsoleError = jest.fn()
    console.error = mockConsoleError
    
    render(<ErrorFallback error={mockError} />)
    
    expect(mockConsoleError).toHaveBeenCalledWith('Model loading failed:', 'Test error message')
    
    // Restore console.error
    console.error = originalConsoleError
  })

  it('renders fallback 3D components', () => {
    // Suppress expected console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    const { container } = render(<ErrorFallback error={mockError} />)
    
    // Check that it renders a group with mesh children (Three.js elements are rendered as custom elements)
    expect(container.querySelector('group')).toBeInTheDocument()
    expect(container.querySelectorAll('mesh')).toHaveLength(3)
    
    // Verify the expected error was logged
    expect(consoleSpy).toHaveBeenCalledWith('Model loading failed:', 'Test error message')
    
    consoleSpy.mockRestore()
  })

  it('renders error indicator and placeholder weapon', () => {
    // Suppress expected console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    const { container } = render(<ErrorFallback error={mockError} />)
    
    const meshes = container.querySelectorAll('mesh')
    expect(meshes).toHaveLength(3)
    
    // Error indicator (red box)
    expect(meshes[0]).toHaveAttribute('position', '0,1,0')
    
    // Placeholder weapon parts  
    expect(meshes[1]).toHaveAttribute('position', '0,-0.5,0')
    expect(meshes[2]).toHaveAttribute('position', '0,1,0')
    
    // Verify the expected error was logged
    expect(consoleSpy).toHaveBeenCalledWith('Model loading failed:', 'Test error message')
    
    consoleSpy.mockRestore()
  })
})