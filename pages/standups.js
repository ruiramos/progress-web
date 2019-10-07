/* eslint-env browser */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getStandups, getUsers } from '../api';
import moment from 'moment';
import nl2br from 'react-nl2br';
import emoji from 'node-emoji';
import Linkify from 'react-linkify';
import Link from 'next/link';
import {
  Button,
  Grid,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from '@material-ui/core';
import Layout from '../components/layout';
import MuiLink from '@material-ui/core/Link';

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

moment.updateLocale('en', {
  week: {
    dow: 1, // First day of week is Monday
  },
});

const GROUPINGS = {
  day: 'day',
  progress: 'progress',
};

function getUsersFromStandups(standups, numDays) {
  let usersIndex = standups.reduce((acc, standup) => {
    acc[standup.username] = {
      username: standup.username,
      real_name: standup.real_name,
      avatar_url: standup.avatar_url,
      standups: new Array(numDays).fill(),
    };

    return acc;
  }, {});

  return usersIndex;
}

function getDatesArray(dateFrom, dateTo) {
  let numDays = dateTo.diff(dateFrom, 'days') + 1;
  let dates = new Array(numDays).fill().map((_, i) => {
    return dateFrom.clone().add(i, 'days');
  });

  return dates;
}

function getTableData(raw, dates) {
  let users = getUsersFromStandups(raw, dates.length);

  raw.forEach(standup => {
    let i = moment(standup.date).diff(dates[0], 'days');
    users[standup.username].standups[i] = standup;
  });

  return Object.keys(users).map(username => users[username]);
}

const EmptyStandup = () => {
  return <h4 style={{ color: '#aaa' }}>No entry today</h4>;
};

const Done = ({ done, view }) => {
  let val = Math.round(done * 100);
  let color = val > 70 ? 'green' : val < 20 ? 'red' : '#f7e314';
  let style = view == GROUPINGS.day ? { marginTop: -4 } : {};
  return (
    <div className="done-indicator" style={style}>
      <div className="donut-chart">
        <svg viewBox="0 0 32 32">
          <circle
            r="16"
            cx="16"
            cy="16"
            style={{ strokeDasharray: `${100 - val} 100`, fill: `${color}` }}
          />
        </svg>
        <div className="donut-center">{val}%</div>
      </div>
    </div>
  );
};

const Standup = ({ prev_day, day, blocker, next, grouping, done = [] }) => {
  if (!prev_day && !day & !blocker) return <EmptyStandup />;

  const onMissing = name =>
    name === 'tick' ? emoji.emojify(':white_check_mark:') : `:${name}:`;

  const formatText = s =>
    s ? (
      <Linkify>{nl2br(entities.decode(emoji.emojify(s, onMissing)))}</Linkify>
    ) : null;

  const formatDayText = s =>
    s
      ? s.split('\n').map((line, i) => (
          <p
            key={i}
            className={`day-text ${
              done && done.includes(i + 1) ? 'day-text-done' : ''
            }`}
          >
            <Linkify>{entities.decode(emoji.emojify(line, onMissing))}</Linkify>
          </p>
        ))
      : null;

  if (grouping == GROUPINGS.day) {
    return (
      <div>
        <h4>Previous day:</h4>
        <p>{formatText(prev_day) || '-'}</p>

        {done && day ? (
          <Done
            done={done.length / (day.split('\n').length || 1)}
            view={grouping}
          />
        ) : (
          ''
        )}
        <h4>Today:</h4>
        <div>{formatDayText(day) || '-'}</div>

        <h4>Blockers:</h4>
        <p>{formatText(blocker) || '-'}</p>
      </div>
    );
  } else if (grouping == GROUPINGS.progress) {
    return (
      <div>
        {done && day ? (
          <Done
            done={done.length / (day.split('\n').length || 1)}
            view={grouping}
          />
        ) : (
          ''
        )}
        <h4>Today:</h4>
        <p>{formatDayText(day) || '-'}</p>

        <h4>Today extra:</h4>
        <p>
          {(next && next.prev_day ? formatText(next.prev_day) : '-') || '-'}
        </p>
      </div>
    );
  }
};

const User = ({ avatar_url, username, real_name }) => {
  return (
    <span>
      <h4>{real_name}</h4>
      <img src={avatar_url} />
    </span>
  );
};

const DateTh = ({ date }) => (
  <TableCell className="date-th">
    <style jsx global>
      {`
        .date-th {
          width: 18%;
        }
      `}
    </style>
    <h3>{date.format('dddd')}</h3>
    <p>{date.format('DD MMM YYYY')}</p>
  </TableCell>
);

const Standups = () => {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState({});
  const [dates, setDates] = useState([]);

  const router = useRouter();
  let { weekDif, grouping } = router.query;

  grouping = grouping || GROUPINGS.progress;
  weekDif = +weekDif || 0;

  useEffect(() => {
    async function fetchData() {
      let users = await getUsers();
      setUsers(users);
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!window.localStorage.getItem('token')) {
        window.location.href = '/';
        return;
      }

      const dateFrom = moment()
        .utc()
        .add(weekDif, 'weeks')
        .startOf('week');
      const dateTo = moment()
        .utc()
        .add(weekDif, 'weeks')
        .endOf('week')
        .day(-2);

      let data = await getStandups(dateFrom, dateTo);
      let datesArray = getDatesArray(dateFrom, dateTo);
      setDates(datesArray);
      setData(getTableData(data.standups, datesArray));
    }

    fetchData();
  }, [weekDif]);

  let sortedData = data.sort((a, b) => {
    console.log(users.user, a.username, b.username);
    if (!users.user) return 0;
    if (a.username === users.user.id) return -1;
    if (b.username === users.user.id) return 1;
    return 0;
  });

  return (
    <Layout inApp={true}>
      <Grid container>
        <Grid item xs={6} style={{ textAlign: 'left', marginBottom: 6 }}>
          <Link href={{ query: { ...router.query, weekDif: weekDif - 1 } }}>
            <Button variant="outlined" size="small">
              &lt; Prev week
            </Button>
          </Link>
        </Grid>
        <Grid item xs={6} style={{ textAlign: 'right' }}>
          <Link href={{ query: { ...router.query, weekDif: weekDif + 1 } }}>
            <Button variant="outlined" size="small">
              Next week &gt;
            </Button>
          </Link>
        </Grid>
      </Grid>
      <div>
        <style jsx global>
          {`
            html,
            body {
              margin: 0;
              padding: 0;
              background: #fefefe;
            }

            html .MuiToggleButton-root,
            html .MuiButton-root {
              color: rgba(0, 0, 0, 0.67);
              background: white;
            }

            .standups-table {
              border-collapse: collapse;
              border: 1px solid #dfdfdf;
              background: white;
            }

            .standups-table td {
              vertical-align: top;
            }

            .standups-table td a {
              word-break: break-all;
            }

            .standups-table tr:nth-child(2n) td {
              background: #fafafa;
            }

            p.day-text {
              padding: 4px;
              margin: 2px 0;
            }

            p.day-text.day-text-done {
              background: rgba(204, 255, 206, 0.48);
            }

            .done-indicator {
              float: right;
              margin-top: -9px;
            }

            .donut-chart {
              height: 40px;
              width: 40px;
              position: relative;
            }

            .donut-chart svg {
              width: 100%;
              height: 100%;
              transform: rotate(-90deg);
              background: rgba(0, 0, 0, 0.3);
              border-radius: 50%;
            }

            .donut-chart circle {
              fill: green;
              stroke: #fff;
              stroke-width: 32;
              stroke-dasharray: 0 100;
              transition: stroke-dasharray 0.5s ease;
            }

            .donut-center {
              background: #fff;
              border-radius: 50%;
              position: absolute;
              height: 80%;
              width: 80%;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              line-height: 34px;
              font-weight: 600;
              text-align: center;
              font-size: 0.8em;
            }
          `}
        </style>
        <Table stickyHeader={true} className="standups-table">
          <TableHead>
            <TableRow>
              <TableCell>Users</TableCell>
              {dates.map((date, i) => (
                <DateTh date={date} key={i} />
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map(user => (
              <TableRow>
                <TableCell>
                  <User {...user} />
                </TableCell>
                {user.standups.map((standup, i) => (
                  <TableCell>
                    <Standup
                      {...standup}
                      next={user.standups[i + 1]}
                      grouping={grouping}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
};

Standups.getInitialProps = async () => {
  return {};
};

export default Standups;
