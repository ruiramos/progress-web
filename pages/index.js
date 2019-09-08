/* eslint-env browser, node */
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getStandups } from '../api';

const redirect_uri = process.env.REDIRECT_URI;
const linkHref = `https://slack.com/oauth/authorize?scope=identity.basic&client_id=2168708159.732663285622&redirect_uri=${redirect_uri}`;

const SignInButton = () => (
  <a href={linkHref}>
    <img
      alt="Sign in with Slack"
      height="40"
      width="172"
      src="https://platform.slack-edge.com/img/sign_in_with_slack.png"
      srcSet="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x"
    />
  </a>
);

const Index = () => {
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    if (token) {
      window.localStorage.setItem('token', token);
      window.location.href = '/standups';
    } else if (window.localStorage.getItem('token')) {
      window.location.href = '/standups';
    }
  }, [token]);

  if (!token) {
    return (
      <div>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <SignInButton />
      </div>
    );
  } else {
    return null;
  }
};

export default Index;
