/* eslint-env browser, node */
import { useRouter } from 'next/router';
import Layout from '../components/layout';
import { useEffect } from 'react';
import { getStandups } from '../api';
import { Typography, Container } from '@material-ui/core';

const SignInButton = ({ redirect_uri }) => {
  const linkHref = `https://slack.com/oauth/authorize?scope=identity.basic&client_id=2168708159.732663285622&redirect_uri=${redirect_uri}`;
  return (
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
};

const Index = props => {
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
      <Container>
        <Layout>
          <Typography style={{ marginBottom: 6 }}>
            Please sign in with Slack to access your standups.
          </Typography>
          <SignInButton redirect_uri={props.redirect_uri} />
        </Layout>
      </Container>
    );
  } else {
    return null;
  }
};

Index.getInitialProps = async () => {
  let dotenv = eval(`require("dotenv")`);
  dotenv.config();
  return { redirect_uri: process.env.REDIRECT_URI };
};

export default Index;
