import {notFound} from 'next/navigation';

// Admin-only publishing MVP: this formerly public intake URL must always be a 404.
export default function Page():never { return notFound(); }
