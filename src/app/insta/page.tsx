import InstaGallery from '@/components/insta/insta-gallery';
import manifest from '@/data/insta-manifest.json';
import type { InstaManifest } from '@/types/insta';

export default function InstaPage() {
	const { items } = manifest as InstaManifest;
	const _posts = items.filter((i) => i.category === 'posts');
	const _stories = items.filter((i) => i.category === 'stories');

	return (
		<div className='animate-fade-in animation-delay-2'>
			<InstaGallery items={items} />
		</div>
	);
}
