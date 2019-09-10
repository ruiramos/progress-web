import {
  IconButton,
  Button,
  AppBar,
  Toolbar,
  Typography,
  NativeSelect,
  InputLabel,
  Grid,
} from '@material-ui/core';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { useRouter } from 'next/router';

const Header = props => {
  const router = useRouter();
  let { grouping } = router.query;
  grouping = grouping || 'day';
  const handleGrouping = (e, value) => {
    value &&
      router.push({
        pathname: '/standups',
        query: { ...router.query, grouping: value },
      }); //`/standups?grouping=${value}`);
  };

  return (
    <Grid item container className="header-root">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
      />
      <style jsx global>
        {`
          .header-root {
            margin-bottom: 16px !important;
          }
          .toolbar-container {
            text-align: right;
          }
          h1 span {
            position: relative;
          }
          h1 span:after {
            position: absolute;
            width: 100%;
            top: 100%;
            margin-top: -6px;
            left: 0;
            border-bottom: 4px solid rgba(0, 0, 0, 0.87);
            content: ' ';
          }
        `}
      </style>
      <Grid item xs>
        <Typography variant="h4" component="h1">
          <span>Progress</span> web ui
        </Typography>
      </Grid>
      {props.inApp ? (
        <Grid item xs={4} className="toolbar-container">
          <InputLabel style={{ display: 'inline-flex', paddingRight: 10 }}>
            Show:
          </InputLabel>
          <ToggleButtonGroup
            size="small"
            value={grouping}
            exclusive
            onChange={handleGrouping}
          >
            <ToggleButton value="day">standups</ToggleButton>
            <ToggleButton value="progress">progress</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      ) : (
        ''
      )}
    </Grid>
  );
};

export default Header;
