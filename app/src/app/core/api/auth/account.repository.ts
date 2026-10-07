import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api-client';
import { ACCOUNT_API_URL } from '../api-routes';
import {
    ChangePasswordRequest,
    RegistrationForm,
    ResetPasswordQuestionsRequest,
    ResetPasswordRequest,
    ResetPasswordStartRequest
} from '../models/auth/account.model';

/** `AccountController` (`account`). */
@Injectable({ providedIn: 'root' })
export class AccountRepository {
    private api = inject(ApiClient);
    private readonly url = ACCOUNT_API_URL;

    /** The fixed list of security questions a user can pick from. */
    getSecurityQuestions(): Observable<string[]> {
        return this.api.get<string[]>(`${this.url}/questions`);
    }

    register(form: RegistrationForm): Observable<void> {
        return this.api.post<void, RegistrationForm>(`${this.url}/register`, form);
    }

    /** Roles of the signed-in user. */
    getUserRoles(): Observable<string[]> {
        return this.api.get<string[]>(`${this.url}/roles`, { auth: true });
    }

    resetPasswordStart(request: ResetPasswordStartRequest): Observable<string[]> {
        return this.api.post<string[], ResetPasswordStartRequest>(`${this.url}/resetpasswordstart`, request);
    }

    resetPasswordQuestions(request: ResetPasswordQuestionsRequest): Observable<string> {
        return this.api.post<string, ResetPasswordQuestionsRequest>(`${this.url}/resetpasswordquestions`, request);
    }

    resetPassword(request: ResetPasswordRequest): Observable<void> {
        return this.api.post<void, ResetPasswordRequest>(`${this.url}/resetpassword`, request);
    }

    changePassword(request: ChangePasswordRequest): Observable<void> {
        return this.api.post<void, ChangePasswordRequest>(`${this.url}/changepassword`, request, { auth: true });
    }
}
