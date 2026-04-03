import InstaGallery from '@/components/insta/insta-gallery';
import manifest from '@/data/insta-manifest.json';
import type { InstaManifest } from '@/types/insta';

export default function InstaPage() {
	const { items } = manifest as InstaManifest;
	const posts = items.filter((i) => i.category === 'posts');
	const stories = items.filter((i) => i.category === 'stories');

	return (
		<div className='py-8'>
			<InstaGallery items={items} />
		</div>
	);
}
