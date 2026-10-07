export interface SecurityQuestionAnswer {
    question: string;
    answer: string;
}

/** Body of `POST account/register` */
export interface RegistrationForm {
    username: string;
    password: string;
    email: string;
    securityQuestions: SecurityQuestionAnswer[];
}

/** Body of `POST account/resetpasswordstart` */
export interface ResetPasswordStartRequest {
    email: string;
}

/** Body of `POST account/resetpasswordquestions` */
export interface ResetPasswordQuestionsRequest {
    email: string;
    questions: SecurityQuestionAnswer[];
}

/** Body of `POST account/resetpassword` */
export interface ResetPasswordRequest {
    token: string;
    email: string;
    newPassword: string;
}

/** Body of `POST account/changepassword` */
export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}
