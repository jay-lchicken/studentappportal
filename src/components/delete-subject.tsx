'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface DeleteSubjectProps {
    subjectId: string;
    subjectName: string;
}

export function DeleteSubject({ subjectId, subjectName }: DeleteSubjectProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            const response = await fetch(`/api/subjects?id=${subjectId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Subject deleted successfully');
                setIsOpen(false);
                router.refresh();
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to delete subject');
            }
        } catch (error) {
            console.error('Error deleting subject:', error);
            toast.error('An error occurred while deleting the subject');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-0"
                >
                    <Trash2 className="h-3 w-3" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Subject</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete "{subjectName}"? This action cannot be undone and will only work if there are no exams associated with this subject.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
