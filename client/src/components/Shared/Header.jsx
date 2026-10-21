import { Moon, Sun, Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import { AuthContext } from '@/context/AuthContext';
import { Button } from '../ui/button';
import { ThemeContext } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

const navItems = [
	{ path: '/', label: 'Home' },
	{ path: '/all-properties', label: 'All Properties' },
	{ path: '/dashboard', label: 'Dashboard', auth: true },
	{ path: '/auth/login', label: 'Login', guestOnly: true },
	{ path: '/auth/register', label: 'Register', guestOnly: true },
];

export default function Header() {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const { toggleTheme, theme } = useContext(ThemeContext);
	const { user, logOut } = useContext(AuthContext);

	useEffect(() => {
		setOpen(false);
	}, [location.pathname]);

	const handleLogOut = () => {
		setOpen(false);
		logOut()
			.then(() => {
				toast.success('Successfully logged out');
			})
			.catch((err) => {
				console.log(err);
				toast.error(err.message || 'Something went wrong');
			});
	};

	const links = navItems.filter((item) => {
		if (item.auth && !user) return false;
		if (item.guestOnly && user) return false;
		return true;
	});

	const renderLinks = (stacked) =>
		links.map((item) => (
			<NavLink
				to={item.path}
				key={item.label}
				end={item.path === '/'}
				onClick={() => setOpen(false)}
				className={({ isActive }) =>
					cn(
						'inline-flex min-h-11 items-center px-1 text-base font-medium transition-colors duration-200',
						stacked && 'w-full px-3',
						isActive
							? 'text-[oklch(0.55_0.13_250)] dark:text-[oklch(0.75_0.12_250)]'
							: 'text-muted-foreground hover:text-[oklch(0.55_0.13_250)] dark:hover:text-[oklch(0.75_0.12_250)]',
					)
				}
			>
				{item.label}
			</NavLink>
		));

	return (
		<header className='sticky top-0 z-50 w-full border-b border-border bg-surface'>
			<div className='section relative flex h-16 items-center justify-between'>
				<Link
					to='/'
					className='text-xl font-bold text-[oklch(0.55_0.13_250)] dark:text-[oklch(0.75_0.12_250)]'
				>
					HomeHorizon
				</Link>

				<nav
					className='absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex'
					aria-label='Primary'
				>
					{renderLinks(false)}
				</nav>

				<div className='flex items-center justify-end gap-2'>
					<Button
						variant='outline'
						size='icon'
						onClick={toggleTheme}
						aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
					>
						{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
					</Button>

					{user && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type='button'
									className='inline-flex size-11 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none'
									aria-label='Account menu'
								>
									<img
										src={user?.avatar || user?.photoURL}
										alt=''
										className='size-8 rounded-full object-cover'
									/>
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuLabel>Account</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => navigate('/dashboard/profile')}
									className='min-h-11 cursor-pointer'
								>
									View Profile
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={handleLogOut}
									className='min-h-11 cursor-pointer text-danger'
								>
									Logout
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}

					<Button
						variant='ghost'
						size='icon'
						className='md:hidden'
						aria-expanded={open}
						aria-label={open ? 'Close menu' : 'Open menu'}
						onClick={() => setOpen((value) => !value)}
					>
						{open ? <X /> : <Menu />}
					</Button>
				</div>
			</div>

			{open && (
				<nav
					className='border-t border-border bg-background px-4 py-2 md:hidden'
					aria-label='Mobile'
				>
					<div className='flex flex-col'>{renderLinks(true)}</div>
				</nav>
			)}
		</header>
	);
}
