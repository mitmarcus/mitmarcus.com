import { useEffect, useRef, useState } from 'react';

const useScrollVisibility = (hideThreshold = 180, delta = 40) => {
	const [isVisible, setIsVisible] = useState(true);
	const anchor = useRef(0);

	useEffect(() => {
		const handleScroll = () => {
			const y = window.scrollY;
			const diff = y - anchor.current;

			if (y <= hideThreshold) setIsVisible(true);
			else if (diff > delta) setIsVisible(false);
			else if (diff < -delta) setIsVisible(true);
			else return;

			anchor.current = y;
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [hideThreshold, delta]);

	return isVisible;
};

export default useScrollVisibility;
