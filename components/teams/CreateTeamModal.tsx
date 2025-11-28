'use client';

import { useState } from 'react';
import { Modal, Button, Input, Textarea } from '@/components/ui';
import { useCreateTeam } from '@/hooks/useTeams';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTeamModal({ isOpen, onClose }: CreateTeamModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  
  const createTeam = useCreateTeam();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Team name is required');
      return;
    }

    try {
      await createTeam.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create team');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="✨ Create New Team"
      color="cyan"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Team Name"
          placeholder="Enter team name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          color="cyan"
          maxLength={50}
          required
        />

        <Textarea
          label="Description (optional)"
          placeholder="What is this team about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          color="cyan"
          rows={3}
          maxLength={200}
        />

        {error && (
          <p className="text-[var(--neon-pink)] text-sm">{error}</p>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createTeam.isPending}
          >
            {createTeam.isPending ? '⏳ Creating...' : '🚀 Create Team'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

