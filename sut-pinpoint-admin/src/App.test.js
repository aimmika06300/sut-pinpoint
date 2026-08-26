import { render, screen } from '@testing-library/react';
import App from './App';

test('renders PIN POINT brand text or login screen', () => {
  render(<App />);
  const linkElement = screen.getByText(/SUT PIN POINT|PIN POINT/i);
  expect(linkElement).toBeInTheDocument();
});