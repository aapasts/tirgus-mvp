'use client';

import { Button } from '@/components/ui/button';

export default function ContactButton() {
    const handleContact = () => {
        alert('Sazināties: +371 20000000');
    };

    return (
        <Button onClick={handleContact} className="w-full md:w-auto">
            Sazināties
        </Button>
    );
}
