import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WelcomePage from '../pages/WelcomePage';
import { useGuest } from '../contexts/GuestContext';
import { useAuth } from '../contexts/AuthContext';

// Mocks
jest.mock('../contexts/GuestContext', () => ({
  useGuest: jest.fn(),
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('WelcomePage', () => {
  const guestBrowseMock = jest.fn();

  beforeEach(() => {
    useGuest.mockReturnValue({ guestBrowse: guestBrowseMock });
    useAuth.mockReturnValue({ user: null }); // Simulate no user logged in
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders welcome text and guest button', () => {
    render(<WelcomePage />);

    expect(screen.getByText(/Welcome to Our Kitchen/i)).toBeInTheDocument();
    expect(screen.getByText(/Home-cooked Arab meals/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue as Guest/i })).toBeInTheDocument();
  });

  test('opens modal when "Continue as Guest" is clicked', async () => {
    const user = userEvent.setup();
    render(<WelcomePage />);

    await user.click(screen.getByRole('button', { name: /Continue as Guest/i }));
    expect(screen.getByText(/Where Are You Located/i)).toBeInTheDocument();
  });

  test('inputs update and guestBrowse is called on continue', async () => {
    const user = userEvent.setup();
    render(<WelcomePage />);

    await user.click(screen.getByRole('button', { name: 'Continue as Guest' }));

    const stateInput = screen.getByPlaceholderText(/State/i);
    const cityInput = screen.getByPlaceholderText(/City/i);
    const continueButton = screen.getByRole('button', { name: 'Continue' });

    await user.type(stateInput, 'California');
    await user.type(cityInput, 'Los Angeles');
    await user.click(continueButton);

    expect(guestBrowseMock).toHaveBeenCalledWith({ state: 'California', city: 'Los Angeles' });
  });

  test('continue button is disabled when inputs are empty', async () => {
    const user = userEvent.setup();
    render(<WelcomePage />);

    await user.click(screen.getByRole('button', { name: 'Continue as Guest' }));
    const continueButton = screen.getByRole('button', { name: 'Continue' });

    expect(continueButton).toBeDisabled();
  });
});
