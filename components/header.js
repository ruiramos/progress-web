import {
  IconButton,
  Button,
  AppBar,
  Toolbar,
  Typography,
  NativeSelect,
  InputLabel,
  Menu,
  MenuItem,
  Grid,
  Link,
} from '@material-ui/core';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { useRouter } from 'next/router';
import AccountCircle from '@material-ui/icons/AccountCircle';

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

  const handleLogout = e => {
    e.preventDefault();
    window.localStorage.removeItem('token');
    window.location.href = '/';
  };

  const [anchorEl, setAnchorEl] = React.useState(null);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

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
            background: #f3f3f3;
            padding: 8px 6px;
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
          <IconButton
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleClick}
            style={{ marginLeft: 12, color: '#aaa' }}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Grid>
      ) : (
        ''
      )}
    </Grid>
  );
};

export default Header;
