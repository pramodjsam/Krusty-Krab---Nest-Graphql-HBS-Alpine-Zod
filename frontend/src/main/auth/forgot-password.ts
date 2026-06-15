import {
  ForgotPasswordDocument,
  ForgotPasswordMutation,
  ForgotPasswordMutationVariables,
  ResetPasswordDocument,
  ResetPasswordMutation,
  ResetPasswordMutationVariables,
  VerifyTokenDocument,
  VerifyTokenMutation,
  VerifyTokenMutationVariables,
} from '@/generated/graphql';
import { graphqlRequest } from '@/shared/graphqlClient';
import { notyNotification } from '@/shared/notification';
import {
  forgotPasswordFormOne,
  forgotPasswordFormThree,
  forgotPasswordFormTwo,
} from '@/types';

type ForgotPassword = {
  errors: Record<string, string>;
  loading: boolean;
  form1Info: {
    email: string;
  };
  form2Info: {
    code: number;
  };
  form3Info: {
    password: string;
    confirmPassword: string;
  };
  activeStep: number;
  sendResetToken(): Promise<void>;
  confirmResetToken(): Promise<void>;
  resetPassword(): Promise<void>;
  goToPreviousStep(): void;
};

export function forgotPassword(): ForgotPassword {
  return {
    errors: {},
    loading: false,
    form1Info: {
      email: '',
    },
    form2Info: {
      code: 0,
    },
    form3Info: {
      password: '',
      confirmPassword: '',
    },
    activeStep: 1,
    goToPreviousStep() {
      if (this.activeStep > 1) {
        this.activeStep -= 1;
      } else {
        window.location.href = '/auth/login';
      }
    },
    async sendResetToken() {
      try {
        this.loading = true;

        const parseResult = await forgotPasswordFormOne.safeParse(
          this.form1Info,
        );

        if (parseResult.error) {
          const fieldErrors: Record<string, string> = {};

          parseResult.error.issues.forEach((issue) => {
            const field = issue.path[0] as string;

            if (!fieldErrors[field]) {
              fieldErrors[field] = issue.message;
            }
          });

          this.errors = fieldErrors;
          notyNotification('Please fix the errors', 'error');
          return;
        }

        const variables = {
          sendReset: {
            email: this.form1Info.email,
          },
        };
        const result = await graphqlRequest<
          ForgotPasswordMutation,
          ForgotPasswordMutationVariables
        >(ForgotPasswordDocument, variables);

        if (result.data) {
          this.activeStep++;
        } else {
          throw new Error(result.error.message);
        }
      } catch {
        notyNotification('Something went wrong', 'error');
      } finally {
        this.loading = false;
      }
    },
    async confirmResetToken() {
      try {
        this.loading = true;

        const parseResult = forgotPasswordFormTwo.safeParse(this.form2Info);

        if (parseResult.error) {
          const fieldErrors: Record<string, string> = {};

          parseResult.error.issues.forEach((issue) => {
            const field = issue.path[0] as string;

            if (!fieldErrors[field]) {
              fieldErrors[field] = issue.message;
            }
          });

          this.errors = fieldErrors;
          notyNotification('Please fix the errors', 'error');
          return;
        }

        const variables = {
          verifyToken: {
            email: this.form1Info.email,
            resetToken: Number(this.form2Info.code),
          },
        };
        const result = await graphqlRequest<
          VerifyTokenMutation,
          VerifyTokenMutationVariables
        >(VerifyTokenDocument, variables);

        if (result.data) {
          this.activeStep++;
        } else {
          throw new Error(result.error.message);
        }
      } catch {
        notyNotification('Something went wrong', 'error');
      } finally {
        this.loading = false;
      }
    },
    async resetPassword() {
      try {
        this.loading = true;

        const parseResult = forgotPasswordFormThree.safeParse(this.form3Info);

        console.log(parseResult);
        if (parseResult.error) {
          const fieldErrors: Record<string, string> = {};

          parseResult.error.issues.forEach((issue) => {
            const field = issue.path[0] as string;

            if (!fieldErrors[field]) {
              fieldErrors[field] = issue.message;
            }
          });

          this.errors = fieldErrors;
          notyNotification('Please fix the errors', 'error');
          return;
        }

        const variables = {
          resetPassword: {
            email: this.form1Info.email,
            resetToken: Number(this.form2Info.code),
            password: this.form3Info.password,
            confirmPassword: this.form3Info.confirmPassword,
          },
        };
        const result = await graphqlRequest<
          ResetPasswordMutation,
          ResetPasswordMutationVariables
        >(ResetPasswordDocument, variables);

        if (result.data) {
          notyNotification('Password resetted successfully', 'success');
          window.location.href = '/auth/login';
        } else {
          throw new Error(result.error.message);
        }
      } catch {
        notyNotification('Something went wrong', 'error');
      } finally {
        this.loading = false;
      }
    },
  };
}
