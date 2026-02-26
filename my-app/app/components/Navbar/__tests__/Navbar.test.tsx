import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Navbar from '../Navbar';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/dictionaries/en.json', () => ({
  appName: 'Library Management',
  home: 'Home',
  books: 'Books',
  login: 'Login',
  signup: 'Signup',
  language: 'Language',
}));

jest.mock('@/dictionaries/fr.json', () => ({
  appName: 'Gestion de Bibliothèque',
  home: 'Accueil',
  books: 'Livres',
  login: 'Connexion',
  signup: 'Inscription',
  language: 'Langue',
}));

jest.mock('@/dictionaries/ar.json', () => ({
  appName: 'إدارة المكتبة',
  home: 'الرئيسية',
  books: 'الكتب',
  login: 'تسجيل الدخول',
  signup: 'التسجيل',
  language: 'اللغة',
}));

const mockUseParams = useParams as jest.Mock;
const mockUsePathname = usePathname as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

describe('Navbar', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    mockUseParams.mockReturnValue({ lang: 'en' });
    mockUsePathname.mockReturnValue('/en');
    mockUseRouter.mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  it('renders the navbar with logo and navigation items', () => {
    render(<Navbar />);

    expect(screen.getByText('Library Management')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Books')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('changes language when language menu item is clicked', () => {
    render(<Navbar />);

    const translateButton = screen.getByRole('button', { name: /translate/i });
    fireEvent.click(translateButton);

    const frenchOption = screen.getByText('Français');
    fireEvent.click(frenchOption);

    expect(mockRouter.push).toHaveBeenCalledWith('/fr');
  });

  it('toggles mobile drawer', () => {
    render(<Navbar />);

    const menuButton = screen.getByRole('button', { name: /open drawer/i });
    fireEvent.click(menuButton);

    expect(screen.getByText('Library Management')).toBeInTheDocument();
  });

  it('navigates to signup when on login page', () => {
    mockUsePathname.mockReturnValue('/en/login');

    render(<Navbar />);

    const button = screen.getByRole('button', { name: /signup/i });
    expect(button).toBeInTheDocument();
  });
});