export interface EngagementRepositoryPort {
    like(postId: number, ipHash: string): Promise<void>;
    unlike(postId: number, ipHash: string): Promise<void>;
    hasLiked(postId: number, ipHash: string): Promise<boolean>;
    countLikes(postId: number): Promise<number>;
    registerView(postId: number, ipHash: string): Promise<void>;
    countViews(postId: number): Promise<number>;
}
