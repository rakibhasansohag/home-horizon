import { useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContext';

const ThemeProvider = ({ children }) => {
	const [theme, setTheme] = useState('light');

	useEffect(() => {
		const saved = localStorage.getItem('theme') || 'light';
		setTheme(saved);
		document.documentElement.classList.toggle('dark', saved === 'dark');
	}, []);

	const toggleTheme = () => {
		const newTheme = theme === 'dark' ? 'light' : 'dark';
		setTheme(newTheme);
		localStorage.setItem('theme', newTheme);
		document.documentElement.classList.toggle('dark', newTheme === 'dark');
	};

	const themeInfo = {
		theme,
		toggleTheme,
		setTheme,
	};

	return <ThemeContext value={themeInfo}>{children}</ThemeContext>;
};

export default ThemeProvider;
