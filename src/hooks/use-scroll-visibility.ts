import { useEffect, useState } from 'react';

const useScrollVisibility = (hideThreshold = 180) => {
	const [isVisible, setIsVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > hideThreshold) setIsVisible(false);
			if (window.scrollY < lastScrollY) setIsVisible(true);
			setLastScrollY(window.scrollY);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [lastScrollY, hideThreshold]);

	return isVisible;
};

export default useScrollVisibility;
