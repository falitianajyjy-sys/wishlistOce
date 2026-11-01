export interface Gift {
    id: number;
    name: string;
    emoji: string;
    description: string | null;
    imageUrl: string | null;
    claimedBy: string | null;
    claimedAt: Date | null;
    createdAt: Date;
}

export interface NewGift {
    name: string;
    emoji?: string;
    description?: string | null;
    imageUrl?: string | null;
}

export interface GuestGift {
    id: number;
    name: string;
    emoji: string;
    description: string | null;
    imageUrl: string | null;
    mine: boolean;
}

export interface AdminGift {
    id: number;
    name: string;
    emoji: string;
    description: string | null;
    imageUrl: string | null;
    claimed: boolean;
}