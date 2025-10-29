import { signInWithPassword } from "../(auth)/actions";

import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center">
      <LoginForm action={signInWithPassword} />;
    </div>
  );
};

export default LoginPage;
