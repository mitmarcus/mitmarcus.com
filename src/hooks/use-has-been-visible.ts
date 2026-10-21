import { type RefObject, useEffect, useState } from 'react';

const useHasBeenVisible = (
	ref: RefObject<HTMLElement | null>,
	rootMargin?: string,
) => {
	const [hasBeenVisible, setHasBeenVisible] = useState(false);

	useEffect(() => {
		if (!ref.current || hasBeenVisible) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setHasBeenVisible(true);
				}
			},
			{ rootMargin },
		);

		observer.observe(ref.current);

		return () => observer.disconnect();
	}, [ref, rootMargin, hasBeenVisible]);

	return hasBeenVisible;
};

export default useHasBeenVisible;
