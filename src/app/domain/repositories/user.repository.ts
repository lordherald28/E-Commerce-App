import { Observable } from "rxjs";
import { User } from "../models/user.model";

export abstract class AuthRepository {
    abstract AuthUser(user: User): Observable<User | null>;
}