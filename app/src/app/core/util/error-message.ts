import { HttpErrorResponse } from '@angular/common/http';

/** Extracts a user-presentable message from whatever a failed request threw. */
export function getErrorMessage(error: unknown): string | null {
    if (error instanceof HttpErrorResponse) {
        const body = error.error;
        if (typeof body === 'string' && body.length > 0) {
            return body;
        }
        if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
            return body.message;
        }
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return typeof error === 'string' ? error : null;
}
