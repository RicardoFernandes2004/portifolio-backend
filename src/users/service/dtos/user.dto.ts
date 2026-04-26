export interface CreateUserDto {
    username: string;
    email: string;
    password: string;
}

export interface UpdateUserDto {
    username?: string;
    email?: string;
    password?: string;
}
export interface LoginUserDto {
    email?: string;
    username?: string;
    password: string;
}
export interface UserResponseDto {
    id: number;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface LoginUserResponseDto {
    user: UserResponseDto;
    token: string;
    tokenExpiresAt: Date;
}
