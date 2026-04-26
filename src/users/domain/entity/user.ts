
export class User {
    private readonly id: number;
    private readonly username: string;
    private readonly email: string;
    private readonly password: string;
    private readonly jwtToken: string;
    private readonly jwtTokenExpiresAt: Date;
    private readonly jwtTokenCreatedAt: Date;
    private readonly jwtTokenUpdatedAt: Date;
    private readonly createdAt: Date;
    private readonly updatedAt: Date;

    constructor(private readonly user: User) {
        this.id = user.id;
        this.username = user.username;
        this.email = user.email;
        this.password = user.password;
        this.jwtToken = user.jwtToken;
        this.jwtTokenExpiresAt = user.jwtTokenExpiresAt;
        this.jwtTokenCreatedAt = user.jwtTokenCreatedAt;
        this.jwtTokenUpdatedAt = user.jwtTokenUpdatedAt;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    }



}