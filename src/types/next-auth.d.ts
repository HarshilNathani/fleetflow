import { DefaultSession } from 'next-auth';
import { UserRole } from "@/types/user"

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: UserRole;
        } & DefaultSession['user'];
    }

    interface User {
        role: UserRole;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: UserRole;
    }
}

declare global {
    var mongoose: {
        conn: any;
        promise: Promise<any> | null;
    };
}
