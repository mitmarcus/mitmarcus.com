import InstaGallery from '@/components/insta/insta-gallery';
import manifest from '@/data/insta-manifest.json';
import type { InstaManifest } from '@/types/insta';

export default function InstaPage() {
	const { items } = manifest as InstaManifest;
	const posts = items.filter((i) => i.category === 'posts');
	const stories = items.filter((i) => i.category === 'stories');

	return (
		<div className='py-8'>
			<div className='mb-8'>
				<h1 className='text-2xl font-bold text-foreground'>
					Instagram Archive
				</h1>
				<p className='mt-1 text-sm text-muted-foreground'>
					Quality is from the export
				</p>
			</div>
			<InstaGallery items={items} />
		</div>
	);
}
