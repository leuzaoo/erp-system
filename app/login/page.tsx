import { signInWithPassword } from "../(auth)/actions";

import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  return <LoginForm action={signInWithPassword} />;
};

export default LoginPage;
