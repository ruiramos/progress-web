import Header from './header';
import { Grid, Container } from '@material-ui/core';

const Layout = props => (
  <div>
    <style jsx>
      {`
        div {
          padding: 32px;
          padding-bottom: 0;
        }
      `}
    </style>
    <Grid container spacing={2}>
      <Header {...props} />
      <Grid item xs={12}>
        {props.children}
      </Grid>
    </Grid>
  </div>
);

export default Layout;
